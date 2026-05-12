import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rentAnalysisLinkEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, address,
      owner_role, submitter_role, properties_owned, management_status, best_time_to_call,
      city, bedrooms,
      estimated_rent_low, estimated_rent_high,
    } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    // Upsert subscriber
    await supabaseAdmin.from("subscribers").upsert(
      [{ email, name: name || null, type: "landlord", preferred_city: city || null, source: "rent_estimator" }],
      { onConflict: "email", ignoreDuplicates: false }
    );

    // Create token
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from("rent_analysis_tokens")
      .insert([{ email, name: name || null, phone: phone || null, city: city || null, bedrooms: bedrooms || null, submitter_role: submitter_role || owner_role || null }])
      .select("token")
      .single();

    if (tokenErr || !tokenRow) {
      console.error("Token insert error:", tokenErr);
      return NextResponse.json({ error: "Failed to create analysis link" }, { status: 500 });
    }

    // Save lead record
    const { error: leadErr } = await supabaseAdmin.from("rent_leads").insert([{
      name,
      email,
      phone: phone || null,
      property_address: address || null,
      city: city || null,
      owner_role: owner_role || null,
      properties_owned: properties_owned ? Number(properties_owned) : null,
      management_status: management_status || null,
      best_time_to_call: best_time_to_call || null,
      estimated_bedrooms: bedrooms || null,
      estimated_rent_low: estimated_rent_low || null,
      estimated_rent_high: estimated_rent_high || null,
      token: tokenRow.token,
    }]);
    if (leadErr) console.error("rent_leads insert error:", leadErr);

    // Send link email
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Laura at Prospera <hello@prosperaproperties.co>",
        to: email,
        subject: "Your Prospera rent analysis link is ready",
        html: rentAnalysisLinkEmail({ name, token: tokenRow.token, city, bedrooms }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("request-analysis error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
