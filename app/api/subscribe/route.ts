import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { landlordWelcomeEmail, tenantWelcomeEmail } from "@/lib/emails";
import { upsertHubspotContact } from "@/lib/hubspot";

export async function POST(req: NextRequest) {
  try {
    const { name, email, type, preferred_city, source } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("subscribers").upsert(
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

        // Welcome email to the subscriber
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

        // Notification to Ebin
        await resend.emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          subject: `New ${type || "subscriber"} — ${name || email}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
              <div style="background:#1F2F3A;padding:20px 28px;">
                <p style="color:#8B2030;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">New Lead</p>
                <h2 style="color:#FAF8F5;font-size:18px;font-weight:300;margin:0;">${name || "Someone"} signed up</h2>
              </div>
              <div style="padding:24px 28px;background:#FAF8F5;border:1px solid #E8E4DF;border-top:none;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:6px 0;font-size:13px;color:#999;width:90px;">Name</td><td style="padding:6px 0;font-size:13px;color:#1F2F3A;">${name || "—"}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#999;">Email</td><td style="padding:6px 0;font-size:13px;color:#1F2F3A;"><a href="mailto:${email}" style="color:#8B2030;">${email}</a></td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#999;">Type</td><td style="padding:6px 0;font-size:13px;color:#1F2F3A;">${type || "general"}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#999;">City</td><td style="padding:6px 0;font-size:13px;color:#1F2F3A;">${preferred_city || "—"}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#999;">Source</td><td style="padding:6px 0;font-size:13px;color:#1F2F3A;">${source || "popup"}</td></tr>
                </table>
                <div style="margin-top:20px;">
                  <a href="mailto:${email}" style="display:inline-block;padding:10px 22px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-radius:4px;">Reply to ${name?.split(" ")[0] || "them"} →</a>
                </div>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Resend error:", emailErr);
      }
    }

    // Add to HubSpot CRM
    try {
      await upsertHubspotContact({ email, name, type, source, city: preferred_city });
    } catch {
      // Don't block on CRM failure
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
