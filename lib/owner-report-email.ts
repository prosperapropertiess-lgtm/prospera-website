import type { OwnerBundle, PropertyReport } from "@/lib/notion";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LookingAheadItem {
  title: string;
  description: string;
}

export interface CriticalAlert {
  title: string;
  body: string;
  ctaLabel: string;
}

export interface ClaudeNarrative {
  subject: string;
  openingSentence: string;
  lookingAhead: LookingAheadItem[];
  criticalAlert: CriticalAlert | null;
  closingNote: string;
  joke: string;
}

// ── Design tokens ──────────────────────────────────────────────────────────
const BG       = "#f8f7f4";
const NAVY     = "#1F2F3A";
const BURGUNDY = "#8B2030";
const WHITE    = "#ffffff";
const MUTED    = "#5a5f65";
const BORDER   = "#e4e2df";
const SURF     = "#f2f0ed";
const FH       = "'Outfit', Arial, sans-serif";
const FB       = "'Inter', Arial, sans-serif";

// ── Helpers ────────────────────────────────────────────────────────────────

export function formatDollars(n: number | null | undefined): string {
  if (n == null) return "$0";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function paymentStatusStyle(status: string): { color: string; bg: string; border: string } {
  const s = (status ?? "").toLowerCase();
  if (s === "paid" || s === "on time") return { color: "#166534", bg: "#dcfce7", border: "#86efac" };
  if (s.includes("late") || s.includes("overdue") || s.includes("unpaid")) return { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" };
  if (s.includes("partial")) return { color: "#92400e", bg: "#fef3c7", border: "#fcd34d" };
  return { color: MUTED, bg: SURF, border: BORDER };
}

function effectivePaid(r: { amountPaid: number | null; amountDue: number | null; paymentStatus: string }): number {
  const status = (r.paymentStatus ?? "").toLowerCase().trim();
  const isPaid = status === "paid" || status === "on time" || status === "partial";
  return r.amountPaid ?? (isPaid ? (r.amountDue ?? 0) : 0);
}

function leaseCountdown(leaseEnd: string | null): string {
  if (!leaseEnd) return "";
  const now = new Date();
  const end = new Date(leaseEnd);
  const totalDays = Math.floor((end.getTime() - now.getTime()) / 864e5);
  if (totalDays < 0) return "Expired";
  if (totalDays === 0) return "Expires today";
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  if (months === 0) return `${days} day${days !== 1 ? "s" : ""}`;
  if (days === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  return `${months} month${months !== 1 ? "s" : ""} and ${days} day${days !== 1 ? "s" : ""}`;
}

function leaseStatusDisplay(leaseEnd: string | null): { text: string; color: string } {
  if (!leaseEnd) return { text: "No end date on file", color: MUTED };
  const now = new Date();
  const end = new Date(leaseEnd);
  const daysLeft = Math.floor((end.getTime() - now.getTime()) / 864e5);
  if (daysLeft < 0) return { text: `Expired ${formatDate(leaseEnd)}`, color: "#991b1b" };
  const countdown = leaseCountdown(leaseEnd);
  if (daysLeft <= 90) return { text: `${formatDate(leaseEnd)} &middot; ${countdown}`, color: "#c2410c" };
  return { text: `${formatDate(leaseEnd)} &middot; ${countdown}`, color: NAVY };
}

// ── Property card ──────────────────────────────────────────────────────────

export function buildPropertySection(pr: PropertyReport, month: string, year: number): string {
  const { property, tenants, rentCurrentMonth, expensesCurrentMonth, rentYTD, maintenanceOpen } = pr;

  const totalRentCollected = rentCurrentMonth.reduce((s, r) => s + effectivePaid(r), 0);
  const totalRentDue       = rentCurrentMonth.reduce((s, r) => s + (r.amountDue ?? 0), 0);
  const totalExpenses      = expensesCurrentMonth.reduce((s, e) => s + (e.amount ?? 0), 0);
  const netToOwner         = totalRentCollected - totalExpenses;
  const ytdRent            = rentYTD.reduce((s, r) => s + effectivePaid(r), 0);
  const outstanding        = totalRentDue - totalRentCollected;

  const expByCat: Record<string, number> = {};
  for (const e of expensesCurrentMonth) {
    const cat = e.category || "Other";
    expByCat[cat] = (expByCat[cat] ?? 0) + (e.amount ?? 0);
  }

  const nextLease = tenants
    .filter(t => t.leaseEnd)
    .sort((a, b) => new Date(a.leaseEnd!).getTime() - new Date(b.leaseEnd!).getTime())[0];

  const leaseDisplay = tenants.length === 0
    ? { text: "No tenants", color: MUTED }
    : nextLease
      ? leaseStatusDisplay(nextLease.leaseEnd)
      : { text: "No end date on file", color: MUTED };

  const maintenanceBadge = maintenanceOpen.length > 0
    ? `<span style="font-family:${FB};font-size:10px;font-weight:700;color:${BURGUNDY};background:rgba(139,32,48,0.08);border:1px solid rgba(139,32,48,0.2);padding:3px 10px;border-radius:99px;white-space:nowrap;">${maintenanceOpen.length} open</span>`
    : "";

  const expenseRows = Object.entries(expByCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `
      <tr>
        <td style="padding:5px 0;font-family:${FB};font-size:12px;color:${MUTED};border-bottom:1px solid ${BORDER};">${cat}</td>
        <td style="padding:5px 0;font-family:${FB};font-size:12px;font-weight:600;color:${NAVY};text-align:right;border-bottom:1px solid ${BORDER};">${formatDollars(amt)}</td>
      </tr>`).join("");

  const unitRows = tenants.map(t => {
    const rentEntry = rentCurrentMonth.find(r => r.tenantId === t.id);
    const status    = rentEntry?.paymentStatus ?? "—";
    const datePaid  = rentEntry?.datePaid ?? null;
    const s         = paymentStatusStyle(status);
    const daysToExpiry = t.leaseEnd
      ? Math.floor((new Date(t.leaseEnd).getTime() - Date.now()) / 864e5)
      : null;
    const unitCountdown = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 90
      ? leaseCountdown(t.leaseEnd)
      : "";
    const leaseNote = unitCountdown
      ? `<p style="font-family:${FB};font-size:10px;color:#c2410c;margin:2px 0 0;font-weight:600;">Expires in ${unitCountdown}</p>`
      : (daysToExpiry !== null && daysToExpiry < 0)
        ? `<p style="font-family:${FB};font-size:10px;color:#991b1b;margin:2px 0 0;font-weight:600;">Lease expired ${formatDate(t.leaseEnd)}</p>`
        : !t.leaseEnd
          ? `<p style="font-family:${FB};font-size:10px;color:${MUTED};margin:2px 0 0;">No end date on file</p>`
          : "";

    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${SURF};vertical-align:middle;">
          <p style="font-family:${FB};font-size:13px;font-weight:600;color:${NAVY};margin:0;">${t.name}</p>
          <p style="font-family:${FB};font-size:11px;color:${MUTED};margin:2px 0 0;">${formatDollars(t.monthlyRent)}/mo${datePaid ? ` &middot; Paid ${formatDate(datePaid)}` : ""}</p>
          ${leaseNote}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${SURF};vertical-align:middle;text-align:right;">
          <span style="font-family:${FB};font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;border:1px solid ${s.border};background:${s.bg};color:${s.color};text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;">${status}</span>
        </td>
      </tr>`;
  }).join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border-radius:20px;border:1px solid ${BORDER};margin-bottom:16px;">
    <tr>
      <td style="padding:24px 28px 28px;">

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
          <tr>
            <td style="vertical-align:top;">
              <p style="font-family:${FH};font-size:18px;font-weight:700;color:${NAVY};margin:0 0 3px;">${(property.name || property.address).trim()}</p>
              <p style="font-family:${FB};font-size:11px;color:${MUTED};margin:0;">${[property.type, property.city].filter(Boolean).join(" &middot; ")}</p>
            </td>
            ${maintenanceBadge ? `<td style="vertical-align:top;text-align:right;white-space:nowrap;padding-left:12px;">${maintenanceBadge}</td>` : "<td></td>"}
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:${SURF};border-radius:14px;margin-bottom:16px;">
          <tr>
            <td width="50%" style="padding:16px 20px;border-right:1px solid ${BORDER};vertical-align:top;">
              <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${MUTED};margin:0 0 5px;">Net to Owner</p>
              <p style="font-family:${FH};font-size:28px;font-weight:700;color:${BURGUNDY};margin:0;letter-spacing:-0.01em;">${formatDollars(netToOwner)}</p>
            </td>
            <td width="50%" style="padding:16px 20px;vertical-align:top;">
              <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${MUTED};margin:0 0 5px;">Lease Status</p>
              <p style="font-family:${FB};font-size:12px;font-weight:500;color:${leaseDisplay.color};margin:0;line-height:1.5;">${leaseDisplay.text}</p>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td width="50%" style="padding-right:12px;vertical-align:top;">
              <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${MUTED};margin:0 0 4px;">Rent Collected</p>
              <p style="font-family:${FH};font-size:22px;font-weight:700;color:${NAVY};margin:0;">${formatDollars(totalRentCollected)}</p>
              ${outstanding > 0 ? `<p style="font-family:${FB};font-size:11px;color:#991b1b;margin:2px 0 0;font-weight:600;">${formatDollars(outstanding)} outstanding</p>` : ""}
            </td>
            <td width="50%" style="vertical-align:top;">
              <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${MUTED};margin:0 0 4px;">Expenses</p>
              <p style="font-family:${FH};font-size:22px;font-weight:700;color:${totalExpenses > 0 ? BURGUNDY : NAVY};margin:0;">${formatDollars(totalExpenses)}</p>
            </td>
          </tr>
        </table>

        ${expenseRows ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td>
              <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${MUTED};margin:0 0 6px;">Expense Breakdown</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(139,32,48,0.03);border-radius:10px;">
                <tr><td style="padding:4px 12px;">
                  <table width="100%" cellpadding="0" cellspacing="0">${expenseRows}</table>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>` : ""}

        ${unitRows ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td style="border-top:1px solid ${BORDER};padding-top:14px;">
              <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${MUTED};margin:0 0 2px;">Tenants</p>
              <table width="100%" cellpadding="0" cellspacing="0">${unitRows}</table>
            </td>
          </tr>
        </table>` : ""}

        <table width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY};border-radius:14px;">
          <tr>
            <td style="padding:16px 20px;vertical-align:middle;">
              <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.5);margin:0 0 3px;">YTD Since Managed</p>
              <p style="font-family:${FH};font-size:26px;font-weight:700;color:${WHITE};margin:0;letter-spacing:-0.01em;">${formatDollars(ytdRent)}</p>
            </td>
            <td style="padding:16px 20px;text-align:right;vertical-align:middle;">
              <span style="font-family:${FB};font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);background:rgba(255,255,255,0.1);padding:4px 12px;border-radius:99px;white-space:nowrap;">Jan–${month}</span>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>`;
}

// ── Full email ─────────────────────────────────────────────────────────────

export function buildEmailHTML(
  bundle: OwnerBundle,
  narrative: ClaudeNarrative,
  ownerNames: string,
  isDraft: boolean = true
): string {
  const { month, year, properties, owners } = bundle;

  const portfolioRent     = properties.reduce((s, pr) => s + pr.rentCurrentMonth.reduce((ss, r) => ss + effectivePaid(r), 0), 0);
  const portfolioExpenses = properties.reduce((s, pr) => s + pr.expensesCurrentMonth.reduce((ss, e) => ss + (e.amount ?? 0), 0), 0);
  const portfolioNet      = portfolioRent - portfolioExpenses;
  const totalMaint        = properties.reduce((s, pr) => s + pr.maintenanceOpen.length, 0);

  const ownerFirstNames  = owners.map(o => o.name.split(" ")[0]).join(" & ");
  const propertySections = properties.map(pr => buildPropertySection(pr, month, year)).join("");

  const actionItems = [
    ...(narrative.criticalAlert
      ? [{ title: narrative.criticalAlert.title, desc: narrative.criticalAlert.body, critical: true }]
      : []),
    ...narrative.lookingAhead.map(i => ({ title: i.title, desc: i.description, critical: false })),
  ];

  const actionRows = actionItems.slice(0, 3).map((item, i) => `
    <tr>
      <td style="padding:${i > 0 ? "14px" : "0"} 0 14px;border-bottom:${i < Math.min(actionItems.length, 3) - 1 ? "1px solid rgba(139,32,48,0.1)" : "none"};">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="vertical-align:top;width:20px;padding-top:4px;">
              <div style="width:7px;height:7px;border-radius:99px;background:${item.critical ? "#ef4444" : BURGUNDY};"></div>
            </td>
            <td>
              <p style="font-family:${FH};font-size:16px;font-weight:600;color:${NAVY};margin:0 0 4px;">${item.title}</p>
              <p style="font-family:${FB};font-size:13px;color:${MUTED};margin:0;line-height:1.65;">${item.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  const draftOwners = owners.filter(o => o.email).map(o => `${o.name} &lt;${o.email}&gt;`).join(", ");
  const draftBannerHtml = isDraft ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#92400e;">
    <tr><td style="padding:10px 24px;text-align:center;">
      <p style="font-family:${FB};font-size:11px;font-weight:700;color:#fff;margin:0;text-transform:uppercase;letter-spacing:0.08em;">DRAFT &mdash; Review and send manually to: ${draftOwners}</p>
    </td></tr>
  </table>` : "";

  void ownerNames;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="color-scheme" content="light only"/>
<meta name="supported-color-schemes" content="light only"/>
<title>${narrative.subject}</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  :root { color-scheme: light only; }
  body { background-color:${BG} !important; margin:0 !important; padding:0 !important; }
</style>
</head>
<body style="background:${BG};margin:0;padding:0;-webkit-font-smoothing:antialiased;">

${draftBannerHtml}

<table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:${BG};">

        <!-- HEADER -->
        <tr>
          <td style="padding:44px 24px 28px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:${WHITE};border-radius:12px;padding:8px 18px;line-height:0;">
                  <img alt="Prospera Properties" src="https://www.prosperaproperties.co/logo.png"
                    style="height:30px;width:auto;display:block;"
                    onerror="this.style.display='none'"/>
                </td>
              </tr>
            </table>
            <p style="font-family:${FH};font-size:54px;font-weight:700;color:${NAVY};margin:0 0 8px;letter-spacing:-0.03em;line-height:1;">${month} ${year}</p>
            <p style="font-family:${FB};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${BURGUNDY};margin:0;">Monthly Portfolio Report</p>
          </td>
        </tr>

        <!-- OWNER GREETING -->
        <tr>
          <td style="padding:0 24px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border-radius:20px;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:28px 32px 24px;">
                  <p style="font-family:${FH};font-size:26px;font-weight:700;color:${NAVY};margin:0 0 10px;letter-spacing:-0.01em;">Hi ${ownerFirstNames},</p>
                  <p style="font-family:${FB};font-size:15px;color:#4a4f55;margin:0;line-height:1.8;">${narrative.openingSentence}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- PORTFOLIO SUMMARY -->
        <tr>
          <td style="padding:0 24px 12px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border-radius:20px;border:1px solid ${BORDER};">
              <tr>
                <td width="33%" style="padding:22px 16px;text-align:center;border-right:1px solid ${BORDER};vertical-align:middle;">
                  <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:${MUTED};margin:0 0 6px;">Total Income</p>
                  <p style="font-family:${FH};font-size:26px;font-weight:700;color:${NAVY};margin:0;letter-spacing:-0.01em;">${formatDollars(portfolioRent)}</p>
                </td>
                <td width="33%" style="padding:22px 16px;text-align:center;border-right:1px solid ${BORDER};vertical-align:middle;">
                  <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:${MUTED};margin:0 0 6px;">Expenses</p>
                  <p style="font-family:${FH};font-size:26px;font-weight:700;color:${NAVY};margin:0;letter-spacing:-0.01em;">${formatDollars(portfolioExpenses)}</p>
                </td>
                <td width="33%" style="padding:22px 16px;text-align:center;vertical-align:middle;">
                  <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:${MUTED};margin:0 0 6px;">Net to You</p>
                  <p style="font-family:${FH};font-size:26px;font-weight:700;color:${BURGUNDY};margin:0;letter-spacing:-0.01em;">${formatDollars(portfolioNet)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAINTENANCE STATUS -->
        <tr>
          <td style="padding:0 24px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${totalMaint > 0 ? "rgba(139,32,48,0.04)" : "rgba(22,101,52,0.04)"};border-radius:12px;border:1px solid ${totalMaint > 0 ? "rgba(139,32,48,0.18)" : "rgba(22,101,52,0.18)"};">
              <tr>
                <td style="padding:14px 20px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:10px;font-size:15px;">${totalMaint > 0 ? "&#9888;&#65039;" : "&#9989;"}</td>
                      <td style="vertical-align:middle;">
                        <p style="font-family:${FB};font-size:13px;font-weight:600;color:${totalMaint > 0 ? BURGUNDY : "#166534"};margin:0;">
                          ${totalMaint > 0 ? `${totalMaint} open maintenance request${totalMaint > 1 ? "s" : ""} pending` : "No open maintenance &mdash; all clear"}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${actionItems.length > 0 ? `
        <!-- ACTIONS REQUIRED -->
        <tr>
          <td style="padding:0 24px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(139,32,48,0.03);border:1.5px solid rgba(139,32,48,0.18);border-radius:20px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="font-family:${FH};font-size:18px;font-weight:700;color:${BURGUNDY};margin:0 0 18px;">Actions Required</p>
                  <table width="100%" cellpadding="0" cellspacing="0">${actionRows}</table>
                  ${narrative.criticalAlert ? `
                  <table cellpadding="0" cellspacing="0" style="margin-top:18px;">
                    <tr>
                      <td>
                        <a href="mailto:hello@prosperaproperties.co" style="display:inline-block;background:${BURGUNDY};color:${WHITE};padding:12px 32px;border-radius:12px;font-family:${FB};font-size:13px;font-weight:700;text-decoration:none;">${narrative.criticalAlert.ctaLabel}</a>
                      </td>
                    </tr>
                  </table>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ""}

        <!-- PROPERTY BREAKDOWN -->
        <tr>
          <td style="padding:0 24px 8px;">
            <p style="font-family:${FH};font-size:22px;font-weight:700;color:${NAVY};margin:0 0 16px;">Your Properties</p>
            ${propertySections}
          </td>
        </tr>

        <!-- THANK YOU + JOKE -->
        <tr>
          <td style="padding:8px 24px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border-radius:20px;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:28px 32px;">
                  <p style="font-family:${FH};font-size:26px;font-weight:700;color:${NAVY};margin:0 0 6px;">Thank you, ${ownerFirstNames}!</p>
                  <p style="font-family:${FB};font-size:13px;color:${MUTED};margin:0 0 20px;line-height:1.65;">We appreciate your continued trust in Prospera Properties. We&rsquo;re here for you every step of the way.</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:${SURF};border-radius:14px;">
                    <tr>
                      <td style="padding:18px 20px;border-left:3px solid ${BURGUNDY};border-radius:0 14px 14px 0;">
                        <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:${BURGUNDY};margin:0 0 10px;">&#129302; My AI assistant wrote this for you</p>
                        <p style="font-family:${FH};font-size:17px;font-weight:500;color:${NAVY};margin:0;line-height:1.8;">${narrative.joke || "Why do landlords make great comedians? Because they always know how to raise the rent &mdash; and the roof!"}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MANAGER CONTACT -->
        <tr>
          <td style="padding:0 24px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${SURF};border-radius:20px;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:24px 28px;">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="vertical-align:middle;padding-right:16px;width:60px;">
                        <div style="width:56px;height:56px;border-radius:99px;overflow:hidden;border:2px solid ${BORDER};">
                          <img alt="Ebin Jaison" src="https://www.prosperaproperties.co/ebin-founder.jpg"
                            style="width:56px;height:56px;object-fit:cover;display:block;"
                            onerror="this.style.display='none'"/>
                        </div>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="font-family:${FH};font-size:16px;font-weight:700;color:${NAVY};margin:0 0 2px;">Ebin Jaison</p>
                        <p style="font-family:${FB};font-size:11px;color:${MUTED};margin:0 0 12px;">Your Property Manager &bull; Prospera Properties</p>
                        <table cellpadding="0" cellspacing="6">
                          <tr>
                            <td>
                              <a href="mailto:hello@prosperaproperties.co" style="display:block;background:${WHITE};border:1px solid ${BORDER};border-radius:8px;padding:7px 14px;font-family:${FB};font-size:11px;font-weight:600;color:${NAVY};text-decoration:none;white-space:nowrap;">Email</a>
                            </td>
                            <td>
                              <a href="tel:+15196971227" style="display:block;background:${WHITE};border:1px solid ${BORDER};border-radius:8px;padding:7px 14px;font-family:${FB};font-size:11px;font-weight:600;color:${NAVY};text-decoration:none;white-space:nowrap;">(519) 697-1227</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${NAVY};padding:40px 24px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td style="background:rgba(255,255,255,0.08);border-radius:10px;padding:7px 14px;line-height:0;">
                  <img alt="Prospera Properties" src="https://www.prosperaproperties.co/logo.png"
                    style="height:22px;width:auto;display:block;"
                    onerror="this.style.display='none'"/>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
              <tr>
                <td style="padding:0 12px;">
                  <a href="mailto:hello@prosperaproperties.co" style="font-family:${FB};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);text-decoration:none;">Support</a>
                </td>
                <td style="color:rgba(255,255,255,0.15);">&bull;</td>
                <td style="padding:0 12px;">
                  <a href="mailto:hello@prosperaproperties.co?subject=Unsubscribe" style="font-family:${FB};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);text-decoration:none;">Unsubscribe</a>
                </td>
              </tr>
            </table>
            <p style="font-family:${FB};font-size:11px;color:rgba(255,255,255,0.25);margin:0;line-height:1.75;">
              &copy; ${year} Prospera Properties Management Group. All rights reserved.<br/>
              Financial data reflects cleared transactions as of the last business day of the reporting period.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}
