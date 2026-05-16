/**
 * Google Search Console API — query search analytics.
 * Reuses the same JWT auth pattern as google-indexing.ts.
 * Credentials from GSC_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY.
 */

import crypto from "node:crypto";

export interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface Credentials {
  email: string;
  key: string;
}

function getCredentials(): Credentials | null {
  const json = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const parsed = JSON.parse(json);
      const email = parsed.client_email as string;
      const key = (parsed.private_key as string).replace(/\\n/g, "\n");
      if (email && key) return { email, key };
    } catch {
      console.error("[gsc] Failed to parse GSC_SERVICE_ACCOUNT_JSON");
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (email && rawKey) {
    return { email, key: rawKey.replace(/\\n/g, "\n") };
  }

  return null;
}

export async function getGSCToken(): Promise<string | null> {
  const creds = getCredentials();
  if (!creds) return null;

  const { email, key } = creds;
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");

  const signingInput = `${header}.${payload}`;

  let signature: string;
  try {
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(signingInput);
    signature = sign.sign(key, "base64url");
  } catch (err) {
    console.error("[gsc] Failed to sign JWT:", err);
    return null;
  }

  const jwt = `${signingInput}.${signature}`;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      console.error("[gsc] Token exchange failed:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token ?? null;
  } catch (err) {
    console.error("[gsc] Token fetch error:", err);
    return null;
  }
}

export async function querySearchAnalytics(params: {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions: string[];
  rowLimit?: number;
  dimensionFilterGroups?: object[];
}): Promise<{ rows: GSCRow[]; responseAggregationType?: string } | null> {
  const token = await getGSCToken();
  if (!token) {
    console.error("[gsc] No token — credentials missing or JWT sign failed");
    return null;
  }

  const { siteUrl, ...body } = params;
  const encoded = encodeURIComponent(siteUrl);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[gsc] Search Analytics API error ${res.status}:`, errText);
      return null;
    }

    const data = await res.json();
    return {
      rows: (data.rows ?? []) as GSCRow[],
      responseAggregationType: data.responseAggregationType,
    };
  } catch (err) {
    console.error("[gsc] Request error:", err);
    return null;
  }
}

export function getServiceAccountEmail(): string | null {
  const json = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return (JSON.parse(json).client_email as string) ?? null;
    } catch { return null; }
  }
  return process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? null;
}
