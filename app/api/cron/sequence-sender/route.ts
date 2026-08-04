/**
 * Email Sequence Sender cron
 * Runs daily at 10am EST (3pm UTC). Checks email_sequence_state for
 * contacts whose next_send_at is due, sends the email, then schedules
 * the next one (or marks the sequence complete).
 *
 * Schedule: "0 15 * * *"
 *
 * Claude writes each email fresh based on HubSpot notes + sequence intent.
 * Kill switch: SEQUENCE_SENDING_ENABLED=true in Vercel env vars.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAgentRun } from "@/lib/agent-logger";
import { SEQUENCES } from "@/lib/email-sequences";
import { fetchContactNotes } from "@/lib/hubspot";
import { generatePersonalizedEmail } from "@/lib/crm-ai";
import { Resend } from "resend";

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const FROM_EMAIL  = "Ebin at Prospera <ebin@prosperaproperties.co>";
const BATCH_LIMIT = 40; // max emails per cron run (Claude calls add latency)

// Contacts in forever-nurture get one email per month after their sequence ends
const NURTURE_INTERVAL_DAYS = 30;

export async function GET(req: NextRequest) {
  const start = Date.now();

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.SEQUENCE_SENDING_ENABLED !== "true") {
    return NextResponse.json({
      skipped: true,
      reason: "Sequence sending disabled. Set SEQUENCE_SENDING_ENABLED=true to activate.",
    });
  }

  const sb = getSupabaseAdmin();
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Fetch all due sequence emails (not completed, not unsubscribed, due now)
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
      const isNurture = !sequence || row.sequence_index >= sequence.length;

      // Fetch contact from Supabase (for name)
      const { data: contact } = await sb
        .from("hubspot_contacts")
        .select("name, email")
        .eq("hubspot_id", row.hubspot_id)
        .maybeSingle();

      const name = contact?.name || "";
      const email = contact?.email || row.email;

      if (!email) {
        skipped++;
        continue;
      }

      // Fetch HubSpot notes for personalization
      const notes = await fetchContactNotes(row.hubspot_id);

      // Generate email with Claude
      let subject: string;
      let html: string;

      try {
        const generated = await generatePersonalizedEmail(
          {
            name,
            email,
            contactType: row.contact_type,
          },
          notes,
          row.sequence_index,
          isNurture,
        );
        subject = generated.subject;
        html = generated.html;
      } catch (genErr) {
        console.error(`[sequence-sender] Claude generation failed for ${email}:`, genErr);
        errors++;
        continue;
      }

      // Send via Resend
      const { error: sendErr } = await getResend().emails.send({
        from:    FROM_EMAIL,
        to:      email,
        subject,
        html,
      });

      if (sendErr) {
        console.error(`[sequence-sender] send error for ${email}:`, sendErr.message);
        errors++;
        continue;
      }

      // Log the send
      await sb.from("sequence_send_log").insert({
        hubspot_id:     row.hubspot_id,
        email,
        contact_type:   row.contact_type,
        sequence_index: row.sequence_index,
        subject,
      });

      if (isNurture) {
        // Stay in nurture — increment index (wraps in generatePersonalizedEmail), schedule next month
        const nextSendAt = new Date();
        nextSendAt.setDate(nextSendAt.getDate() + NURTURE_INTERVAL_DAYS);
        nextSendAt.setUTCHours(15, 0, 0, 0);

        await sb.from("email_sequence_state").update({
          sequence_index: row.sequence_index + 1,
          last_sent_at:   new Date().toISOString(),
          next_send_at:   nextSendAt.toISOString(),
          // completed stays false — nurture never ends
        }).eq("id", row.id);
      } else {
        const nextIndex = row.sequence_index + 1;
        const sequenceDone = nextIndex >= sequence.length;

        if (sequenceDone) {
          // Move to nurture track — schedule first nurture in 30 days
          const nextSendAt = new Date();
          nextSendAt.setDate(nextSendAt.getDate() + NURTURE_INTERVAL_DAYS);
          nextSendAt.setUTCHours(15, 0, 0, 0);

          await sb.from("email_sequence_state").update({
            sequence_index: nextIndex, // index >= sequence.length = nurture mode
            last_sent_at:   new Date().toISOString(),
            next_send_at:   nextSendAt.toISOString(),
            completed:      false, // nurture never completes
          }).eq("id", row.id);
        } else {
          const nextDelay = sequence[nextIndex].delayDays;
          const nextSendAt = new Date();
          nextSendAt.setDate(nextSendAt.getDate() + nextDelay);
          nextSendAt.setUTCHours(15, 0, 0, 0);

          await sb.from("email_sequence_state").update({
            sequence_index: nextIndex,
            last_sent_at:   new Date().toISOString(),
            next_send_at:   nextSendAt.toISOString(),
          }).eq("id", row.id);
        }
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
