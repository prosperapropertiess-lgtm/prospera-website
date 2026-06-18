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
const MUTED    = "#5a6472";
const BORDER   = "#e4e2df";
const SURF     = "#f2f0ed";
const GREEN    = "#0A7A52";
const GREEN_BG = "#eaf6f1";
const AMBER    = "#B45309";
const RED      = "#991b1b";
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
  if (s.includes("late") || s.includes("overdue") || s.includes("unpaid")) return { color: RED, bg: "#fee2e2", border: "#fca5a5" };
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
  if (daysLeft < 0) return { text: `Expired ${formatDate(leaseEnd)}`, color: RED };
  const countdown = leaseCountdown(leaseEnd);
  if (daysLeft <= 90) return { text: `${formatDate(leaseEnd)} &middot; ${countdown} left`, color: AMBER };
  return { text: `${formatDate(leaseEnd)} &middot; ${countdown} left`, color: NAVY };
}

// ── Label helper (replaces 9px labels everywhere) ─────────────────────────

function label(text: string, color: string = MUTED): string {
  return `<p style="font-family:${FB};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.10em;color:${color};margin:0 0 5px;">${text}</p>`;
}

// ── Property card ──────────────────────────────────────────────────────────

export function buildPropertySection(pr: PropertyReport, month: string, year: number, token?: string): string {
  const { property, tenants, rentCurrentMonth, expensesCurrentMonth, rentYTD, maintenanceOpen } = pr;

  const totalRentCollected = rentCurrentMonth.reduce((s, r) => s + effectivePaid(r), 0);
  const totalRentDue       = rentCurrentMonth.reduce((s, r) => s + (r.amountDue ?? 0), 0);
  const totalExpenses      = expensesCurrentMonth.reduce((s, e) => s + (e.amount ?? 0), 0);
  const netToOwner         = totalRentCollected - totalExpenses;
  const ytdRent            = rentYTD.reduce((s, r) => s + effectivePaid(r), 0);
  const ytdExpenses        = (pr as any).expensesYTD?.reduce((s: number, e: any) => s + (e.amount ?? 0), 0) ?? 0;
  const ytdNet             = ytdRent - ytdExpenses;
  const outstanding        = totalRentDue - totalRentCollected;
  const allCollected       = totalRentDue > 0 && outstanding <= 0;

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
    ? `<span style="font-family:${FB};font-size:11px;font-weight:700;color:${BURGUNDY};background:rgba(139,32,48,0.08);border:1px solid rgba(139,32,48,0.20);padding:4px 12px;border-radius:99px;white-space:nowrap;">${maintenanceOpen.length} open</span>`
    : `<span style="font-family:${FB};font-size:11px;font-weight:700;color:${GREEN};background:${GREEN_BG};border:1px solid rgba(10,122,82,0.20);padding:4px 12px;border-radius:99px;white-space:nowrap;">All clear</span>`;

  const expenseRows = Object.entries(expByCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `
      <tr>
        <td style="padding:6px 0;font-family:${FB};font-size:13px;color:${MUTED};border-bottom:1px solid ${BORDER};">${cat}</td>
        <td style="padding:6px 0;font-family:${FB};font-size:13px;font-weight:600;color:${NAVY};text-align:right;border-bottom:1px solid ${BORDER};">${formatDollars(amt)}</td>
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
      ? `<p style="font-family:${FB};font-size:11px;color:${AMBER};margin:3px 0 0;font-weight:600;">Expires in ${unitCountdown}</p>`
      : (daysToExpiry !== null && daysToExpiry < 0)
        ? `<p style="font-family:${FB};font-size:11px;color:${RED};margin:3px 0 0;font-weight:600;">Lease expired ${formatDate(t.leaseEnd)}</p>`
        : !t.leaseEnd
          ? `<p style="font-family:${FB};font-size:11px;color:${MUTED};margin:3px 0 0;">No end date on file</p>`
          : "";

    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${SURF};vertical-align:middle;">
          <p style="font-family:${FB};font-size:14px;font-weight:600;color:${NAVY};margin:0;">${t.name}</p>
          <p style="font-family:${FB};font-size:12px;color:${MUTED};margin:3px 0 0;">${formatDollars(t.monthlyRent)}/mo${datePaid ? ` &middot; Paid ${formatDate(datePaid)}` : ""}</p>
          ${leaseNote}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid ${SURF};vertical-align:middle;text-align:right;">
          <span style="font-family:${FB};font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;border:1px solid ${s.border};background:${s.bg};color:${s.color};text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;">${status}</span>
        </td>
      </tr>`;
  }).join("");

  // Net color: green if positive, red if negative
  const netColor = netToOwner >= 0 ? GREEN : RED;
  const ytdNetColor = ytdNet >= 0 ? GREEN : RED;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border-radius:20px;border:1px solid ${BORDER};border-top:2px solid ${netToOwner >= 0 ? GREEN : RED};margin-bottom:16px;">
    <tr>
      <td style="padding:24px 28px 28px;">

        <!-- Property name + maintenance badge -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            <td style="vertical-align:top;">
              <p style="font-family:${FH};font-size:20px;font-weight:700;color:${NAVY};margin:0 0 3px;">${(property.name || property.address).trim()}</p>
              <p style="font-family:${FB};font-size:12px;color:${MUTED};margin:0;">${[property.type, property.city].filter(Boolean).join(" &middot; ")}</p>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;padding-left:12px;">${maintenanceBadge}</td>
          </tr>
        </table>

        <!-- Big 3: Net / Collected / Expenses -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${SURF};border-radius:14px;margin-bottom:16px;">
          <tr>
            <td width="34%" style="padding:18px 20px;border-right:1px solid ${BORDER};vertical-align:top;">
              ${label("Net to Owner", netColor)}
              <p style="font-family:${FH};font-size:30px;font-weight:700;color:${netColor};margin:0;letter-spacing:-0.02em;">${formatDollars(netToOwner)}</p>
            </td>
            <td width="33%" style="padding:18px 16px;border-right:1px solid ${BORDER};vertical-align:top;">
              ${label("Rent Collected")}
              <p style="font-family:${FH};font-size:22px;font-weight:700;color:${NAVY};margin:0;">${formatDollars(totalRentCollected)}</p>
              ${allCollected
                ? `<p style="font-family:${FB};font-size:11px;color:${GREEN};margin:4px 0 0;font-weight:700;">&#10003; All collected</p>`
                : outstanding > 0
                  ? `<p style="font-family:${FB};font-size:11px;color:${AMBER};margin:4px 0 0;font-weight:700;">${formatDollars(outstanding)} outstanding</p>`
                  : ""}
            </td>
            <td width="33%" style="padding:18px 16px;vertical-align:top;">
              ${label("Expenses")}
              <p style="font-family:${FH};font-size:22px;font-weight:700;color:${NAVY};margin:0;">${formatDollars(totalExpenses)}</p>
            </td>
          </tr>
        </table>

        <!-- Lease status -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${expenseRows ? "16px" : "0"};">
          <tr>
            <td style="padding:12px 16px;background:${SURF};border-radius:10px;">
              ${label("Lease Status")}
              <p style="font-family:${FB};font-size:13px;font-weight:500;color:${leaseDisplay.color};margin:0;">${leaseDisplay.text}</p>
            </td>
          </tr>
        </table>

        ${expenseRows ? `
        <!-- Expense breakdown -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td>
              ${label("Expense Breakdown")}
              <table width="100%" cellpadding="0" cellspacing="0">${expenseRows}</table>
            </td>
          </tr>
        </table>` : ""}

        ${unitRows ? `
        <!-- Tenants -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td style="border-top:1px solid ${BORDER};padding-top:16px;">
              ${label("Tenants")}
              <table width="100%" cellpadding="0" cellspacing="0">${unitRows}</table>
            </td>
          </tr>
        </table>` : ""}

        <!-- YTD strip -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY};border-radius:14px;">
          <tr>
            <td style="padding:16px 20px;vertical-align:middle;">
              ${label("Year to Date · Jan–" + month, "rgba(255,255,255,0.45)")}
              <p style="font-family:${FH};font-size:26px;font-weight:700;color:${WHITE};margin:0;letter-spacing:-0.01em;">${formatDollars(ytdRent)} collected</p>
              <p style="font-family:${FB};font-size:13px;font-weight:600;color:${ytdNetColor === GREEN ? "#6ee7b7" : "#fca5a5"};margin:4px 0 0;">
                ${ytdNet >= 0 ? "+" : ""}${formatDollars(ytdNet)} net after expenses
              </p>
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
  isDraft: boolean = true,
  portalToken?: string
): string {
  const { month, year, properties, owners } = bundle;

  const portfolioRent     = properties.reduce((s, pr) => s + pr.rentCurrentMonth.reduce((ss, r) => ss + effectivePaid(r), 0), 0);
  const portfolioExpenses = properties.reduce((s, pr) => s + pr.expensesCurrentMonth.reduce((ss, e) => ss + (e.amount ?? 0), 0), 0);
  const portfolioNet      = portfolioRent - portfolioExpenses;
  const totalMaint        = properties.reduce((s, pr) => s + pr.maintenanceOpen.length, 0);

  const ownerFirstNames  = owners.map(o => o.name.split(" ")[0]).join(" & ");
  const propertySections = properties.map(pr => buildPropertySection(pr, month, year, portalToken)).join("");

  const netColor = portfolioNet >= 0 ? GREEN : RED;

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
            <td style="vertical-align:top;width:20px;padding-top:5px;">
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

  const portalCTA = portalToken ? `
        <!-- VIEW DASHBOARD CTA -->
        <tr>
          <td style="padding:0 24px 24px;text-align:center;">
            <a href="https://www.prosperaproperties.co/owners/${portalToken}"
               style="display:inline-block;background:${NAVY};color:${WHITE};padding:14px 36px;border-radius:14px;font-family:${FB};font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.01em;">
              View Full Dashboard &rarr;
            </a>
          </td>
        </tr>` : "";

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
            <p style="font-family:${FH};font-size:54px;font-weight:700;color:${NAVY};margin:0 0 6px;letter-spacing:-0.03em;line-height:1;">${month} ${year}</p>
            <p style="font-family:${FB};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.20em;color:${BURGUNDY};margin:0;">Monthly Portfolio Report</p>
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
          <td style="padding:0 24px 4px;">
            <p style="font-family:${FB};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.10em;color:${MUTED};margin:0 0 10px;">${month} ${year} &middot; Portfolio</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border-radius:20px;border:1px solid ${BORDER};border-top:2px solid ${netColor};">
              <tr>
                <td width="34%" style="padding:22px 16px;text-align:center;border-right:1px solid ${BORDER};vertical-align:middle;">
                  ${label("Net to You", netColor)}
                  <p style="font-family:${FH};font-size:30px;font-weight:700;color:${netColor};margin:0;letter-spacing:-0.02em;">${formatDollars(portfolioNet)}</p>
                </td>
                <td width="33%" style="padding:22px 16px;text-align:center;border-right:1px solid ${BORDER};vertical-align:middle;">
                  ${label("Rent Collected")}
                  <p style="font-family:${FH};font-size:24px;font-weight:700;color:${NAVY};margin:0;letter-spacing:-0.01em;">${formatDollars(portfolioRent)}</p>
                </td>
                <td width="33%" style="padding:22px 16px;text-align:center;vertical-align:middle;">
                  ${label("Expenses")}
                  <p style="font-family:${FH};font-size:24px;font-weight:700;color:${NAVY};margin:0;letter-spacing:-0.01em;">${formatDollars(portfolioExpenses)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MAINTENANCE STATUS -->
        <tr>
          <td style="padding:12px 24px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${totalMaint > 0 ? "rgba(139,32,48,0.04)" : GREEN_BG};border-radius:12px;border:1px solid ${totalMaint > 0 ? "rgba(139,32,48,0.18)" : "rgba(10,122,82,0.20)"};">
              <tr>
                <td style="padding:14px 20px;">
                  <p style="font-family:${FB};font-size:13px;font-weight:600;color:${totalMaint > 0 ? BURGUNDY : GREEN};margin:0;">
                    ${totalMaint > 0 ? `&#9888;&#65039; ${totalMaint} open maintenance request${totalMaint > 1 ? "s" : ""} pending` : "&#10003; No open maintenance &mdash; all clear"}
                  </p>
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
                        <a href="mailto:prosperapropertiess@gmail.com" style="display:inline-block;background:${BURGUNDY};color:${WHITE};padding:12px 32px;border-radius:12px;font-family:${FB};font-size:13px;font-weight:700;text-decoration:none;">${narrative.criticalAlert.ctaLabel}</a>
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
            <p style="font-family:${FB};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.10em;color:${MUTED};margin:0 0 12px;">Your Propert${properties.length > 1 ? "ies" : "y"}</p>
            ${propertySections}
          </td>
        </tr>

        ${portalCTA}

        <!-- THANK YOU + JOKE -->
        <tr>
          <td style="padding:8px 24px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border-radius:20px;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:28px 32px;">
                  <p style="font-family:${FH};font-size:24px;font-weight:700;color:${NAVY};margin:0 0 6px;">Thank you, ${ownerFirstNames}!</p>
                  <p style="font-family:${FB};font-size:13px;color:${MUTED};margin:0 0 20px;line-height:1.65;">We appreciate your continued trust in Prospera Properties.</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:${SURF};border-radius:14px;">
                    <tr>
                      <td style="padding:18px 20px;border-left:3px solid ${BURGUNDY};border-radius:0 14px 14px 0;">
                        <p style="font-family:${FB};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.10em;color:${BURGUNDY};margin:0 0 10px;">&#129302; This one's from Claude</p>
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
                        <p style="font-family:${FB};font-size:12px;color:${MUTED};margin:0 0 12px;">Your Property Manager &bull; Prospera Properties</p>
                        <table cellpadding="0" cellspacing="6">
                          <tr>
                            <td>
                              <a href="mailto:prosperapropertiess@gmail.com" style="display:block;background:${WHITE};border:1px solid ${BORDER};border-radius:8px;padding:8px 16px;font-family:${FB};font-size:12px;font-weight:600;color:${NAVY};text-decoration:none;white-space:nowrap;">Email</a>
                            </td>
                            <td>
                              <a href="tel:+15196971227" style="display:block;background:${WHITE};border:1px solid ${BORDER};border-radius:8px;padding:8px 16px;font-family:${FB};font-size:12px;font-weight:600;color:${NAVY};text-decoration:none;white-space:nowrap;">(519) 697-1227</a>
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
                  <a href="mailto:prosperapropertiess@gmail.com" style="font-family:${FB};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.10em;color:rgba(255,255,255,0.4);text-decoration:none;">Support</a>
                </td>
                <td style="color:rgba(255,255,255,0.15);">&bull;</td>
                <td style="padding:0 12px;">
                  <a href="mailto:prosperapropertiess@gmail.com?subject=Unsubscribe" style="font-family:${FB};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.10em;color:rgba(255,255,255,0.4);text-decoration:none;">Unsubscribe</a>
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
