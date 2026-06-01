import { NextRequest, NextResponse } from "next/server";

// One-time endpoint to send backlink outreach emails to prospects with real email addresses
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.SEO_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { emails } = await req.json();
  // emails: array of { to, subject, body }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  const results: { to: string; status: string; error?: string }[] = [];

  for (const email of emails) {
    try {
      await resend.emails.send({
        from: "Ebin Jaison <hello@prosperaproperties.co>",
        replyTo: "prosperapropertiess@gmail.com",
        to: email.to,
        subject: email.subject,
        text: email.body,
      });
      results.push({ to: email.to, status: "sent" });
    } catch (err) {
      results.push({ to: email.to, status: "failed", error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
