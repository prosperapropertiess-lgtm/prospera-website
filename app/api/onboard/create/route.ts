import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { onboardEmail1Welcome, placementWelcomeEmail } from "@/lib/emails";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const rand = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `ob-${rand}`;
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { owner_name, owner_email, owner_phone, property_address, property_type, service_type, property_city, bedrooms, rent_low, rent_market, rent_premium, comparables } = body;

  if (!owner_name || !owner_email || !property_address) {
    return NextResponse.json({ error: "owner_name, owner_email, and property_address are required" }, { status: 400 });
  }

  const token = generateToken();
  const sb = getSupabaseAdmin();
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";

  const { error } = await sb.from("onboarding_sessions").insert({
    token,
    current_step: 3,
    status: "in_progress",
    service_type: service_type === "management" ? "management" : "placement",
    owner_name,
    owner_email,
    owner_phone: owner_phone || null,
    property_address,
    property_type: property_type || null,
    step2_completed_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send welcome email immediately
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const isPlacement = (service_type === "placement");
    const dashboardUrl = `${BASE}/onboard/${token}`;

    let html: string;
    let subject: string;

    if (isPlacement) {
      html = placementWelcomeEmail({
        ownerName: owner_name,
        propertyAddress: property_address,
        city: property_city || "London",
        bedrooms: Number(bedrooms) || 2,
        dashboardUrl,
        rentLow: Number(rent_low) || 0,
        rentMarket: Number(rent_market) || 0,
        rentPremium: Number(rent_premium) || 0,
        comparables: comparables || [],
      });
      subject = `Market analysis for ${property_address} — Prospera Properties`;
    } else {
      html = onboardEmail1Welcome({
        ownerName: owner_name,
        propertyAddress: property_address,
        dashboardUrl,
      });
      subject = `Welcome to Prospera, ${owner_name.split(" ")[0]} — let's get started`;
    }

    await resend.emails.send({
      from: "Ebin at Prospera <hello@prosperaproperties.co>",
      to: [owner_email],
      cc: [process.env.EBIN_EMAIL ?? "prosperapropertiess@gmail.com"],
      subject,
      html,
    });
  } catch (emailErr) {
    console.error("Welcome email failed:", emailErr);
  }

  return NextResponse.json({ token, welcome_email_sent: true });
}
