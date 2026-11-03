/**
 * Owner statements, built from the General Ledger in Notion.
 *
 * The ledger is the books the accountant keeps, so it's the only source here.
 * An owner's money is everything posted to account 2120 "Owner Funds Payable"
 * for their properties: credits are money in for them (rent), debits are money
 * out of their funds (our fee, expenses we paid for them, payouts to them).
 *
 * No AI touches these numbers. Code adds them up; Ebin checks them; then they send.
 */
import {
  DB, queryDatabase, text, num, dateStart,
  fetchAllOwners, fetchAllProperties, fetchAllTenants,
  type Owner, type Property, type Tenant,
} from "@/lib/notion";

const OWNER_FUNDS = 2120;
const MGMT_FEES = 4010;

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export type LineKind = "rent" | "fee" | "expense" | "payout" | "other";

export interface StatementLine {
  date: string;
  description: string;
  property: string;
  kind: LineKind;
  moneyIn: number;
  moneyOut: number;
}

export interface Warning {
  level: "red" | "amber";
  text: string;
}

export interface OwnerStatement {
  period: string;          // YYYY-MM
  monthLabel: string;      // October 2026
  ownerKey: string;
  ownerIds: string[];
  ownerNames: string;      // Tina Grozzelle & Randy Lahey
  greeting: string;        // Tina and Randy
  emails: string[];
  properties: string[];
  openingBalance: number;
  lines: StatementLine[];
  rent: number;
  otherIn: number;
  fees: number;
  expenses: number;
  payouts: number;
  net: number;             // rent + other in − fees − expenses
  closingBalance: number;  // opening + net − payouts
  warnings: Warning[];
}

interface LedgerRow {
  entry: string;
  description: string;
  property: string;
  account: number | null;
  accountName: string;
  debit: number;
  credit: number;
  date: string | null;
}

async function fetchLedger(): Promise<LedgerRow[]> {
  const pages = await queryDatabase(DB.generalLedger);
  return pages.map((p) => ({
    entry: text(p, "Entry").trim(),
    description: text(p, "Description"),
    property: text(p, "Property").trim(),
    account: num(p, "Account Number"),
    accountName: text(p, "Account Name"),
    debit: num(p, "Debit") ?? 0,
    credit: num(p, "Credit") ?? 0,
    date: dateStart(p, "Date"),
  }));
}

// "27 Horton Lower Unit" / "27 Horton" / "550 Second Street" → comparable keys.
function norm(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(unit|street|st|road|rd|avenue|ave|london|st thomas|thomas)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sameProperty(ledgerProperty: string, p: Property): boolean {
  const a = norm(ledgerProperty);
  if (!a) return false;
  return [p.name, p.address].some((n) => {
    const b = norm(n);
    return !!b && (b.startsWith(a) || a.startsWith(b));
  });
}

// A "REVERSAL — X" entry cancels X. Drop both so owners only see what stands.
function dropReversals(rows: LedgerRow[]): LedgerRow[] {
  const out = [...rows];
  for (const r of rows.filter((x) => /^reversal\s*[—–-]\s*/i.test(x.entry))) {
    const original = r.entry.replace(/^reversal\s*[—–-]\s*/i, "").trim();
    const i = out.findIndex((x) =>
      x.entry === original && x.account === r.account &&
      x.debit === r.credit && x.credit === r.debit);
    const self = out.indexOf(r);
    if (i >= 0 && self >= 0) {
      out.splice(Math.max(i, self), 1);
      out.splice(Math.min(i, self), 1);
    }
  }
  return out;
}

function cleanEntry(entry: string, ownerNames: string[]): string {
  let s = entry
    .replace(/\brent earned\b/i, "rent")
    .replace(/,?\s*\d{4}-\d{2}-\d{2}\s*$/, "")
    .trim();
  for (const n of ownerNames) s = s.replace(new RegExp(`\\s*\\(${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`, "i"), "");
  return s;
}

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? full;
}

function joinNames(names: string[], sep: string): string {
  if (names.length <= 1) return names[0] ?? "";
  return names.slice(0, -1).join(", ") + sep + names[names.length - 1];
}

