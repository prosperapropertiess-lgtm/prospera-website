import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { onboardEmail8Welcome } from "@/lib/emails";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://www.prosperaproperties.co";

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") ?? "ebinjaison02@gmail.com";
  const resend = new Resend(process.env.RESEND_API_KEY);
  const sb = getSupabaseAdmin();

  // Try to use a real completed session so the dashboard link actually works
  const { data: session } = await sb
    .from("onboarding_sessions")
    .select("owner_name, property_address, owner_access_token, lease_parsed_data")
    .not("owner_access_token", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  const ownerName    = session?.owner_name        ?? "Randy Lahey";
  const address      = session?.property_address  ?? "27 Horton Street, St. Thomas";
  const accessToken  = session?.owner_access_token;
  const dashboardUrl = accessToken
    ? `${BASE}/owners/${accessToken}`
    : `${BASE}/owners/demo`;

  const parsedLease  = session?.lease_parsed_data ?? {};
  const tenants: unknown[] = Array.isArray(parsedLease.tenants) ? parsedLease.tenants : [];

  const html = onboardEmail8Welcome({
    ownerName,
    propertyAddress: address,
    tenantCount: tenants.length || 2,
    rentCollectionDate: "the 1st of each month",
    dashboardUrl,
    checkInDate: "July 18, 2026",
  });

  const { error } = await resend.emails.send({
    from: "Ebin at Prospera <hello@prosperaproperties.co>",
    to: [to],
    subject: "[TEST] You're officially with Prospera Properties 🎉",
    html,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ sent: true, to, dashboardUrl });
}
