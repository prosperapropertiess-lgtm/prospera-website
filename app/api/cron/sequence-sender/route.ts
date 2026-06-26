/**
 * Email Sequence Sender cron
 * Runs daily at 10am EST (3pm UTC). Checks email_sequence_state for
 * contacts whose next_send_at is due, sends the email, then schedules
 * the next one (or marks the sequence complete).
 *
 * Schedule: "0 15 * * *"
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAgentRun } from "@/lib/agent-logger";
import { SEQUENCES } from "@/lib/email-sequences";
import { Resend } from "resend";

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const CRON_SECRET   = process.env.CRON_SECRET;
const FROM_EMAIL    = "Ebin at Prospera <ebin@prosperaproperties.co>";
const BATCH_LIMIT   = 50; // max emails per cron run

export async function GET(req: NextRequest) {
  const start = Date.now();

  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Kill switch — set SEQUENCE_SENDING_ENABLED=true in Vercel env vars to activate
  if (process.env.SEQUENCE_SENDING_ENABLED !== "true") {
    return NextResponse.json({ skipped: true, reason: "Sequence sending is disabled. Set SEQUENCE_SENDING_ENABLED=true to activate." });
  }

  const sb = getSupabaseAdmin();
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Fetch all due sequence emails
    const { data: dueRows, error: fetchErr } = await sb
      .from("email_sequence_state")
      .select("*")
      .eq("completed", false)
      .eq("unsubscribed", false)
      .lte("next_send_at", new Date().toISOString())
      .limit(BATCH_LIMIT);

    if (fetchErr) throw new Error(fetchErr.message);
    if (!dueRows || dueRows.length === 0) {
      await logAgentRun("sequence-sender", "skipped", { reason: "no due emails" }, Date.now() - start);
      return NextResponse.json({ sent: 0, skipped: 0, errors: 0 });
    }

    for (const row of dueRows) {
      const sequence = SEQUENCES[row.contact_type];
      if (!sequence || row.sequence_index >= sequence.length) {
        // Mark complete — no more emails
        await sb.from("email_sequence_state").update({ completed: true }).eq("id", row.id);
        skipped++;
        continue;
      }

      const emailDef = sequence[row.sequence_index];

      // Fetch the contact name from hubspot_contacts
      const { data: contact } = await sb
        .from("hubspot_contacts")
        .select("name")
        .eq("hubspot_id", row.hubspot_id)
        .maybeSingle();

      const name = contact?.name || row.email.split("@")[0];
      const html = emailDef.getHtml(name);

      // Send via Resend
      const { error: sendErr } = await getResend().emails.send({
        from:    FROM_EMAIL,
        to:      row.email,
        subject: emailDef.subject,
        html,
      });

      if (sendErr) {
        console.error(`[sequence-sender] send error for ${row.email}:`, sendErr.message);
        errors++;
        continue;
      }

      // Log the send
      await sb.from("sequence_send_log").insert({
        hubspot_id:     row.hubspot_id,
        email:          row.email,
        contact_type:   row.contact_type,
        sequence_index: row.sequence_index,
        subject:        emailDef.subject,
      });

      // Advance to next email or mark complete
      const nextIndex = row.sequence_index + 1;
      const isLast    = nextIndex >= sequence.length;

      if (isLast) {
        await sb.from("email_sequence_state").update({
          sequence_index: nextIndex,
          last_sent_at:   new Date().toISOString(),
          completed:      true,
        }).eq("id", row.id);
      } else {
        const nextDelay = sequence[nextIndex].delayDays;
        const nextSendAt = new Date();
        nextSendAt.setDate(nextSendAt.getDate() + nextDelay);
        // Send at 10am EST = 3pm UTC
        nextSendAt.setUTCHours(15, 0, 0, 0);

        await sb.from("email_sequence_state").update({
          sequence_index: nextIndex,
          last_sent_at:   new Date().toISOString(),
          next_send_at:   nextSendAt.toISOString(),
        }).eq("id", row.id);
      }

      sent++;
    }

    const duration = Date.now() - start;
    await logAgentRun("sequence-sender", "success", { sent, skipped, errors }, duration);

    return NextResponse.json({ sent, skipped, errors });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logAgentRun("sequence-sender", "error", {}, Date.now() - start, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