function money(n: number): string {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

/** period = "YYYY-MM" */
export async function buildStatements(period: string): Promise<{ statements: OwnerStatement[]; notes: Warning[] }> {
  const [y, m] = period.split("-").map(Number);
  const start = `${period}-01`;
  const end = `${period}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
  const monthLabel = `${MONTHS[m - 1]} ${y}`;

  const [ledgerRaw, owners, properties, tenants] = await Promise.all([
    fetchLedger(), fetchAllOwners(), fetchAllProperties(), fetchAllTenants(),
  ]);
  const ledger = dropReversals(ledgerRaw);

  // Problems with the books themselves, shown once at the top of the page.
  const notes: Warning[] = [];
  const undated = ledger.filter((r) => !r.date && r.account === OWNER_FUNDS);
  if (undated.length) {
    notes.push({ level: "red", text: `${undated.length} owner line${undated.length === 1 ? " has" : "s have"} no date in the General Ledger, so ${undated.length === 1 ? "it's" : "they're"} left out: ${[...new Set(undated.map((r) => r.entry))].join("; ")}` });
  }
  const unmatched = [...new Set(ledger
    .filter((r) => r.account === OWNER_FUNDS && r.property && !properties.some((p) => sameProperty(r.property, p)))
    .map((r) => r.property))];
  if (unmatched.length) {
    notes.push({ level: "red", text: `These ledger properties don't match any property in Notion, so their lines are left out: ${unmatched.join(", ")}` });
  }

  // Co-owners who share a property get one statement together.
  const done = new Set<string>();
  const statements: OwnerStatement[] = [];

  for (const owner of owners) {
    if (done.has(owner.id) || owner.propertyIds.length === 0) continue;
    const mine = new Set(owner.propertyIds);
    const group: Owner[] = [owner, ...owners.filter((o) => o.id !== owner.id && o.propertyIds.some((p) => mine.has(p)))];
    group.forEach((o) => done.add(o.id));

    const propIds = new Set(group.flatMap((o) => o.propertyIds));
    const props = properties.filter((p) => propIds.has(p.id));
    if (!props.length) continue;

    const rows = ledger.filter((r) =>
      r.account === OWNER_FUNDS && r.date && props.some((p) => sameProperty(r.property, p)));
    const before = rows.filter((r) => r.date! < start);
    const during = rows.filter((r) => r.date! >= start && r.date! <= end);

    const names = group.map((o) => o.name).filter(Boolean);
    const lines: StatementLine[] = during
      .sort((a, b) => a.date!.localeCompare(b.date!))
      .map((r) => {
        const pair = ledger.filter((x) => x.entry === r.entry && x !== r);
        let kind: LineKind;
        let description: string;
        if (r.credit > 0) {
          kind = /\brent\b/i.test(r.entry) ? "rent" : "other";
          description = cleanEntry(r.entry, names);
        } else if (pair.some((x) => x.account === MGMT_FEES)) {
          kind = "fee";
          description = "Management fee";
        } else if (/payout/i.test(r.entry)) {
          kind = "payout";
          description = "Paid to you";
        } else {
          kind = "expense";
          description = cleanEntry(r.entry, names);
        }
        return { date: r.date!, description, property: r.property, kind, moneyIn: r.credit, moneyOut: r.debit };
      });

    const sum = (k: LineKind, f: "moneyIn" | "moneyOut") => lines.filter((l) => l.kind === k).reduce((s, l) => s + l[f], 0);
    const openingBalance = before.reduce((s, r) => s + r.credit - r.debit, 0);
    const rent = sum("rent", "moneyIn");
    const otherIn = sum("other", "moneyIn");
    const fees = sum("fee", "moneyOut");
    const expenses = sum("expense", "moneyOut") + sum("other", "moneyOut") + sum("rent", "moneyOut");
    const payouts = sum("payout", "moneyOut");
    const net = rent + otherIn - fees - expenses;
    const closingBalance = openingBalance + net - payouts;

    const warnings: Warning[] = [];
    const emails = [...new Set(group.map((o) => o.email.trim().toLowerCase()).filter(Boolean))];
    if (!emails.length) warnings.push({ level: "red", text: "No email address for this owner in Notion." });

    for (const p of props) {
      const occupied = /occupied/i.test(p.status);
      const hasRent = lines.some((l) => l.kind === "rent" && sameProperty(l.property, p));
      if (occupied && !hasRent) warnings.push({ level: "red", text: `No rent recorded for ${p.name} in ${monthLabel}. Notion says it's occupied.` });
      const ended = tenants.filter((t: Tenant) => t.propertyId === p.id && t.leaseEnd && t.leaseEnd <= end && !/moved out|former|past/i.test(t.status));
      if (ended.length) {
        const last = ended.map((t) => t.leaseEnd!).sort().pop()!;
        warnings.push({ level: "amber", text: `${ended.length} lease${ended.length === 1 ? "" : "s"} at ${p.name} ended by ${last}. Renewed, month-to-month, or moved out? Update Notion so this is right.` });
      }
    }
    if (lines.length === 0) warnings.push({ level: "red", text: `Nothing in the General Ledger for ${monthLabel}. This statement would be empty.` });
    if (closingBalance < -0.005) warnings.push({ level: "amber", text: `The owner ends the month owing ${money(-closingBalance)}. Check that's right before sending.` });

    statements.push({
      period,
      monthLabel,
      ownerKey: group.map((o) => o.id).sort().join(","),
      ownerIds: group.map((o) => o.id),
      ownerNames: joinNames(names, " & "),
      greeting: joinNames(names.map(firstName), " and "),
      emails,
      properties: props.map((p) => p.name),
      openingBalance, lines, rent, otherIn, fees, expenses, payouts, net, closingBalance,
      warnings,
    });
  }

  return { statements, notes };
}

