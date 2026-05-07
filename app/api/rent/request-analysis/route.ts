import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rentAnalysisLinkEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const { email, city, bedrooms, name } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Upsert subscriber as landlord
    await supabaseAdmin.from("subscribers").upsert(
      [{ email, name: name || null, type: "landlord", preferred_city: city || null, source: "rent_estimator" }],
      { onConflict: "email", ignoreDuplicates: false }
    );

    // Create token
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from("rent_analysis_tokens")
      .insert([{ email, name: name || null, city: city || null, bedrooms: bedrooms || null }])
      .select("token")
      .single();

    if (tokenErr || !tokenRow) {
      console.error("Token insert error:", tokenErr);
      return NextResponse.json({ error: "Failed to create analysis link" }, { status: 500 });
    }

    // Send link email
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Ebin at Prospera <hello@prosperaproperties.co>",
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
