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
}

// ── Design tokens ──────────────────────────────────────────────────────────
const BG        = "#fbf9f6";
const NAVY      = "#1F2F3A";
const BURGUNDY  = "#8B2030";
const WHITE     = "#ffffff";
const MUTED     = "#43474b";
const BORDER    = "#e4e2df";
const SURF_LOW  = "#f5f3f0";
const SURF_WARM = "#F7F5F2";
const FH        = "'Outfit', Arial, sans-serif";  // headings
const FB        = "'Inter', Arial, sans-serif";   // body

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
  return { color: MUTED, bg: SURF_LOW, border: BORDER };
}

function effectivePaid(r: { amountPaid: number | null; amountDue: number | null; paymentStatus: string }): number {
  const status = (r.paymentStatus ?? "").toLowerCase().trim();
  const isPaid = status === "paid" || status === "on time" || status === "partial";
  return r.amountPaid ?? (isPaid ? (r.amountDue ?? 0) : 0);
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

  // Expense breakdown by category
  const expByCat: Record<string, number> = {};
  for (const e of expensesCurrentMonth) {
    const cat = e.category || "Other";
    expByCat[cat] = (expByCat[cat] ?? 0) + (e.amount ?? 0);
  }

  // Earliest expiring active lease
  const nextLease = tenants
    .filter(t => t.leaseEnd)
    .sort((a, b) => new Date(a.leaseEnd!).getTime() - new Date(b.leaseEnd!).getTime())[0];
  const leaseStatusText = nextLease ? `Expires ${formatDate(nextLease.leaseEnd)}` : "—";

  // Unit rows
  const unitRows = tenants.map(t => {
    const rentEntry = rentCurrentMonth.find(r => r.tenantId === t.id);
    const status    = rentEntry?.paymentStatus ?? "—";
    const datePaid  = rentEntry?.datePaid ?? null;
    const s         = paymentStatusStyle(status);
    const daysToExpiry = t.leaseEnd
      ? Math.floor((new Date(t.leaseEnd).getTime() - Date.now()) / 864e5)
      : null;
    const leaseWarn = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 90
      ? `<p style="font-family:${FB};font-size:10px;color:#c2410c;margin:3px 0 0;font-weight:600;">Lease expires in ${daysToExpiry}d</p>`
      : "";
    return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${SURF_LOW};vertical-align:middle;">
          <p style="font-family:${FB};font-size:13px;font-weight:600;color:${NAVY};margin:0;">${t.name}</p>
          <p style="font-family:${FB};font-size:11px;color:${MUTED};margin:2px 0 0;">${formatDollars(t.monthlyRent)}/mo${datePaid ? ` &middot; Paid ${formatDate(datePaid)}` : ""}</p>
          ${leaseWarn}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${SURF_LOW};vertical-align:middle;text-align:right;">
          <span style="font-family:${FB};font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;border:1px solid ${s.border};background:${s.bg};color:${s.color};text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;">${status}</span>
        </td>
      </tr>`;
  }).join("");

  const expenseRows = Object.entries(expByCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `
      <tr>
        <td style="padding:7px 0;font-family:${FB};font-size:13px;color:${MUTED};">${cat}</td>
        <td style="padding:7px 0;font-family:${FB};font-size:13px;font-weight:600;color:${NAVY};text-align:right;">${formatDollars(amt)}</td>
      </tr>`).join("");

  const maintenanceBadge = maintenanceOpen.length > 0
    ? `<span style="font-family:${FB};font-size:10px;font-weight:700;color:${BURGUNDY};background:rgba(139,32,48,0.08);border:1px solid rgba(139,32,48,0.2);padding:3px 10px;border-radius:99px;white-space:nowrap;">${maintenanceOpen.length} open maintenance</span>`
    : "";

  return `
  <!-- Property: ${property.address} -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border-radius:24px;border:1px solid ${BORDER};margin-bottom:20px;">
    <tr>
      <td style="padding:24px 28px;">

        <!-- Name + meta + maintenance badge -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
          <tr>
            <td style="vertical-align:top;">
              <p style="font-family:${FH};font-size:20px;font-weight:500;color:${NAVY};margin:0 0 3px;">${property.address.trim()}</p>
              <p style="font-family:${FB};font-size:12px;color:${MUTED};margin:0;">${property.type} &middot; ${property.city} &middot; ${month} ${year}</p>
            </td>
            ${maintenanceBadge ? `<td style="vertical-align:top;text-align:right;white-space:nowrap;">${maintenanceBadge}</td>` : "<td></td>"}
          </tr>
        </table>

        <!-- Divider -->
        <div style="height:1px;background:${BORDER};margin:16px 0;"></div>

        <!-- Net to Owner / Lease Status -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
          <tr>
            <td width="50%" style="vertical-align:top;padding-right:12px;">
              <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};margin:0 0 5px;">Net to Owner</p>
              <p style="font-family:${FH};font-size:26px;font-weight:700;color:${BURGUNDY};margin:0;letter-spacing:-0.01em;">${formatDollars(netToOwner)}</p>
            </td>
            <td width="50%" style="vertical-align:top;text-align:right;">
              <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};margin:0 0 5px;">Lease Status</p>
              <p style="font-family:${FB};font-size:13px;font-weight:500;color:${NAVY};margin:0;">${leaseStatusText}</p>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <div style="height:1px;background:${BORDER};margin:16px 0;"></div>

        <!-- Total Rent / Total Expenses -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${expenseRows || unitRows ? "20px" : "0"};">
          <tr>
            <td width="50%" style="padding-right:12px;">
              <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};margin:0 0 5px;">Total Rent</p>
              <p style="font-family:${FH};font-size:20px;font-weight:700;color:${NAVY};margin:0;">${formatDollars(totalRentCollected)}</p>
              ${outstanding > 0 ? `<p style="font-family:${FB};font-size:11px;color:#991b1b;margin:3px 0 0;">${formatDollars(outstanding)} outstanding</p>` : ""}
            </td>
            <td width="50%">
              <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};margin:0 0 5px;">Total Expenses</p>
              <p style="font-family:${FH};font-size:20px;font-weight:700;color:${BURGUNDY};margin:0;">${formatDollars(totalExpenses)}</p>
            </td>
          </tr>
        </table>

        ${expenseRows ? `
        <!-- Expense Breakdown -->
        <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};margin:0 0 6px;">Expense Breakdown</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${unitRows ? "20px" : "0"};">
          ${expenseRows}
        </table>` : ""}

        ${unitRows ? `
        <!-- Divider -->
        <div style="height:1px;background:${BORDER};margin-bottom:14px;"></div>
        <!-- Unit Status -->
        <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};margin:0 0 2px;">Unit Status</p>
        <table width="100%" cellpadding="0" cellspacing="0">${unitRows}</table>` : ""}

        <!-- YTD -->
        <div style="margin-top:20px;background:${NAVY};border-radius:14px;padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle;">
                <p style="font-family:${FB};font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.55);margin:0 0 3px;">YTD Since Managed</p>
                <p style="font-family:${FH};font-size:26px;font-weight:700;color:${WHITE};margin:0;letter-spacing:-0.01em;">${formatDollars(ytdRent)}</p>
              </td>
              <td style="text-align:right;vertical-align:middle;">
                <span style="font-family:${FB};font-size:10px;font-weight:700;color:${WHITE};background:rgba(255,255,255,0.12);padding:4px 12px;border-radius:99px;white-space:nowrap;">Jan–${month}</span>
              </td>
            </tr>
          </table>
        </div>

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

  // Portfolio totals
  const portfolioRent     = properties.reduce((s, pr) => s + pr.rentCurrentMonth.reduce((ss, r) => ss + effectivePaid(r), 0), 0);
  const portfolioExpenses = properties.reduce((s, pr) => s + pr.expensesCurrentMonth.reduce((ss, e) => ss + (e.amount ?? 0), 0), 0);
  const portfolioNet      = portfolioRent - portfolioExpenses;
  const totalMaint        = properties.reduce((s, pr) => s + pr.maintenanceOpen.length, 0);

  const ownerFirstNames   = owners.map(o => o.name.split(" ")[0]).join(" & ");
  const propertySections  = properties.map(pr => buildPropertySection(pr, month, year)).join("");

  // Actions: critical alert + looking ahead
  const actionItems = [
    ...(narrative.criticalAlert
      ? [{ title: narrative.criticalAlert.title, desc: narrative.criticalAlert.body }]
      : []),
    ...narrative.lookingAhead.map(i => ({ title: i.title, desc: i.description })),
  ];

  const actionRows = actionItems.slice(0, 3).map((item, i) => `
    <tr>
      <td style="padding:${i > 0 ? "14px" : "0"} 0 14px;border-bottom:${i < Math.min(actionItems.length, 3) - 1 ? `1px solid rgba(139,32,48,0.1)` : "none"};">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="vertical-align:top;width:8px;padding-right:14px;padding-top:5px;">
              <div style="width:7px;height:7px;border-radius:99px;background:${BURGUNDY};"></div>
            </td>
            <td>
              <p style="font-family:${FH};font-size:16px;font-weight:600;color:${NAVY};margin:0 0 4px;">${item.title}</p>
              <p style="font-family:${FB};font-size:13px;color:${MUTED};margin:0;line-height:1.6;">${item.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  const draftOwners    = owners.filter(o => o.email).map(o => `${o.name} &lt;${o.email}&gt;`).join(", ");
  const draftBannerHtml = isDraft ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#92400e;">
    <tr><td style="padding:10px 24px;text-align:center;">
      <p style="font-family:${FB};font-size:11px;font-weight:700;color:#fff;margin:0;text-transform:uppercase;letter-spacing:0.08em;">DRAFT — Review and send manually to: ${draftOwners}</p>
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
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:${BG};">

        <!-- ── HEADER ── -->
        <tr>
          <td style="padding:40px 24px 28px;text-align:center;">
            <div style="display:inline-block;background:${WHITE};border-radius:12px;padding:8px 16px;margin-bottom:20px;line-height:0;">
              <img alt="Prospera Properties" src="https://www.prosperaproperties.co/logo.png"
                style="height:32px;width:auto;display:block;"
                onerror="this.style.display='none'"/>
            </div>
            <p style="font-family:${FB};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${BURGUNDY};margin:0 0 10px;">Portfolio Report</p>
            <!-- Month — prominent -->
            <p style="font-family:${FH};font-size:42px;font-weight:700;color:${NAVY};margin:0;letter-spacing:-0.02em;line-height:1;">${month} ${year}</p>
          </td>
        </tr>

        <!-- ── EXECUTIVE SUMMARY ── -->
        <tr>
          <td style="padding:0 24px 24px;">

            <p style="font-family:${FB};font-size:13px;color:${MUTED};text-align:center;margin:0 0 24px;">Prepared for ${ownerFirstNames} &bull; Prospera Properties</p>

            <!-- Dark summary card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY};border-radius:28px;margin-bottom:14px;">
              <tr>
                <td style="padding:36px 32px;text-align:center;">

                  <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.55);margin:0 0 8px;">Total Portfolio Income</p>
                  <p style="font-family:${FH};font-size:34px;font-weight:700;color:${WHITE};margin:0 0 28px;letter-spacing:-0.02em;">${formatDollars(portfolioRent)}</p>

                  <div style="height:1px;background:rgba(255,255,255,0.1);margin:0 0 28px;"></div>

                  <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.55);margin:0 0 8px;">Total Portfolio Expenses</p>
                  <p style="font-family:${FH};font-size:34px;font-weight:700;color:${WHITE};margin:0 0 28px;letter-spacing:-0.02em;">${formatDollars(portfolioExpenses)}</p>

                  <div style="height:1px;background:rgba(255,255,255,0.1);margin:0 0 28px;"></div>

                  <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.55);margin:0 0 8px;">Total Portfolio Net Income</p>
                  <p style="font-family:${FH};font-size:38px;font-weight:700;color:${WHITE};margin:0;letter-spacing:-0.02em;">${formatDollars(portfolioNet)}</p>

                </td>
              </tr>
            </table>

            <!-- Maintenance pill -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${SURF_LOW};border-radius:16px;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:16px 20px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:14px;">
                        <div style="width:40px;height:40px;border-radius:99px;background:rgba(139,32,48,0.08);text-align:center;line-height:40px;">
                          <span style="font-size:18px;">&#128295;</span>
                        </div>
                      </td>
                      <td style="vertical-align:middle;">
                        <p style="font-family:${FB};font-size:13px;font-weight:600;color:${NAVY};margin:0 0 2px;">${totalMaint > 0 ? `${String(totalMaint).padStart(2, "0")} Pending Maintenance Request${totalMaint > 1 ? "s" : ""}` : "No Open Maintenance"}</p>
                        <p style="font-family:${FB};font-size:12px;color:${MUTED};margin:0;">Maintenance status: <strong>${totalMaint === 0 ? "Healthy" : totalMaint > 3 ? "Needs Attention" : "Monitoring"}</strong></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── DIVIDER ── -->
        <tr>
          <td style="padding:0 24px 32px;">
            <div style="height:1px;background:${BORDER};"></div>
          </td>
        </tr>

        ${actionItems.length > 0 ? `
        <!-- ── ACTIONS REQUIRED ── -->
        <tr>
          <td style="padding:0 24px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(139,32,48,0.04);border:1px solid rgba(139,32,48,0.18);border-radius:20px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="font-family:${FH};font-size:20px;font-weight:600;color:${BURGUNDY};margin:0 0 20px;">Actions Required</p>
                  <table width="100%" cellpadding="0" cellspacing="0">${actionRows}</table>
                  ${narrative.criticalAlert ? `
                  <div style="margin-top:20px;text-align:center;">
                    <a href="mailto:prosperapropertiess@gmail.com" style="display:inline-block;background:${BURGUNDY};color:${WHITE};padding:12px 32px;border-radius:12px;font-family:${FB};font-size:13px;font-weight:700;text-decoration:none;">${narrative.criticalAlert.ctaLabel}</a>
                  </div>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ""}

        <!-- ── PROPERTY BREAKDOWN ── -->
        <tr>
          <td style="padding:0 24px 12px;">
            <h3 style="font-family:${FH};font-size:24px;font-weight:600;color:${NAVY};margin:0 0 20px;">Property Breakdown</h3>
            ${propertySections}
          </td>
        </tr>

        <!-- ── MANAGER SPOTLIGHT ── -->
        <tr>
          <td style="padding:0 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${SURF_WARM};border-radius:28px;border:1px solid rgba(195,199,203,0.25);">
              <tr>
                <td style="padding:40px 32px;text-align:center;">

                  <div style="width:96px;height:96px;border-radius:99px;overflow:hidden;margin:0 auto 14px;border:3px solid ${WHITE};box-shadow:0 2px 12px rgba(0,0,0,0.1);">
                    <img alt="Ebin Jaison" src="https://www.prosperaproperties.co/ebin-founder.jpg"
                      style="width:96px;height:96px;object-fit:cover;display:block;"
                      onerror="this.style.display='none'"/>
                  </div>

                  <p style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${BURGUNDY};margin:0 0 6px;">Your Property Manager</p>
                  <h3 style="font-family:${FH};font-size:22px;font-weight:600;color:${NAVY};margin:0 0 16px;">Ebin Jaison</h3>

                  <p style="font-family:${FB};font-size:14px;color:${MUTED};font-style:italic;line-height:1.75;margin:0 auto 28px;max-width:400px;">&ldquo;${narrative.closingNote}&rdquo;</p>

                  <!-- Contact buttons -->
                  <table cellpadding="0" cellspacing="8" style="margin:0 auto;">
                    <tr>
                      <td>
                        <a href="mailto:prosperapropertiess@gmail.com" style="display:block;background:${WHITE};border:1px solid ${BORDER};border-radius:10px;padding:11px 18px;font-family:${FB};font-size:12px;font-weight:600;color:${NAVY};text-decoration:none;white-space:nowrap;">prosperapropertiess@gmail.com</a>
                      </td>
                      <td>
                        <a href="tel:+15196971227" style="display:block;background:${WHITE};border:1px solid ${BORDER};border-radius:10px;padding:11px 18px;font-family:${FB};font-size:12px;font-weight:600;color:${NAVY};text-decoration:none;white-space:nowrap;">(519) 697-1227</a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:${NAVY};padding:48px 24px;text-align:center;">

            <div style="display:inline-block;background:rgba(255,255,255,0.08);border-radius:10px;padding:7px 14px;margin-bottom:24px;line-height:0;">
              <img alt="Prospera Properties" src="https://www.prosperaproperties.co/logo.png"
                style="height:24px;width:auto;display:block;"
                onerror="this.style.display='none'"/>
            </div>

            <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td style="padding:0 12px;">
                  <a href="mailto:prosperapropertiess@gmail.com" style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.45);text-decoration:none;">Support</a>
                </td>
                <td style="color:rgba(255,255,255,0.2);font-size:8px;">&bull;</td>
                <td style="padding:0 12px;">
                  <a href="mailto:prosperapropertiess@gmail.com?subject=Unsubscribe" style="font-family:${FB};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.45);text-decoration:none;">Unsubscribe</a>
                </td>
              </tr>
            </table>

            <p style="font-family:${FB};font-size:11px;color:rgba(255,255,255,0.3);margin:0 auto 8px;line-height:1.7;max-width:440px;">
              &copy; ${year} Prospera Properties Management Group. All rights reserved.<br/>
              Financial data is based on cleared transactions as of the last business day of the reporting period.
            </p>
            <p style="font-family:${FB};font-size:11px;color:rgba(255,255,255,0.3);margin:0;font-style:italic;">
              prosperapropertiess@gmail.com
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
