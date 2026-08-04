const HUBSPOT_API = "https://api.hubapi.com/crm/v3/objects/contacts";

/**
 * Fetch all notes for a HubSpot contact and return them as a single
 * concatenated string, newest first. Returns "" if none found.
 */
export async function fetchContactNotes(hubspotId: string | number): Promise<string> {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) return "";

  try {
    // Search for notes associated with this contact
    const res = await fetch("https://api.hubapi.com/crm/v3/objects/notes/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "associations.contact",
                operator: "EQ",
                value: String(hubspotId),
              },
            ],
          },
        ],
        properties: ["hs_note_body", "hs_timestamp"],
        sorts: [{ propertyName: "hs_timestamp", direction: "DESCENDING" }],
        limit: 20,
      }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    const notes: string[] = (data.results ?? [])
      .map((n: { properties: { hs_note_body?: string } }) =>
        (n.properties.hs_note_body ?? "").trim()
      )
      .filter((t: string) => t.length > 0);

    return notes.join("\n\n---\n\n");
  } catch {
    return "";
  }
}

// Maps our internal "type" strings to the actual enum values configured on the
// HubSpot "contact_type" property. Anything not in this map is left unset
// rather than sent through (HubSpot rejects unknown enum values with a 400).
const CONTACT_TYPE_MAP: Record<string, string> = {
  landlord: "potential_landlord",
  selfmanager_landlord: "selfmanager_landlord",
  tenant: "tenant",
  realtor: "realtor",
  client: "client",
};

interface UpsertHubspotContactInput {
  email: string;
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  type?: string | null;
  source?: string | null;
  note?: string | null;
  message?: string | null;
}

/**
 * Upserts a HubSpot contact by email. This is the single write path for every
 * lead source on the site (contact form, subscribe popup, resource downloads).
 * HubSpot is the system of record for leads — Zoho is retired.
 *
 * - On CREATE: sets hs_lead_status = NEW so nothing starts invisible.
 * - On UPDATE: never touches hs_lead_status — that's owned by whoever is
 *   working the lead in HubSpot, a re-submitted form shouldn't reset it.
 */
export async function upsertHubspotContact({
  email,
  name,
  phone,
  city,
  type,
  source,
  note,
  message,
}: UpsertHubspotContactInput): Promise<string | null> {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    console.warn("[hubspot] HUBSPOT_PRIVATE_APP_TOKEN not set — skipping contact sync for", email);
    return null;
  }
  if (!email) return null;

  const [firstname, ...rest] = (name || "").trim().split(" ").filter(Boolean);
  const lastname = rest.join(" ") || undefined;
  const contactType = type ? CONTACT_TYPE_MAP[type.toLowerCase()] : undefined;

  // "message" is HubSpot's default free-text contact property. We fold in
  // source + note here since there's no bespoke property for those yet.
  const combinedMessage = [message, note, source ? `Source: ${source}` : null]
    .filter(Boolean)
    .join("\n\n") || undefined;

  const properties: Record<string, string> = {
    email,
    ...(firstname ? { firstname } : {}),
    ...(lastname ? { lastname } : {}),
    ...(phone ? { phone } : {}),
    ...(city ? { city } : {}),
    ...(contactType ? { contact_type: contactType } : {}),
    ...(combinedMessage ? { message: combinedMessage } : {}),
  };

  try {
    const searchRes = await fetch(`${HUBSPOT_API}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filterGroups: [
          { filters: [{ propertyName: "email", operator: "EQ", value: email }] },
        ],
        limit: 1,
      }),
    });

    if (!searchRes.ok) {
      console.error("[hubspot] search failed:", searchRes.status, await searchRes.text());
      return null;
    }

    const searchData = await searchRes.json();
    const existing = searchData?.results?.[0];

    if (existing) {
      const updateRes = await fetch(`${HUBSPOT_API}/${existing.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ properties }),
      });
      if (!updateRes.ok) {
        console.error("[hubspot] update failed:", updateRes.status, await updateRes.text());
        return null;
      }
      return existing.id as string;
    }

    const createRes = await fetch(HUBSPOT_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: { ...properties, hs_lead_status: "NEW" },
      }),
    });

    if (!createRes.ok) {
      console.error("[hubspot] create failed:", createRes.status, await createRes.text());
      return null;
    }

    const created = await createRes.json();
    return (created?.id as string) ?? null;
  } catch (err) {
    console.error("[hubspot] upsert error:", err instanceof Error ? err.message : err);
    return null;
  }
}
