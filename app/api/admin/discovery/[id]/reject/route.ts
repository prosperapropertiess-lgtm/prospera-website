import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { notAFitWithKitEmail } from "@/lib/landlord-kit-email";

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
      const sent = await resend.emails.send({
        from: "Prospera Properties <hello@prosperaproperties.co>",
        to: call.landlord_email,
        subject: "About your property, plus our free landlord kit",
        html: notAFitWithKitEmail(call.landlord_name ?? "there"),
      });
      if (sent.error) throw new Error(sent.error.message);
    } catch (err) {
      console.error("[discovery/reject] Email failed:", err);
      return NextResponse.json({ error: "Couldn't send the email — try again" }, { status: 502 });
    }
  }

  const { data: updated, error } = await db
    .from("discovery_calls")
    .update({ outcome: "rejected", rejection_sent_at: new Date().toISOString(), resources_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ call: updated });
}
