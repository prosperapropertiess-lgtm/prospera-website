/**
 * Sends scheduled post-move-in review requests. Runs even when the tablet
 * that did the move-in is closed/offline, per spec — the schedule is a row
 * in the database, not a client-side timer.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { moveInReviewRequestEmail } from "@/lib/emails";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();

  const { data: due } = await db
    .from("move_in_review_requests")
    .select("id, session_id")
    .eq("status", "scheduled")
    .lte("send_at", new Date().toISOString());

  if (!due || due.length === 0) return NextResponse.json({ sent: 0 });

  const { data: settings } = await db.from("move_in_review_settings").select("*").eq("id", 1).single();
  if (!settings?.google_review_link) return NextResponse.json({ sent: 0, skipped: "no review link configured" });

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;
  const errors: string[] = [];

  for (const row of due) {
    const { data: session } = await db.from("move_in_sessions").select("application_id").eq("id", row.session_id).single();
    const { data: application } = session?.application_id
      ? await db.from("leasing_applications").select("legal_name, email").eq("id", session.application_id).single()
      : { data: null };
    if (!application?.email) {
      await db.from("move_in_review_requests").update({ status: "cancelled" }).eq("id", row.id);
      continue;
    }
    try {
      const { subject, html } = moveInReviewRequestEmail(
        application.legal_name || "",
        settings.message_template || "We'd really appreciate a quick review of your move-in experience.",
        settings.google_review_link
      );
      const { error } = await resend.emails.send({ from: "Prospera Properties <hello@prosperaproperties.co>", to: application.email, subject, html });
      if (error) throw new Error(JSON.stringify(error));
      await db.from("move_in_review_requests").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", row.id);
      sent++;
    } catch (err) {
      errors.push(String(err));
    }
  }

  return NextResponse.json({ sent, total: due.length, errors });
}
