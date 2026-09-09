/**
 * PSN-DATA-001 — monthly Business Numbers email to Ebin
 * Refreshes the snapshot, then emails the "CFO's Take" + a one-page P&L.
 * Schedule: 0 13 4 * *  (4th of the month, 09:00 Eastern — after the owner report on the 3rd)
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { computeSnapshot, persistSnapshot } from "@/lib/ceo-snapshot";
import type { PnL } from "@/lib/ceo-engine";

export const maxDuration = 120;

const NAVY = "#1F2F3A";
const WARM = "#F7F5F2";
const BORDER = "#D8D2C8";
const GREEN = "#2D7A4F";
const RED = "#8B2030";
const MUTED = "#666666";

const money = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `$${Math.round(n).toLocaleString("en-CA")}`;
const pct = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `${(n * 100).toFixed(0)}%`;
const monthLabel = (period: string) =>
  new Date(period + "T12:00:00").toLocaleDateString("en-CA", { month: "long", year: "numeric" });

function row(label: string, value: string, opts: { strong?: boolean; color?: string } = {}) {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid ${BORDER};font-family:Arial,sans-serif;font-size:14px;color:${MUTED};">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid ${BORDER};font-family:Arial,sans-serif;font-size:14px;text-align:right;font-weight:${opts.strong ? 700 : 400};color:${opts.color ?? NAVY};">${value}</td>
  </tr>`;
}

function buildHTML(pnl: PnL, brief: string | null, trend: { period: string; revenue: number; net_profit: number }[]) {
  const briefHtml = (brief ?? "The CFO summary could not be generated this month.")
    .split("\n")
    .filter(Boolean)
    .map((line) =>
      line.startsWith("- ")
        ? `<li style="margin:2px 0;">${line.slice(2)}</li>`
        : `<p style="margin:0 0 8px;">${line}</p>`
    )
    .join("")
    .replace(/(<li[\s\S]*?<\/li>)+/g, (m) => `<ul style="margin:6px 0 0;padding-left:20px;">${m}</ul>`);

  const trendRows = trend
    .slice(-3)
    .map(
      (t) =>
        `<tr>
          <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:${MUTED};">${monthLabel(t.period)}</td>
          <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;text-align:right;color:${NAVY};">${money(t.revenue)}</td>
          <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;text-align:right;color:${t.net_profit >= 0 ? GREEN : RED};">${money(t.net_profit)}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:${WARM};padding:24px 0;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">
    <tr><td style="background:${NAVY};padding:22px 28px;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#FAF8F5;opacity:0.7;">Prospera — Business Numbers</p>
      <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#FAF8F5;">${monthLabel(pnl.period)}</p>
    </td></tr>

    <tr><td style="padding:24px 28px 8px;">
      <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};font-weight:700;">CFO's Take</p>
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${NAVY};">${briefHtml}</div>
    </td></tr>

    <tr><td style="padding:16px 28px 8px;">
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};font-weight:700;">This Month</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row("Revenue (management fees)", money(pnl.revenue))}
        ${row("Cost of delivery (COGS)", money(pnl.cogs))}
        ${row("Gross profit", `${money(pnl.gross_profit)} · ${pct(pnl.gross_margin_pct)}`, { strong: true })}
        ${row("Fixed costs", money(pnl.opex_fixed))}
        ${row("Variable costs", money(pnl.opex_variable))}
        ${row("Net profit", `${money(pnl.net_profit)} · ${pct(pnl.operating_margin_pct)}`, { strong: true, color: pnl.net_profit >= 0 ? GREEN : RED })}
        ${row("Cash in bank", money(pnl.cash_closing))}
        ${row("Runway", pnl.runway_months === null ? "profitable / n/a" : `${pnl.runway_months.toFixed(1)} months`)}
      </table>
    </td></tr>

    <tr><td style="padding:16px 28px 24px;">
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};font-weight:700;">Last 3 Months</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td></td>
          <td style="text-align:right;font-family:Arial,sans-serif;font-size:11px;color:${MUTED};text-transform:uppercase;">Revenue</td>
          <td style="text-align:right;font-family:Arial,sans-serif;font-size:11px;color:${MUTED};text-transform:uppercase;">Net</td></tr>
        ${trendRows}
      </table>
    </td></tr>

    <tr><td style="padding:14px 28px;border-top:1px solid ${BORDER};">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${MUTED};">
        Full dashboard: <a href="https://www.prosperaproperties.co/admin/ceo" style="color:${RED};">prosperaproperties.co/admin/ceo</a><br>
        ${pnl.net_profit_note}
      </p>
    </td></tr>
  </table>
  </td></tr></table>
  </body></html>`;
}

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await computeSnapshot({ withBrief: true });
    await persistSnapshot(result);

    if (result.months.length === 0) {
      return NextResponse.json({ success: false, error: "No months computed" }, { status: 500 });
    }
    const current = result.months[result.months.length - 1];
    const html = buildHTML(
      current.pnl,
      result.brief,
      result.months.map((m) => ({
        period: m.period,
        revenue: m.pnl.revenue,
        net_profit: m.pnl.net_profit,
      }))
    );

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Prospera Numbers <hello@prosperaproperties.co>",
      to: ["prosperapropertiess@gmail.com"],
      subject: `Business Numbers — ${monthLabel(current.period)}`,
      html,
    });

    return NextResponse.json({ success: true, period: current.period, brief_generated: Boolean(result.brief) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
