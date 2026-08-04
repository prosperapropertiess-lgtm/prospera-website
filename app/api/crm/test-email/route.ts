/**
 * Send a test email immediately — for previewing what Claude generates.
 * POST { email, contact_type }
 */
import { NextRequest, NextResponse } from "next/server";
import { generatePersonalizedEmail } from "@/lib/crm-ai";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { email, contact_type } = await req.json();

  if (!email?.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const validTypes = ["potential_landlord", "selfmanager_landlord", "realtor", "client"];
  if (!validTypes.includes(contact_type)) {
    return NextResponse.json({ error: "Invalid contact_type" }, { status: 400 });
  }

  try {
    const { subject, html } = await generatePersonalizedEmail(
      { name: "Test", email, contactType: contact_type },
      "", // no notes for test
      0,
      false,
    );

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { error } = await resend.emails.send({
      from: "Ebin at Prospera <ebin@prosperaproperties.co>",
      to: email,
      subject: `[TEST] ${subject}`,
      html,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, subject });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
