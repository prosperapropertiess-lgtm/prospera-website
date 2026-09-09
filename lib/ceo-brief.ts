/**
 * PSN-DATA-001 — "CFO's Take"
 * A short, blunt, plain-English read on the month, generated from the P&L.
 * Stored on the current month's ceo_metric_snapshots row (no LLM call on page load).
 */
import Anthropic from "@anthropic-ai/sdk";
import type { PnL, UnitEconomics } from "@/lib/ceo-engine";

export interface BriefInput {
  pnl: PnL;
  trend: { period: string; revenue: number; net_profit: number; cash: number | null }[];
  ue: UnitEconomics;
  pum: number;
  owner_count: number;
  offboardingOwners: { name: string; feeType: string | null; feeAmount: number | null }[];
  financesConfigured: boolean;
}

const money = (n: number | null | undefined) =>
  n === null || n === undefined ? "n/a" : `$${Math.round(n).toLocaleString("en-CA")}`;
const pct = (n: number | null | undefined) =>
  n === null || n === undefined ? "n/a" : `${(n * 100).toFixed(0)}%`;

const SYSTEM = `You are the CFO of Prospera Properties, a very small property-management firm in
London / St Thomas, Ontario, run by its founder Ebin. You report to Ebin directly.

Write like a sharp CFO who respects his time: blunt, specific, numbers first, no hype,
no filler, no consultant-speak. Never say "leverage", "robust", "unlock", "journey".

Judge everything against the 5 things that matter to this business:
vacancy → tenant, owner communication, maintenance, move-in/move-out, and money.
If a number doesn't touch one of those, don't mention it.

Output plain text, 3–5 sentences, then a line break, then "Do this:" and 1–2 concrete
next actions as short bullets ("- ..."). No headings, no markdown bold, no preamble.
State the single most important fact first. If the data is thin or the expense sheet
isn't filled in, say so plainly rather than pretending the numbers are complete.`;

export async function generateBrief(input: BriefInput): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const { pnl, trend, ue, pum, owner_count, offboardingOwners, financesConfigured } = input;
  const prev = trend.length >= 2 ? trend[trend.length - 2] : null;

  const data = [
    `MONTH: ${pnl.period}`,
    `Clients (owners): ${owner_count}   Doors under management: ${pum}`,
    ``,
    `THIS MONTH P&L (Prospera's own money — management fees, not rent roll):`,
    `  Revenue:           ${money(pnl.revenue)}  (recurring ${money(pnl.recurring_revenue)}, one-off ${money(pnl.transactional_revenue)})`,
    `  COGS:              ${money(pnl.cogs)}`,
    `  Gross profit:      ${money(pnl.gross_profit)}  (${pct(pnl.gross_margin_pct)} margin)`,
    `  Fixed costs:       ${money(pnl.opex_fixed)}`,
    `  Variable costs:    ${money(pnl.opex_variable)}`,
    `  Net profit:        ${money(pnl.net_profit)}  (${pct(pnl.operating_margin_pct)} margin)`,
    `  Cash in bank:      ${money(pnl.cash_closing)}`,
    `  Runway:            ${pnl.runway_months === null ? "n/a (profitable or cash unknown)" : `${pnl.runway_months.toFixed(1)} months`}`,
    prev ? `  Last month revenue ${money(prev.revenue)}, net profit ${money(prev.net_profit)}` : ``,
    ``,
    `UNIT ECONOMICS (estimated — tiny sample):`,
    `  Revenue per door:  ${money(ue.revenue_per_property)}`,
    `  Revenue per owner: ${money(ue.revenue_per_owner)}`,
    `  LTV:CAC:           ${ue.ltv_cac_ratio === null ? "n/a" : ue.ltv_cac_ratio.toFixed(1) + "x"}`,
    ``,
    offboardingOwners.length
      ? `PENDING CHURN: ${offboardingOwners
          .map(
            (o) =>
              `${o.name} (${
                o.feeType === "percent"
                  ? `${((o.feeAmount ?? 0) * 100).toFixed(0)}% fee`
                  : o.feeType === "flat"
                  ? `${money(o.feeAmount)}/mo flat`
                  : "fee unknown"
              })`
          )
          .join(", ")} — flagged as leaving. Say what revenue and net profit look like once they're gone.`
      : `PENDING CHURN: none flagged.`,
    financesConfigured
      ? ``
      : `NOTE: the company expense sheet in Notion is not wired up yet, so costs above are incomplete.`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }).messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: SYSTEM,
    messages: [{ role: "user", content: data }],
  });

  const text = res.content[0]?.type === "text" ? res.content[0].text.trim() : "";
  return text || null;
}
