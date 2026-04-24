import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email, type, preferred_city, source } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const { error } = await supabase.from("subscribers").upsert(
      [{
        email,
        name: name || null,
        type: type || "general",
        preferred_city: preferred_city || null,
        source: source || "popup",
      }],
      { onConflict: "email", ignoreDuplicates: false }
    );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    // Send welcome email if Resend is configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: email,
          subject: type === "tenant"
            ? "You're on the list — Prospera Properties"
            : "Welcome to the Prospera landlord community",
          html: type === "tenant"
            ? `<p>Hi ${name || "there"},</p><p>You're on our list. We'll notify you the moment a new rental matches your preferences in ${preferred_city || "your area"}.</p><p>In the meantime, browse what's available now at <a href="https://www.prosperaproperties.co/listings">prosperaproperties.co/listings</a>.</p><p>— Ebin, Prospera Properties</p>`
            : `<p>Hi ${name || "there"},</p><p>Thanks for joining our landlord community. We'll send you Ontario market updates, landlord tips, and resources — nothing spammy.</p><p>Have a property you'd like us to manage? <a href="https://www.prosperaproperties.co/contact">Get a free quote here.</a></p><p>— Ebin, Prospera Properties</p>`,
        });
      } catch {
        // Email failure shouldn't block the subscription success
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
