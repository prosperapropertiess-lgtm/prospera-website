import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGSCToken, getServiceAccountEmail } from "@/lib/google-search-console";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = getServiceAccountEmail();

  // Manually attempt the token exchange to capture the raw error
  let tokenError = "unknown";
  let token: string | null = null;
  try {
    const json = process.env.GSC_SERVICE_ACCOUNT_JSON;
    if (!json) {
      tokenError = "GSC_SERVICE_ACCOUNT_JSON is not set";
    } else {
      const creds = JSON.parse(json);
      const serviceEmail = creds.client_email as string;
      const rawKey = (creds.private_key as string).replace(/\\n/g, "\n");
      const crypto = await import("node:crypto");
      const now = Math.floor(Date.now() / 1000);
      const header  = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
      const payload = Buffer.from(JSON.stringify({
        iss: serviceEmail, scope: "https://www.googleapis.com/auth/webmasters.readonly",
        aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now,
      })).toString("base64url");
      const sign = crypto.createSign("RSA-SHA256");
      sign.update(`${header}.${payload}`);
      const sig = sign.sign(rawKey, "base64url");
      const jwt = `${header}.${payload}.${sig}`;
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
      });
      const body = await res.json();
      if (res.ok) { token = body.access_token; }
      else { tokenError = JSON.stringify(body); }
    }
  } catch (e) { tokenError = String(e); }

  if (!token) {
    return NextResponse.json({ step: "token", ok: false, email, tokenError });
  }

  // Try listing sites to see what properties the service account can access
  const sitesRes = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const sitesBody = await sitesRes.text();

  // Try URL-prefix property
  const urlPrefixRes = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent("https://www.prosperaproperties.co/")}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ startDate: "2026-04-01", endDate: "2026-05-16", dimensions: [] }),
    }
  );
  const urlPrefixBody = await urlPrefixRes.text();

  // Try domain property
  const domainRes = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent("sc-domain:prosperaproperties.co")}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ startDate: "2026-04-01", endDate: "2026-05-16", dimensions: [] }),
    }
  );
  const domainBody = await domainRes.text();

  return NextResponse.json({
    step: "api",
    ok: urlPrefixRes.ok || domainRes.ok,
    email,
    tokenObtained: true,
    sites: { status: sitesRes.status, body: JSON.parse(sitesBody) },
    urlPrefix: { status: urlPrefixRes.status, body: JSON.parse(urlPrefixBody) },
    domain: { status: domainRes.status, body: JSON.parse(domainBody) },
  });
}
