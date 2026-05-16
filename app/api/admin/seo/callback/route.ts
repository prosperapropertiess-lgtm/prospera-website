import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const BASE = "https://www.prosperaproperties.co";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${BASE}/admin/seo?error=1`);
  }

  // Exchange code for tokens
  let refreshToken: string | null = null;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
        redirect_uri:  `${BASE}/api/admin/seo/callback`,
        grant_type:    "authorization_code",
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.refresh_token) {
      console.error("[seo/callback] Token exchange failed:", data);
      return NextResponse.redirect(`${BASE}/admin/seo?error=1`);
    }
    refreshToken = data.refresh_token as string;
  } catch (err) {
    console.error("[seo/callback] Fetch error:", err);
    return NextResponse.redirect(`${BASE}/admin/seo?error=1`);
  }

  // Store in Supabase settings table
  const db = getSupabaseAdmin();
  const { error } = await db.from("settings").upsert(
    { key: "gsc_refresh_token", value: refreshToken, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );

  if (error) {
    console.error("[seo/callback] Supabase upsert failed:", error);
    return NextResponse.redirect(`${BASE}/admin/seo?error=2`);
  }

  return NextResponse.redirect(`${BASE}/admin/seo?connected=1`);
}
