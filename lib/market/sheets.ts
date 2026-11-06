import crypto from "node:crypto";

// Read-only Google Sheets access with the site's existing service account.
// The Sheet must be shared (Viewer) with that account's email.

export const MARKET_SHEET_ID = process.env.MARKET_SHEET_ID || "18EObfz4KTuyIEVq6vKQCpnIdXGlip9ayda-IbrZN2R4";
export const MARKET_SHEET_URL = `https://docs.google.com/spreadsheets/d/${MARKET_SHEET_ID}/edit`;

function credentials(): { email: string; key: string } | null {
  const json = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const p = JSON.parse(json);
      if (p.client_email && p.private_key) return { email: p.client_email, key: String(p.private_key).replace(/\\n/g, "\n") };
    } catch {}
  }
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  return email && key ? { email, key: key.replace(/\\n/g, "\n") } : null;
}

/** The address the Sheet needs to be shared with. Not a secret. */
export function serviceAccountEmail(): string | null {
  return credentials()?.email ?? null;
}

async function token(): Promise<string> {
  const c = credentials();
  if (!c) throw new SheetError("no_credentials", "No Google service account is configured on the server.");
  const now = Math.floor(Date.now() / 1000);
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const input = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({
    iss: c.email, scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })}`;
  const sig = crypto.createSign("RSA-SHA256").update(input).sign(c.key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${input}.${sig}` }),
  });
  if (!res.ok) throw new SheetError("auth_failed", "Google rejected the service account sign-in.");
  return (await res.json()).access_token;
}

export class SheetError extends Error {
  constructor(public code: "no_credentials" | "auth_failed" | "no_access" | "not_found" | "quota" | "failed", message: string) {
    super(message);
  }
}

async function get(url: string, auth: string): Promise<unknown> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${auth}` } });
    if (res.ok) return res.json();
    if (res.status === 403) throw new SheetError("no_access", "The service account can't open the Sheet. Share it with the service account as a Viewer.");
    if (res.status === 404) throw new SheetError("not_found", "The Sheet wasn't found.");
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt + Math.random() * 300));
      continue;
    }
    throw new SheetError(res.status === 429 ? "quota" : "failed", `Google Sheets returned ${res.status}.`);
  }
}

export interface SheetTab { name: string; grid: string[][] }

/** Reads every tab's populated values as text, exactly as the Sheet displays them. */
export async function readMarketSheet(): Promise<{ tabs: SheetTab[]; title: string }> {
  const auth = await token();
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${MARKET_SHEET_ID}`;
  const meta = (await get(`${base}?fields=properties.title,sheets.properties.title`, auth)) as {
    properties: { title: string }; sheets: { properties: { title: string } }[];
  };
  const names = meta.sheets.map((s) => s.properties.title);
  const ranges = names.map((n) => `ranges=${encodeURIComponent(`'${n.replace(/'/g, "''")}'`)}`).join("&");
  const data = (await get(`${base}/values:batchGet?${ranges}&valueRenderOption=FORMATTED_VALUE&majorDimension=ROWS`, auth)) as {
    valueRanges: { values?: unknown[][] }[];
  };
  return {
    title: meta.properties.title,
    tabs: names.map((name, i) => ({ name, grid: (data.valueRanges[i]?.values ?? []).map((r) => r.map((c) => (c == null ? "" : String(c)))) })),
  };
}
