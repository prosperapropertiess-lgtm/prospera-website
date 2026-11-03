import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { buildStatements, statementHTML, statementSubject, type OwnerStatement, type Warning } from "@/lib/owner-statement";

const EBIN = "prosperapropertiess@gmail.com";

/** Rebuild drafts for a period. Statements already sent are left alone. */
export async function saveDrafts(period: string): Promise<{ built: number; skippedSent: number; notes: Warning[] }> {
  const sb = getSupabaseAdmin();
  const { statements, notes } = await buildStatements(period);

  const { data: existing } = await sb.from("owner_statements").select("owner_key, status").eq("period", period);
  const sent = new Set((existing ?? []).filter((r) => r.status === "sent").map((r) => r.owner_key));

  const rows = statements
    .filter((s) => !sent.has(s.ownerKey))
    .map((s) => ({
      period,
      owner_key: s.ownerKey,
      owner_names: s.ownerNames,
      owner_emails: s.emails,
      data: s,
      warnings: [...notes, ...s.warnings],
      status: "draft",
      updated_at: new Date().toISOString(),
    }));

  if (rows.length) {
    const { error } = await sb.from("owner_statements").upsert(rows, { onConflict: "period,owner_key" });
    if (error) throw new Error(error.message);
  }
  return { built: rows.length, skippedSent: sent.size, notes };
}

async function portalUrl(ownerIds: string[]): Promise<string | undefined> {
  const { data } = await getSupabaseAdmin()
    .from("owner_access").select("token").contains("notion_owner_ids", ownerIds).limit(1).maybeSingle();
  return data?.token ? `https://www.prosperaproperties.co/owners/${data.token}` : undefined;
}

export async function renderStatement(s: OwnerStatement, correction = false): Promise<{ subject: string; html: string }> {
  return {
    subject: statementSubject(s, correction),
    html: statementHTML(s, { portalUrl: await portalUrl(s.ownerIds), correction }),
  };
}

export async function sendStatement(id: string, correction: boolean): Promise<void> {
  const sb = getSupabaseAdmin();
  const { data: row, error } = await sb.from("owner_statements").select("*").eq("id", id).single();
  if (error || !row) throw new Error("Statement not found.");
  if (row.status === "sent") throw new Error("This one was already sent.");
  if (!row.owner_emails?.length) throw new Error("This owner has no email in Notion.");

  const { subject, html } = await renderStatement(row.data as OwnerStatement, correction);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: sendError } = await resend.emails.send({
    from: "Ebin at Prospera <hello@prosperaproperties.co>",
    replyTo: EBIN,
    to: row.owner_emails,
    cc: [EBIN],
    subject,
    html,
  });
  if (sendError) throw new Error(sendError.message);

  await sb.from("owner_statements").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id);
}

/** Tells Ebin the drafts are ready. Owners get nothing from this. */
export async function notifyEbin(period: string, monthLabel: string): Promise<void> {
  const { data } = await getSupabaseAdmin().from("owner_statements").select("owner_names, warnings, status").eq("period", period);
  const drafts = (data ?? []).filter((r) => r.status === "draft");
  if (!drafts.length) return;
  const flagged = drafts.filter((r) => (r.warnings as Warning[]).some((w) => w.level === "red")).length;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Prospera Admin <hello@prosperaproperties.co>",
    to: [EBIN],
    subject: `${drafts.length} owner statement${drafts.length === 1 ? "" : "s"} for ${monthLabel} ready to check`,
    html: `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222">
      <p>${drafts.length} statement${drafts.length === 1 ? " is" : "s are"} built from the General Ledger and waiting for you:</p>
      <ul>${drafts.map((r) => `<li>${r.owner_names}</li>`).join("")}</ul>
      ${flagged ? `<p><strong>${flagged} ${flagged === 1 ? "has a problem" : "have problems"} to fix first.</strong></p>` : ""}
      <p>Nothing goes to an owner until you press Send.</p>
      <p><a href="https://www.prosperaproperties.co/admin/statements?period=${period}" style="color:#8B2030;font-weight:600">Check the statements</a></p>
    </div>`,
  });
}
