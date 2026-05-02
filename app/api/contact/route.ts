import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { contactConfirmationEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, city, message, type, property } = await req.json();

    if (!email || !email.includes("@") || !name || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
        source: "contact_form",
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
            <p><strong>Message:</strong></p>
            <blockquote>${message}</blockquote>
          `,
        });
      } catch (emailErr) {
        console.error("Resend error:", emailErr);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
