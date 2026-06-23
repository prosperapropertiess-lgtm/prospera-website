import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

// owner_access table does NOT have an owner_email column (see migration 001_owner_access.sql).
// Owner email notifications are skipped for now. Add an owner_email column to owner_access
// and update this route to send owner notifications when that column is available.

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
const FROM_EMAIL = "Ebin at Prospera <ebin@prosperaproperties.co>";
const ADMIN_SECRET = process.env.ADMIN_API_SECRET;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { propertyId, token, content, messageType, ownerName, propertyAddress } = body as {
    propertyId: string;
    token: string;
    content: string;
    messageType: string;
    ownerName: string;
    propertyAddress: string;
  };

  if (!propertyId || !token || !content || !messageType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: message, error } = await getSupabaseAdmin()
    .from("property_messages")
    .insert({
      property_id: propertyId,
      token,
      author: "ebin",
      author_name: "Ebin",
      content,
      message_type: messageType,
    })
    .select("id, author, author_name, content, message_type, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email to Ebin (self-copy of what was sent)
  const propertyLabel = propertyAddress || "the property";
  const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://prosperaproperties.co"}/owners/${token}/${propertyId}`;

  const { error: emailErr } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: "prosperapropertiess@gmail.com",
    subject: `Update posted to ${ownerName ?? "owner"} — ${propertyLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1F2F3A;">
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Update posted</h2>
        <p style="font-size: 14px; color: #5A6A7A; margin-bottom: 4px;">Property: ${propertyLabel}</p>
        <p style="font-size: 14px; color: #5A6A7A; margin-bottom: 24px;">Owner: ${ownerName ?? "—"}</p>
        <div style="background: #F7F5F2; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #9AA5B1; margin-bottom: 8px;">${messageType}</p>
          <p style="font-size: 15px; line-height: 1.6; margin: 0;">${content}</p>
        </div>
        <a href="${propertyUrl}" style="display: inline-block; background: #8B2030; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;">
          View property page →
        </a>
      </div>
    `,
  });

  if (emailErr) {
    console.error("[admin/messages] email send error:", emailErr.message);
  }

  return NextResponse.json({ ok: true, message });
}
