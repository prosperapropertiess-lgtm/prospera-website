import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { onboardEmail1Welcome } from "@/lib/emails";

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
  const { owner_name, owner_email, owner_phone, property_address, property_type, service_type } = body;

  if (!owner_name || !owner_email || !property_address) {
    return NextResponse.json({ error: "owner_name, owner_email, and property_address are required" }, { status: 400 });
  }

  const token = generateToken();
  const sb = getSupabaseAdmin();
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";

  const { error } = await sb.from("onboarding_sessions").insert({
    token,
    current_step: 2,
    status: "in_progress",
    service_type: service_type === "management" ? "management" : "placement",
    owner_name,
    owner_email,
    owner_phone: owner_phone || null,
    property_address,
    property_type: property_type || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send welcome email immediately
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = onboardEmail1Welcome({
      ownerName: owner_name,
      propertyAddress: property_address,
      leaseUploadUrl: `${BASE}/onboard/${token}/lease`,
      skipUrl: `${BASE}/onboard/${token}/details`,
    });

    await resend.emails.send({
      from: "Ebin at Prospera <hello@prosperaproperties.co>",
      to: [owner_email],
      cc: [process.env.EBIN_EMAIL ?? "prosperapropertiess@gmail.com"],
      subject: `Welcome to Prospera, ${owner_name.split(" ")[0]} — let's get started`,
      html,
    });
  } catch (emailErr) {
    // Don't fail the whole request if email errors — session is already created
    console.error("Welcome email failed:", emailErr);
  }

  return NextResponse.json({ token, welcome_email_sent: true });
}
