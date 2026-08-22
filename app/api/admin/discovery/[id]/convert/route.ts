import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { onboardEmail1Welcome, placementWelcomeEmail } from "@/lib/emails";

function generateToken(): string {
  return `ob-${randomBytes(8).toString("hex")}`;
}

// POST /api/admin/discovery/[id]/convert — hand off a good-fit call straight into the onboarding wizard
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getSupabaseAdmin();

  const { data: call, error: callErr } = await db.from("discovery_calls").select("*").eq("id", id).single();
  if (callErr || !call) return NextResponse.json({ error: "Call not found" }, { status: 404 });
  if (!call.landlord_name || !call.landlord_email || !call.property_address) {
    return NextResponse.json({ error: "Name, email, and property address are required before converting" }, { status: 400 });
  }

  const token = generateToken();
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";
  const isPlacement = call.service_type === "placement";

  const { error } = await db.from("onboarding_sessions").insert({
    token,
    current_step: 3,
    status: "in_progress",
    service_type: isPlacement ? "placement" : "management",
    owner_name: call.landlord_name,
    owner_email: call.landlord_email,
    owner_phone: call.landlord_phone || null,
    property_address: call.property_address,
    property_city: call.property_city || null,
    property_type: call.property_type || null,
    bedrooms: call.bedrooms ?? null,
    bathrooms: call.bathrooms ?? null,
    property_condition: call.property_condition || null,
    approx_monthly_rent: call.approx_monthly_rent ?? null,
    rent_market: call.approx_monthly_rent ?? null,
    step2_completed_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Welcome email — same as the standalone onboarding creation flow
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const dashboardUrl = `${BASE}/onboard/${token}`;
    const html = isPlacement
      ? placementWelcomeEmail({
          ownerName: call.landlord_name,
          propertyAddress: call.property_address,
          city: call.property_city || "London",
          bedrooms: call.bedrooms || 2,
          dashboardUrl,
          rentLow: 0,
          rentMarket: call.approx_monthly_rent || 0,
          rentPremium: 0,
          comparables: [],
        })
      : onboardEmail1Welcome({
          ownerName: call.landlord_name,
          propertyAddress: call.property_address,
          dashboardUrl,
        });
    const subject = isPlacement
      ? `Market analysis for ${call.property_address} — Prospera Properties`
      : `Welcome to Prospera, ${call.landlord_name.split(" ")[0]} — let's get started`;

    await resend.emails.send({
      from: "Ebin at Prospera <hello@prosperaproperties.co>",
      to: [call.landlord_email],
      cc: [process.env.EBIN_EMAIL ?? "prosperapropertiess@gmail.com"],
      subject,
      html,
    });
  } catch (emailErr) {
    console.error("[discovery/convert] Welcome email failed:", emailErr);
  }

  const { data: updated } = await db
    .from("discovery_calls")
    .update({ outcome: "converted", onboarding_token: token, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json({ call: updated, onboarding_token: token });
}
