import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

interface Proposal {
  title: string;
  status: string;
  week_of: string;
  implemented_at?: string | null;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const weekStr = now.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });

  // ── Gather all data in parallel ───────────────────────────────────────────
  const [
    { count: newLeads },
    { count: totalLeads },
    { count: newSubscribers },
    { count: totalSubscribers },
    { count: newRentRequests },
    { count: outreachThisWeek },
    { count: newRentRequests30d },
    { data: proposals },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("subscribers").select("id", { count: "exact", head: true }),
    supabase.from("rent_analysis_tokens").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("outreach_log").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("rent_analysis_tokens").select("id", { count: "exact", head: true }).gte("created_at", monthAgo),
    supabase.from("tech_proposals").select("title, status, week_of, implemented_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("leads").select("name, type, city, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const allProposals: Proposal[] = proposals ?? [];
  const shippedThisWeek = allProposals.filter(
    (p) => p.status === "implemented" && p.implemented_at && p.implemented_at >= weekAgo
  );
  const inProgress = allProposals.filter((p) => p.status === "building");
  const pending = allProposals.filter((p) => p.status === "pending");
  const totalShipped = allProposals.filter((p) => p.status === "implemented").length;

  // ── Calculate a simple platform health score ──────────────────────────────
  let healthScore = 70; // baseline
  if ((newLeads ?? 0) > 0) healthScore += 10;
  if ((newSubscribers ?? 0) > 0) healthScore += 5;
  if ((newRentRequests ?? 0) > 0) healthScore += 5;
  if ((outreachThisWeek ?? 0) >= 3) healthScore += 5;
  if (shippedThisWeek.length > 0) healthScore += 5;
  healthScore = Math.min(100, healthScore);

  const healthColor = healthScore >= 85 ? "#2D6A4F" : healthScore >= 65 ? "#B7791F" : "#8B2030";
  const healthLabel = healthScore >= 85 ? "Strong" : healthScore >= 65 ? "Steady" : "Needs attention";

  // ── Build the email ───────────────────────────────────────────────────────
  function statBlock(label: string, value: string | number, sub?: string) {
    return `
      <td style="padding:0 8px;text-align:center;vertical-align:top;">
        <div style="background:white;border:1px solid #E8E4DF;border-radius:8px;padding:16px 20px;">
          <p style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 6px;">${label}</p>
          <p style="font-size:26px;color:#1F2F3A;font-weight:300;margin:0;line-height:1;">${value}</p>
          ${sub ? `<p style="font-size:11px;color:#999;margin:4px 0 0;">${sub}</p>` : ""}
        </div>
      </td>`;
  }

  function featureRow(title: string, status: string) {
    const icon = status === "implemented" ? "✓" : status === "building" ? "⟳" : "○";
    const color = status === "implemented" ? "#2D6A4F" : status === "building" ? "#B7791F" : "#999";
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F0EBE5;">
          <span style="color:${color};font-size:13px;margin-right:10px;font-weight:600;">${icon}</span>
          <span style="font-size:13px;color:#2C2C2C;">${title}</span>
          <span style="float:right;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">${status}</span>
        </td>
      </tr>`;
  }

  const leadRows = (recentLeads ?? []).map((l: { name: string; type: string; city?: string | null; created_at: string }) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #F0EBE5;">
        <span style="font-size:13px;color:#1F2F3A;font-weight:500;">${l.name}</span>
        <span style="font-size:11px;color:#999;margin-left:8px;">${l.type || "contact"} · ${l.city || "unknown city"}</span>
        <span style="float:right;font-size:11px;color:#999;">${new Date(l.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span>
      </td>
    </tr>`).join("") || `<tr><td style="padding:12px 0;font-size:13px;color:#999;text-align:center;">No leads this week yet.</td></tr>`;

  const html = `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#2C2C2C;background:#FAF8F5;">

      <div style="background:#1F2F3A;padding:32px 36px;">
        <p style="color:#8B2030;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 8px;font-weight:600;">Prospera CTO Agent · Weekly Status</p>
        <h1 style="color:#FAF8F5;font-size:26px;font-weight:300;margin:0 0 6px;">Week of ${weekStr}</h1>
        <p style="color:rgba(250,248,245,0.5);font-size:13px;margin:0;">
          Platform health: <span style="color:${healthColor};font-weight:600;">${healthScore}/100 — ${healthLabel}</span>
        </p>
      </div>

      <div style="padding:32px 36px;background:white;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">

        <!-- Business metrics -->
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#1F2F3A;font-weight:600;margin:0 0 14px;">Business metrics — this week</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
          <tr>
            ${statBlock("New Leads", newLeads ?? 0, `${totalLeads ?? 0} total`)}
            ${statBlock("Subscribers", newSubscribers ?? 0, `${totalSubscribers ?? 0} total`)}
            ${statBlock("Rent Analysis", newRentRequests ?? 0, `${newRentRequests30d ?? 0} this month`)}
            ${statBlock("Outreach", outreachThisWeek ?? 0, "this week")}
          </tr>
        </table>

        <!-- Recent leads -->
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#1F2F3A;font-weight:600;margin:0 0 12px;">Recent leads</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
          ${leadRows}
        </table>

        <!-- Feature pipeline -->
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#1F2F3A;font-weight:600;margin:0 0 12px;">
          Feature pipeline — ${totalShipped} shipped total
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
          ${shippedThisWeek.length > 0 ? shippedThisWeek.map((p: Proposal) => featureRow(p.title, "implemented")).join("") : ""}
          ${inProgress.length > 0 ? inProgress.map((p: Proposal) => featureRow(p.title, "building")).join("") : ""}
          ${pending.length > 0 ? pending.map((p: Proposal) => featureRow(p.title, "pending")).join("") : ""}
          ${shippedThisWeek.length === 0 && inProgress.length === 0 && pending.length === 0
            ? `<tr><td style="padding:12px 0;font-size:13px;color:#999;text-align:center;">No activity this week — CTO agent runs Monday morning.</td></tr>`
            : ""}
        </table>

        ${shippedThisWeek.length > 0 ? `
        <div style="background:#F0FFF4;border:1px solid #9AE6B4;padding:16px 20px;border-radius:4px;margin-bottom:28px;">
          <p style="font-size:13px;color:#2D6A4F;margin:0;font-weight:500;">
            🚀 ${shippedThisWeek.length} feature${shippedThisWeek.length > 1 ? "s" : ""} shipped this week. Prospera is improving.
          </p>
        </div>` : ""}

        ${pending.length === 0 && inProgress.length === 0 ? `
        <div style="background:#FFF8F0;border:1px solid #F6AD55;padding:16px 20px;border-radius:4px;margin-bottom:28px;">
          <p style="font-size:13px;color:#B7791F;margin:0;">
            ⚡ No feature in progress. The CTO agent will send a new proposal Monday at 9am.
          </p>
        </div>` : ""}

        <!-- Action links -->
        <div style="border-top:1px solid #E8E4DF;padding-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
          <a href="https://www.prosperaproperties.co/admin/dashboard" style="display:inline-block;padding:12px 24px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
            Admin Dashboard
          </a>
          <a href="https://www.prosperaproperties.co" style="display:inline-block;padding:12px 20px;border:1px solid #D8D2C8;color:#444;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
            View Site
          </a>
        </div>
      </div>

      <div style="padding:18px 36px;border:1px solid #E8E4DF;border-top:none;">
        <p style="font-size:11px;color:#B0B0B0;margin:0;">
          Prospera Properties · CTO Agent · Weekly status every Friday at 5pm EST<br/>
          prosperaproperties.co · London · St. Thomas · Strathroy, Ontario
        </p>
      </div>
    </div>
  `;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("[cto-status] No Resend key — status computed but not sent");
    return NextResponse.json({ success: true, sent: false });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  const leadCount = newLeads ?? 0;
  const subjectEmoji = leadCount > 0 ? "📈" : shippedThisWeek.length > 0 ? "🚀" : "📊";
  const subjectLine = leadCount > 0
    ? `${subjectEmoji} ${leadCount} new lead${leadCount > 1 ? "s" : ""} this week — Prospera status`
    : `${subjectEmoji} Prospera weekly status — ${weekStr}`;

  await resend.emails.send({
    from: "Prospera CTO Agent <hello@prosperaproperties.co>",
    to: "prosperapropertiess@gmail.com",
    subject: subjectLine,
    html,
  });

  console.log("[cto-status] Status email sent for week of", weekStr);
  return NextResponse.json({
    success: true,
    healthScore,
    newLeads: newLeads ?? 0,
    newSubscribers: newSubscribers ?? 0,
    shippedThisWeek: shippedThisWeek.length,
    totalShipped,
  });
}
