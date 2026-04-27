import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { landlordWelcomeEmail, tenantWelcomeEmail } from "@/lib/emails";

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

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const isLandlord = type === "landlord";
        const isTenant = type === "tenant";

        await resend.emails.send({
          from: "Ebin at Prospera <hello@prosperaproperties.co>",
          to: email,
          subject: isLandlord
            ? "Welcome — here's what Prospera does for landlords"
            : isTenant
            ? "You're on the list — Prospera Properties"
            : "Welcome to Prospera Properties",
          html: isLandlord
            ? landlordWelcomeEmail(name)
            : tenantWelcomeEmail(name, preferred_city),
        });
      } catch {
        // Don't block on email failure
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
