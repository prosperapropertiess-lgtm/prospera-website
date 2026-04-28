const ZOHO_API = "https://www.zohoapis.ca/crm/v2";
const TOKEN_URL = "https://accounts.zohocloud.ca/oauth/v2/token";

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `${TOKEN_URL}?grant_type=refresh_token&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&refresh_token=${process.env.ZOHO_REFRESH_TOKEN}`,
    { method: "POST" }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error("Zoho token refresh failed");
  return data.access_token;
}

export async function upsertZohoContact({
  email,
  name,
  type,
  source,
  note,
}: {
  email: string;
  name?: string;
  type?: string;
  source?: string;
  note?: string;
}) {
  const token = await getAccessToken();

  const [firstName, ...rest] = (name || "").trim().split(" ");
  const lastName = rest.join(" ") || "-";

  const contact = {
    Email: email,
    First_Name: firstName || "-",
    Last_Name: lastName,
    Lead_Source: source || "Website",
    Description: [type ? `Type: ${type}` : "", note || ""].filter(Boolean).join(" | "),
  };

  // Search for existing contact
  const search = await fetch(
    `${ZOHO_API}/Contacts/search?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
  );
  const searchData = await search.json();
  const existing = searchData?.data?.[0];

  if (existing) {
    // Update
    await fetch(`${ZOHO_API}/Contacts/${existing.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [contact] }),
    });
  } else {
    // Create
    await fetch(`${ZOHO_API}/Contacts`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [contact] }),
    });
  }
}
