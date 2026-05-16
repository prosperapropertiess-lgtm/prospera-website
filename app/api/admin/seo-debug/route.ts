import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";

async function tryGetToken(scope: string): Promise<{ ok: boolean; token?: string; error?: string }> {
  const json = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!json) return { ok: false, error: "GSC_SERVICE_ACCOUNT_JSON not set" };

  let email: string;
  let key: string;
  try {
    const parsed = JSON.parse(json);
    email = parsed.client_email;
    key   = (parsed.private_key as string).replace(/\\n/g, "\n");
  } catch (e) {
    return { ok: false, error: `JSON parse failed: ${e}` };
  }

  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: email, scope, aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600, iat: now,
  })).toString("base64url");

  let sig: string;
  try {
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(`${header}.${payload}`);
    sig = sign.sign(key, "base64url");
  } catch (e) {
    return { ok: false, error: `JWT sign failed: ${e}` };
  }

  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const body = await res.json();
  if (res.ok) return { ok: true, token: body.access_token?.substring(0, 20) + "..." };
  return { ok: false, error: JSON.stringify(body) };
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [indexing, webmasters] = await Promise.all([
    tryGetToken("https://www.googleapis.com/auth/indexing"),
    tryGetToken("https://www.googleapis.com/auth/webmasters.readonly"),
  ]);

  // Test the actual Search Console API call
  let gscApiResult = null;
  if (webmasters.ok && webmasters.token) {
    const fullToken = webmasters.token; // truncated in display only
    // Re-get the real token
    const { getGSCToken } = await import("@/lib/google-search-console");
    const realToken = await getGSCToken();
    if (realToken) {
      const urlRes = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent("https://www.prosperaproperties.co/")}/searchAnalytics/query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${realToken}` },
          body: JSON.stringify({ startDate: "2026-04-01", endDate: "2026-05-16", dimensions: [] }),
        }
      );
      const urlBody = await urlRes.text();
      const domainRes = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent("sc-domain:prosperaproperties.co")}/searchAnalytics/query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${realToken}` },
          body: JSON.stringify({ startDate: "2026-04-01", endDate: "2026-05-16", dimensions: [] }),
        }
      );
      const domainBody = await domainRes.text();
      gscApiResult = {
        urlPrefix: { status: urlRes.status, body: urlBody },
        domain: { status: domainRes.status, body: domainBody },
      };
    }
  }

  return NextResponse.json({ indexing, webmasters, gscApiResult });
}
