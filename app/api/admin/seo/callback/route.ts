/**
 * Google OAuth2 callback — exchanges auth code for tokens and stores refresh token.
 *
 * Run in Supabase SQL editor before first use:
 * CREATE TABLE IF NOT EXISTS settings (
 *   key        TEXT PRIMARY KEY,
 *   value      TEXT NOT NULL,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const REDIRECT_URI = "https://www.prosperaproperties.co/api/admin/seo/callback";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  error?: string;
}

async function exchangeCode(code: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  return res.json() as Promise<TokenResponse>;
}

async function storeRefreshToken(refreshToken: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("settings").upsert(
    { key: "gsc_refresh_token", value: refreshToken, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) throw new Error(error.message);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/admin/seo?error=1", request.url));
  }

  try {
    const tokens = await exchangeCode(code);

    if (!tokens.refresh_token) {
      console.error("[oauth-callback] No refresh_token in response:", tokens);
      return NextResponse.redirect(new URL("/admin/seo?error=1", request.url));
    }

    await storeRefreshToken(tokens.refresh_token);
    return NextResponse.redirect(new URL("/admin/seo?connected=1", request.url));
  } catch (err) {
    console.error("[oauth-callback] Error:", err);
    return NextResponse.redirect(new URL("/admin/seo?error=1", request.url));
  }
}
