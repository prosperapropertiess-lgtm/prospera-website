/**
 * HubSpot → Supabase sync cron
 * Runs every hour. Pulls all contacts from HubSpot, upserts into
 * hubspot_contacts, and auto-enrolls new contacts in the right
 * email sequence.
 *
 * Schedule: "0 * * * *" (every hour on the hour)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAgentRun } from "@/lib/agent-logger";
import { SEQUENCES } from "@/lib/email-sequences";

const HUBSPOT_TOKEN  = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const CRON_SECRET    = process.env.CRON_SECRET;

// Fetch all HubSpot contacts (paginated)
async function fetchHubSpotContacts(): Promise<HubSpotContact[]> {
  if (!HUBSPOT_TOKEN) throw new Error("HUBSPOT_PRIVATE_APP_TOKEN not set");

  const contacts: HubSpotContact[] = [];
  let after: string | undefined;

  do {
    const params = new URLSearchParams({
      limit: "100",
      properties: "firstname,lastname,email,phone,contact_type",
    });
    if (after) params.set("after", after);

    const res = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts?${params}`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error(`HubSpot API error: ${res.status}`);

    const data = await res.json();
    contacts.push(...(data.results ?? []));
    after = data.paging?.next?.after;
  } while (after);

  return contacts;
}

interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    contact_type?: string;
  };
}

export async function GET(req: NextRequest) {
  const start = Date.now();

  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  let synced = 0;
  let enrolled = 0;
  let errors = 0;

  try {
    const hubspotContacts = await fetchHubSpotContacts();

    for (const hc of hubspotContacts) {
      const props = hc.properties;
      const name = [props.firstname, props.lastname].filter(Boolean).join(" ").trim() || null;
      const email = props.email?.trim().toLowerCase() || null;
      const contactType = props.contact_type || null;
      const hubspotId = parseInt(hc.id, 10);

      // Upsert into hubspot_contacts
      const { error: upsertErr } = await sb.from("hubspot_contacts").upsert(
        {
          hubspot_id:   hubspotId,
          email:        email,
          name:         name,
          phone:        props.phone || null,
          contact_type: contactType,
          synced_at:    new Date().toISOString(),
        },
        { onConflict: "hubspot_id" }
      );

      if (upsertErr) {
        console.error(`[hubspot-sync] upsert error for ${hubspotId}:`, upsertErr.message);
        errors++;
        continue;
      }
      synced++;

      // Skip enrollment if no email or no valid contact_type sequence
      if (!email || !contactType || !SEQUENCES[contactType]) continue;

      // Check if already enrolled in a sequence
      const { data: existing } = await sb
        .from("email_sequence_state")
        .select("id")
        .eq("hubspot_id", hubspotId)
        .maybeSingle();

      if (existing) continue; // already enrolled

      // Enroll — first email sends immediately (next_send_at = now)
      const { error: enrollErr } = await sb.from("email_sequence_state").insert({
        hubspot_id:     hubspotId,
        email:          email,
        contact_type:   contactType,
        sequence_index: 0,
        next_send_at:   new Date().toISOString(),
        enrolled_at:    new Date().toISOString(),
      });

      if (enrollErr) {
        console.error(`[hubspot-sync] enroll error for ${hubspotId}:`, enrollErr.message);
        errors++;
      } else {
        enrolled++;
      }
    }

    const duration = Date.now() - start;
    await logAgentRun("hubspot-sync", "success", { synced, enrolled, errors }, duration);

    return NextResponse.json({ synced, enrolled, errors });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logAgentRun("hubspot-sync", "error", {}, Date.now() - start, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
