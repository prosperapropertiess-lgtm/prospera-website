import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { contactConfirmationEmail } from "@/lib/emails";
import { upsertHubspotContact } from "@/lib/hubspot";

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getClientIp(req: NextRequest): string | null {
  // Vercel sets x-forwarded-for; first entry is the real client.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

// Real human names are never literally "n/a", "na", "test", etc. — this
// exact pattern showed up in a real spam wave hitting this route directly
// (bypassing the rendered forms, which all require a real name client-side).
const BOT_NAME_PATTERN = /^(n\/?a|test|asdf+|none|null|undefined|xxx+)$/i;

const FAKE_SUCCESS = NextResponse.json({ success: true }, { status: 200 });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, city, message, type, property, traffic_source, website } = body;

    // Honeypot — a field no real visitor sees or fills (not rendered in the
    // real forms' visible UI), so a non-empty value only ever comes from a
    // bot that blindly fills every field it finds, including hidden ones.
    if (website) {
      return FAKE_SUCCESS;
    }

    if (!email || !email.includes("@") || !name || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Known bot-submitted name pattern — silently swallow rather than
    // reject, so an automated sender doesn't get a clear "blocked" signal
    // to adapt against.
    if (BOT_NAME_PATTERN.test(String(name).trim())) {
      return FAKE_SUCCESS;
    }

    const ip = getClientIp(req);

    // IP rate limit: a real visitor submits this form once, maybe twice.
    // More than 3 from the same IP in an hour is a bot, not an eager lead.
    if (ip) {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("created_at", since);
      if ((count ?? 0) >= 3) {
        return FAKE_SUCCESS;
      }
    }

    const { error } = await supabase.from("leads").insert([
      {
        name,
        email,
        phone: phone || null,
        city: city || null,
        message,
        type: type || "other",
        property: property || null,
        source: traffic_source ?? "direct",
        ip_address: ip,
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    // Send emails if Resend is configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        // Confirmation to the person who submitted
        await resend.emails.send({
          from: "Ebin at Prospera <hello@prosperaproperties.co>",
          replyTo: "prosperapropertiess@gmail.com",
          to: email,
          cc: ["prosperapropertiess@gmail.com"],
          subject: "We received your message — Prospera Properties",
          html: contactConfirmationEmail(name, type),
        });

        // Notification to Ebin
        await resend.emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          subject: `New ${type || "contact"} inquiry from ${name}`,
          html: `
            <h2>New contact form submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Type:</strong> ${type || "Not specified"}</p>
            <p><strong>City:</strong> ${city || "Not specified"}</p>
            ${property ? `<p><strong>Property:</strong> ${property}</p>` : ""}
            <p><strong>Traffic source:</strong> ${traffic_source ?? "direct"}</p>
            <p><strong>Message:</strong></p>
            <blockquote>${escapeHtml(message)}</blockquote>
          `,
        });
      } catch (emailErr) {
        console.error("Resend error:", emailErr);
        // Don't fail the request if email fails
      }
    }

    // HubSpot is the system of record for leads — sync every submission
    try {
      await upsertHubspotContact({ email, name, phone, city, type, source: traffic_source, message });
    } catch (hsErr) {
      console.error("HubSpot sync error:", hsErr);
      // Don't block the request on CRM failure
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
