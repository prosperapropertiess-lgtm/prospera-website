import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

function rejectionEmail(landlordName: string): string {
  const firstName = landlordName.split(" ")[0] || "there";
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <p style="font-size:17px;line-height:1.9;margin:0 0 24px;">Hi ${firstName},</p>
    <p style="font-size:17px;line-height:1.9;margin:0 0 24px;">
      Thanks for taking the time to talk with us about your property. After going through the details, I don't think we're the right fit to manage it right now — I'd rather tell you that directly than waste your time.
    </p>
    <p style="font-size:17px;line-height:1.9;margin:0 0 24px;">
      This isn't a reflection on your property — we're just being selective about the properties and situations we take on so we can do right by the owners we do work with.
    </p>
    <p style="font-size:17px;line-height:1.9;margin:0 0 24px;">
      If anything changes, feel free to reach back out.
    </p>
    <p style="font-size:17px;line-height:1.9;margin:0 0 8px;">All the best,</p>
    <p style="font-size:17px;line-height:1.9;margin:0 0 28px;font-weight:600;">Ebin — Prospera Properties<br/>(519) 697-1227</p>
  </div>`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getSupabaseAdmin();

  const { data: call, error: callErr } = await db.from("discovery_calls").select("*").eq("id", id).single();
  if (callErr || !call) return NextResponse.json({ error: "Call not found" }, { status: 404 });
  if (!call.landlord_email) return NextResponse.json({ error: "No landlord email on file for this call" }, { status: 400 });

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Prospera Properties <hello@prosperaproperties.co>",
        to: call.landlord_email,
        subject: "Following up on your property",
        html: rejectionEmail(call.landlord_name ?? "there"),
      });
    } catch (err) {
      console.error("[discovery/reject] Email failed:", err);
      return NextResponse.json({ error: "Couldn't send the email — try again" }, { status: 502 });
    }
  }

  const { data: updated, error } = await db
    .from("discovery_calls")
    .update({ outcome: "rejected", rejection_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ call: updated });
}
