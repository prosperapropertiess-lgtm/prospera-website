import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const FROM = "Ebin at Prospera <hello@prosperaproperties.co>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  const { data: session } = await sb
    .from("onboarding_sessions")
    .select("token, owner_name, owner_email, status, created_at")
    .eq("owner_email", email.toLowerCase().trim())
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!session) {
    return NextResponse.json(
      { error: "No active onboarding session found for this email." },
      { status: 404 }
    );
  }

  const link = `${BASE_URL}/onboard/${session.token}`;

  await getResend().emails.send({
    from: FROM,
    to: session.owner_email,
    subject: "Your Prospera onboarding link — continue where you left off",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #0F1C28;">
        <p style="font-size: 18px; margin-bottom: 8px;">Hi ${session.owner_name},</p>
        <p style="font-size: 16px; color: rgba(15,28,40,0.65); margin-bottom: 32px; line-height: 1.6;">
          Here is your personal onboarding link. Click the button below to pick up right where you left off.
        </p>
        <a
          href="${link}"
          style="display: inline-block; padding: 14px 28px; background: #8B2030; color: #ffffff; border-radius: 10px; font-size: 16px; font-weight: 600; text-decoration: none; margin-bottom: 32px;"
        >
          Continue onboarding →
        </a>
        <p style="font-size: 14px; color: rgba(15,28,40,0.45); line-height: 1.6; border-top: 1px solid rgba(15,28,40,0.08); padding-top: 24px;">
          This link is personal — don&apos;t share it. If you did not request this email, you can safely ignore it.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ sent: true });
}
