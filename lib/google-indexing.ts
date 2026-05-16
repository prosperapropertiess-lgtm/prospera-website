/**
 * Google Indexing API — submit a URL for immediate crawling.
 * Reads credentials from GSC_SERVICE_ACCOUNT_JSON (full JSON key file),
 * falling back to GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY.
 */

import crypto from "node:crypto";

function getCredentials(): { email: string; key: string } | null {
  // Prefer the full JSON key (already set up in Vercel as GSC_SERVICE_ACCOUNT_JSON)
  const json = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const parsed = JSON.parse(json);
      const email = parsed.client_email as string;
      const key   = (parsed.private_key as string).replace(/\\n/g, "\n");
      if (email && key) return { email, key };
    } catch {
      console.error("[google-indexing] Failed to parse GSC_SERVICE_ACCOUNT_JSON");
    }
  }

  // Fall back to separate env vars
  const email  = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (email && rawKey) {
    return { email, key: rawKey.replace(/\\n/g, "\n") };
  }

  return null;
}

async function getAccessToken(): Promise<string | null> {
  const creds = getCredentials();
  if (!creds) return null;

  const { email, key } = creds;
  const now = Math.floor(Date.now() / 1000);

  const header  = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss:   email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud:   "https://oauth2.googleapis.com/token",
    exp:   now + 3600,
    iat:   now,
  })).toString("base64url");

  const signingInput = `${header}.${payload}`;

  let signature: string;
  try {
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(signingInput);
    signature = sign.sign(key, "base64url");
  } catch (err) {
    console.error("[google-indexing] Failed to sign JWT:", err);
    return null;
  }

  const jwt = `${signingInput}.${signature}`;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion:  jwt,
      }),
    });

    if (!res.ok) {
      console.error("[google-indexing] Token exchange failed:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token ?? null;
  } catch (err) {
    console.error("[google-indexing] Token fetch error:", err);
    return null;
  }
}

export async function submitUrlToGoogle(url: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    console.warn("[google-indexing] No credentials found — skipping");
    return false;
  }

  try {
    const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ url, type: "URL_UPDATED" }),
    });

    if (!res.ok) {
      console.error("[google-indexing] Indexing API error:", await res.text());
      return false;
    }

    console.log("[google-indexing] Submitted:", url);
    return true;
  } catch (err) {
    console.error("[google-indexing] Request error:", err);
    return false;
  }
}