export function previousPeriod(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Email ─────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

function day(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export function statementSubject(s: OwnerStatement, correction = false): string {
  return `${correction ? "Corrected: " : ""}Your ${s.monthLabel} statement, ${s.properties.join(" & ")}`;
}

export function statementHTML(s: OwnerStatement, opts: { portalUrl?: string; correction?: boolean } = {}): string {
  const navy = "#1F2F3A", muted = "#666666", border = "#E4DFD7";
  const row = (label: string, value: number, strong = false, sign: "+" | "−" | "" = "") => `
    <tr>
      <td style="padding:8px 0;color:${strong ? navy : "#333"};font-weight:${strong ? 700 : 400}">${label}</td>
      <td style="padding:8px 0;text-align:right;color:${strong ? navy : "#333"};font-weight:${strong ? 700 : 400}">${sign}${money(Math.abs(value))}</td>
    </tr>`;

  const summary = [
    s.openingBalance !== 0 ? row("Balance from last month", s.openingBalance) : "",
    row("Rent collected", s.rent, false, "+"),
    s.otherIn ? row("Other money in", s.otherIn, false, "+") : "",
    s.fees ? row("Management fee", s.fees, false, "−") : "",
    s.expenses ? row("Expenses", s.expenses, false, "−") : "",
    `<tr><td colspan="2" style="border-top:1px solid ${border}"></td></tr>`,
    row("Your net for the month", s.net, true),
    s.payouts ? row("Paid to you", s.payouts, false, "−") : "",
    `<tr><td colspan="2" style="border-top:1px solid ${border}"></td></tr>`,
    s.closingBalance < -0.005
      ? row("You owe Prospera", -s.closingBalance, true)
      : row("Held for you", s.closingBalance, true),
  ].join("");

  const lines = s.lines.map((l) => `
    <tr>
      <td style="padding:10px 8px 10px 0;border-bottom:1px solid ${border};color:${muted};white-space:nowrap;vertical-align:top">${day(l.date)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid ${border};color:#333;vertical-align:top">${esc(l.description)}</td>
      <td style="padding:10px 0 10px 8px;border-bottom:1px solid ${border};text-align:right;white-space:nowrap;vertical-align:top;color:#222222">
        ${l.moneyIn ? "+" + money(l.moneyIn) : "−" + money(l.moneyOut)}
      </td>
    </tr>`).join("");

  return `<!doctype html><html><body style="margin:0;background:#F7F5F2;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px">
    <div style="background:#fff;border:1px solid ${border};border-radius:14px;padding:32px 28px">
      <div style="font-size:13px;color:${muted};font-weight:600">Prospera Properties</div>
      <h1 style="font-size:24px;color:${navy};margin:6px 0 4px">${esc(s.monthLabel)} statement</h1>
      <div style="color:${muted};margin-bottom:24px">${esc(s.properties.join(" · "))}</div>

      <p style="margin:0 0 16px;color:#333">Hi ${esc(s.greeting)},</p>
      ${opts.correction ? `<p style="margin:0 0 16px;color:#333">This replaces the statement you got earlier this month. That one had the wrong numbers. These are right, and every line comes straight from our books.</p>` : `<p style="margin:0 0 16px;color:#333">Here's what came in and went out for your property in ${esc(s.monthLabel)}.</p>`}

      <table style="width:100%;border-collapse:collapse;margin:8px 0 28px">${summary}</table>

      <div style="font-weight:700;color:${navy};margin-bottom:6px">Every line</div>
      ${s.lines.length
        ? `<table style="width:100%;border-collapse:collapse;font-size:14px">${lines}</table>`
        : `<p style="color:${muted}">Nothing came in or went out this month.</p>`}

      <p style="margin:28px 0 0;color:#333">Questions about any line? Just reply to this email.</p>
      ${opts.portalUrl ? `<p style="margin:12px 0 0"><a href="${opts.portalUrl}" style="color:#8B2030;font-weight:600">See your owner dashboard</a></p>` : ""}
      <p style="margin:24px 0 0;color:#333">Ebin Jaison<br><span style="color:${muted}">Prospera Properties · (519) 697-1227</span></p>
    </div>
  </div>
</body></html>`;
}
