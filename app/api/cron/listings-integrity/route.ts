import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { systemAlertEmail } from "@/lib/emails";

/**
 * Catches exactly the two real incidents found in production on 2026-10-08:
 * a property silently flipped from published back to draft, and the only
 * active agent getting deactivated — both of which break real, live apply
 * links with zero visibility until someone happens to test one by hand.
 *
 * Runs every few hours (see vercel.json) since listings now get created and
 * edited by an AI agent, not just manually — a corruption window of a full
 * day is too long when prospects could be hitting a dead link in the
 * meantime.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const issues: string[] = [];

  // Issue 1 — a property that was published at some point and should still
  // be (not intentionally archived/rented) but is currently back in draft.
  const { data: unexpectedDrafts } = await supabaseAdmin
    .from("properties")
    .select("id, address, city, published_at")
    .eq("status", "draft")
    .not("published_at", "is", null);

  if (unexpectedDrafts?.length) {
    for (const p of unexpectedDrafts) {
      issues.push(`"${p.address}, ${p.city}" (${p.id}) was published on ${p.published_at} but is now back in draft — its apply link and public listing are both dead right now.`);
    }
  }

  // Issue 2 — no active agent means every apply link site-wide is broken.
  const { count: activeAgents } = await supabaseAdmin
    .from("agents")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (!activeAgents || activeAgents === 0) {
    issues.push("No active agent found. Every apply link on the entire site is currently broken (validate-apply-link requires an active agent).");
  }

  const status = {
    ok: issues.length === 0,
    checked_at: new Date().toISOString(),
    issues,
  };

  console.log("[cron/listings-integrity]", JSON.stringify(status));

  if (issues.length > 0) {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Prospera Properties <hello@prosperaproperties.co>",
        to: "prosperapropertiess@gmail.com",
        subject: `⚠ Listing integrity check found ${issues.length} issue${issues.length > 1 ? "s" : ""}`,
        html: systemAlertEmail({
          title: "Listing integrity check found a problem",
          issues,
        }),
      }).catch((err: unknown) => console.error("[cron/listings-integrity] Alert email failed:", err));
    }
  }

  return NextResponse.json(status);
}
