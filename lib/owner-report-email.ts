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
  if (s.includes("paid") || s === "on time") return { color: "#166534", bg: "#dcfce7", border: "#86efac" };
  if (s.includes("late") || s.includes("overdue") || s.includes("unpaid")) return { color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" };
  if (s.includes("partial")) return { color: "#92400e", bg: "#fef3c7", border: "#fcd34d" };
  return { color: "#43474b", bg: "#f5f3f0", border: "#c3c7cb" };
}

// ── Property section HTML ──────────────────────────────────────────────────

export function buildPropertySection(pr: PropertyReport, month: string, year: number): string {
  const { property, tenants, rentCurrentMonth, expensesCurrentMonth, rentYTD, maintenanceOpen } = pr;

  const totalRentCollected = rentCurrentMonth.reduce((s, r) => s + (r.amountPaid ?? 0), 0);
  const totalRentDue = rentCurrentMonth.reduce((s, r) => s + (r.amountDue ?? 0), 0);
  const totalExpenses = expensesCurrentMonth.reduce((s, e) => s + (e.amount ?? 0), 0);
  const netToOwner = totalRentCollected - totalExpenses;
  const ytdRent = rentYTD.reduce((s, r) => s + (r.amountPaid ?? 0), 0);

  // Group expenses by category
  const expenseByCategory: Record<string, number> = {};
  for (const e of expensesCurrentMonth) {
    const cat = e.category || "Other";
    expenseByCategory[cat] = (expenseByCategory[cat] ?? 0) + (e.amount ?? 0);
  }
  const expenseRows = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f3f0;font-family:Arial,sans-serif;font-size:13px;color:#43474b;">${cat}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f3f0;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1F2F3A;text-align:right;">${formatDollars(amt)}</td>
      </tr>
    `).join("");

  // Unit cards — match tenants to rent entries
  const unitCardsHtml = tenants.map(t => {
    const rentEntry = rentCurrentMonth.find(r => r.tenantId === t.id);
    const status = rentEntry?.paymentStatus ?? "—";
    const datePaid = rentEntry?.datePaid ?? null;
    const s = paymentStatusStyle(status);
    const leaseEnd = t.leaseEnd;
    const daysToExpiry = leaseEnd
      ? Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5)
      : null;
    const leaseWarningHtml = daysToExpiry !== null && daysToExpiry <= 90 && daysToExpiry >= 0
      ? `<div style="margin-top:12px;padding:8px 14px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa;">
           <span style="font-size:11px;font-weight:700;color:#c2410c;font-family:Arial,sans-serif;">
             ⚠️ Lease expires in ${daysToExpiry} days — ${formatDate(leaseEnd)}
           </span>
         </div>`
      : "";
    const leaseStartYear = t.leaseStart ? new Date(t.leaseStart).getFullYear() : null;

    return `
      <div style="padding:24px 28px;border:1px solid #e4e2df;border-radius:20px;background:#ffffff;margin-bottom:14px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#1F2F3A;">${t.name}</div>
              ${leaseStartYear ? `<div style="font-size:11px;color:#43474b;margin-top:2px;font-family:Arial,sans-serif;">Resident since ${leaseStartYear} · ${formatDollars(t.monthlyRent)}/mo</div>` : ""}
            </td>
            <td style="vertical-align:top;text-align:right;">
              <span style="font-size:9px;font-weight:700;padding:4px 10px;border-radius:99px;border:1px solid ${s.border};background:${s.bg};color:${s.color};text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;white-space:nowrap;">
                ${status}
              </span>
            </td>
          </tr>
        </table>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f5f3f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:11px;color:#43474b;font-family:Arial,sans-serif;opacity:0.7;">Last Payment Received</td>
              <td style="font-size:12px;font-weight:700;color:#1F2F3A;font-family:Arial,sans-serif;text-align:right;">${datePaid ? formatDate(datePaid) : "—"}</td>
            </tr>
          </table>
        </div>
        ${leaseWarningHtml}
      </div>
    `;
  }).join("");

  // Fallback: if no tenants matched, show rent entries directly
  const fallbackUnitsHtml = rentCurrentMonth.map(r => {
    const s = paymentStatusStyle(r.paymentStatus);
    return `
      <div style="padding:24px 28px;border:1px solid #e4e2df;border-radius:20px;background:#ffffff;margin-bottom:14px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#1F2F3A;">${r.entry}</td>
            <td style="text-align:right;">
              <span style="font-size:9px;font-weight:700;padding:4px 10px;border-radius:99px;border:1px solid ${s.border};background:${s.bg};color:${s.color};text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">
                ${r.paymentStatus}
              </span>
            </td>
          </tr>
        </table>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f5f3f0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:11px;color:#43474b;font-family:Arial,sans-serif;">Paid ${formatDollars(r.amountPaid)} of ${formatDollars(r.amountDue)}</td>
              <td style="font-size:12px;font-weight:700;color:#1F2F3A;font-family:Arial,sans-serif;text-align:right;">${r.datePaid ? formatDate(r.datePaid) : "—"}</td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }).join("");

  const unitsHtml = tenants.length > 0 ? unitCardsHtml : fallbackUnitsHtml;
  const maintenanceBadge = maintenanceOpen.length > 0
    ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:6px 14px;display:inline-block;">
         <span style="font-size:11px;font-weight:700;color:#c2410c;font-family:Arial,sans-serif;">
           ${maintenanceOpen.length} open maintenance item${maintenanceOpen.length > 1 ? "s" : ""}
         </span>
       </div>`
    : "";

  return `
    <!-- ═══ PROPERTY: ${property.address} ═══ -->
    <!-- Property Header -->
    <div style="padding:0 40px;margin-bottom:28px;">
      <table style="width:100%;border-collapse:collapse;border-bottom:1px solid #e4e2df;padding-bottom:16px;">
        <tr>
          <td style="vertical-align:bottom;padding-bottom:16px;">
            <div style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#1F2F3A;">${property.address}</div>
            <div style="font-family:Arial,sans-serif;font-size:12px;color:#43474b;margin-top:4px;">${property.city} · ${property.type} · ${month} ${year}</div>
          </td>
          <td style="vertical-align:bottom;text-align:right;padding-bottom:16px;">${maintenanceBadge}</td>
        </tr>
      </table>
    </div>

    <!-- Financial Card -->
    <div style="padding:0 40px;margin-bottom:28px;">
      <div style="border:1px solid #e4e2df;border-radius:24px;padding:40px;background:#ffffff;text-align:center;position:relative;">
        <!-- accent bar -->
        <div style="height:3px;width:72px;background:#8B2030;border-radius:0 0 6px 6px;margin:0 auto 28px;"></div>

        <p style="font-size:10px;font-weight:700;color:#43474b;text-transform:uppercase;letter-spacing:0.25em;margin:0 0 12px;font-family:Arial,sans-serif;">Net to Owner</p>
        <div style="font-family:Arial,sans-serif;font-size:48px;font-weight:700;color:#8B2030;margin-bottom:12px;letter-spacing:-0.02em;">${formatDollars(netToOwner)}</div>

        <div style="height:1px;width:100px;background:#e4e2df;margin:20px auto;"></div>

        <!-- Rent / Expenses side by side -->
        <table style="width:100%;max-width:280px;margin:0 auto 28px;border-collapse:collapse;">
          <tr>
            <td style="text-align:center;padding:0 20px;">
              <p style="font-size:10px;font-weight:700;color:#43474b;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 6px;font-family:Arial,sans-serif;opacity:0.7;">Total Rent</p>
              <p style="font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:#1F2F3A;margin:0;">${formatDollars(totalRentCollected)}</p>
              ${totalRentCollected < totalRentDue ? `<p style="font-size:10px;color:#991b1b;margin:4px 0 0;font-family:Arial,sans-serif;">${formatDollars(totalRentDue - totalRentCollected)} outstanding</p>` : ""}
            </td>
            <td style="text-align:center;padding:0 20px;border-left:1px solid #e4e2df;">
              <p style="font-size:10px;font-weight:700;color:#43474b;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 6px;font-family:Arial,sans-serif;opacity:0.7;">Expenses</p>
              <p style="font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:#8B2030;margin:0;">${formatDollars(totalExpenses)}</p>
            </td>
          </tr>
        </table>

        ${expenseRows ? `
        <!-- Expense Breakdown -->
        <div style="max-width:300px;margin:0 auto;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td colspan="2" style="padding-bottom:12px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:#43474b;font-family:Arial,sans-serif;opacity:0.5;white-space:nowrap;padding-right:12px;">Expense Breakdown</td>
                    <td style="border-top:1px solid #e4e2df;width:100%;"></td>
                  </tr>
                </table>
              </td>
            </tr>
            ${expenseRows}
          </table>
        </div>` : ""}
      </div>
    </div>

    <!-- YTD Bar -->
    <div style="padding:0 40px;margin-bottom:28px;">
      <div style="background:#1F2F3A;border-radius:14px;padding:20px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td>
              <p style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.2em;margin:0 0 4px;font-family:Arial,sans-serif;">Year-to-Date Rent Collected</p>
              <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;">${formatDollars(ytdRent)}</div>
            </td>
            <td style="text-align:right;vertical-align:middle;">
              <span style="font-size:11px;font-weight:700;color:#ffffff;background:#8B2030;padding:4px 12px;border-radius:99px;font-family:Arial,sans-serif;white-space:nowrap;">Jan–${month}</span>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Unit Status -->
    ${unitsHtml ? `
    <div style="padding:0 40px;margin-bottom:40px;">
      <div style="font-family:Arial,sans-serif;font-size:17px;font-weight:700;color:#1F2F3A;margin:0 0 20px;">Unit Status</div>
      ${unitsHtml}
    </div>` : ""}
  `;
}

// ── Full email HTML builder ────────────────────────────────────────────────

export function buildEmailHTML(
  bundle: OwnerBundle,
  narrative: ClaudeNarrative,
  ownerNames: string,
  isDraft: boolean = true
): string {
  const { month, year, properties, owners } = bundle;

  const ownerFirstNames = owners.map(o => o.name.split(" ")[0]).join(" & ");
  const primaryAddress = properties.length === 1
    ? properties[0].property.address
    : `Your ${properties.length} Properties`;

  const propertySectionsHtml = properties
    .map((pr, i) =>
      buildPropertySection(pr, month, year) +
      (i < properties.length - 1
        ? '<div style="height:1px;background:#e4e2df;margin:20px 40px 40px;"></div>'
        : "")
    )
    .join("");

  const lookingAheadHtml = narrative.lookingAhead
    .map(item => `
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="width:44px;vertical-align:top;">
            <div style="width:36px;height:36px;border-radius:10px;background:#f5f3f0;text-align:center;line-height:36px;font-size:16px;">→</div>
          </td>
          <td style="vertical-align:top;padding-left:16px;">
            <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1F2F3A;margin-bottom:4px;">${item.title}</div>
            <div style="font-family:Arial,sans-serif;font-size:12px;color:#43474b;line-height:1.6;">${item.description}</div>
          </td>
        </tr>
      </table>
    `).join("");

  const criticalAlertHtml = narrative.criticalAlert ? `
    <!-- Critical Alert -->
    <div style="padding:0 40px;margin-bottom:64px;">
      <div style="background:#1F2F3A;border-radius:24px;padding:40px;text-align:center;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.25em;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;margin-bottom:14px;">Action Required</div>
        <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;margin-bottom:14px;">${narrative.criticalAlert.title}</div>
        <p style="font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.8);max-width:300px;margin:0 auto 28px;line-height:1.7;">${narrative.criticalAlert.body}</p>
        <a href="mailto:prosperapropertiess@gmail.com" style="display:inline-block;background:#8B2030;color:#ffffff;padding:14px 36px;border-radius:12px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;">${narrative.criticalAlert.ctaLabel}</a>
      </div>
    </div>
  ` : "";

  const draftBannerOwners = owners
    .filter(o => o.email)
    .map(o => `${o.name} &lt;${o.email}&gt;`)
    .join(", ");

  const draftBannerHtml = isDraft ? `
<!-- Draft Banner -->
<div style="background:#92400e;padding:12px 24px;text-align:center;">
  <p style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;margin:0;text-transform:uppercase;letter-spacing:0.1em;">
    ⚠️ DRAFT — Review and send manually to: ${draftBannerOwners}
  </p>
</div>
` : "";

  // ownerNames param is available for future use (e.g. personalised subject lines)
  void ownerNames;

  return `<!DOCTYPE html>
<html lang="en" style="color-scheme:light !important;">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width,initial-scale=1.0" name="viewport"/>
<meta name="color-scheme" content="light"/>
<meta name="supported-color-schemes" content="light"/>
<title>${narrative.subject}</title>
<style>
  :root { color-scheme: light only; }
  body { color-scheme: light only; background-color: #F7F5F2 !important; }
  @media (prefers-color-scheme: dark) {
    html, body { background-color: #F7F5F2 !important; }
    .email-wrapper { background-color: #F7F5F2 !important; }
    .email-container { background-color: #fbf9f6 !important; }
    .hero-card { background: linear-gradient(135deg,#f5f3f0,#eae8e5) !important; }
    .hero-heading { color: #1F2F3A !important; }
    .hero-text { color: #43474b !important; }
    .hero-address { color: #8B2030 !important; }
    .section-heading { color: #1F2F3A !important; }
    .body-text { color: #1b1c1a !important; }
    .muted-text { color: #43474b !important; }
  }
</style>
</head>
<body style="background:#F7F5F2;margin:0;padding:0;-webkit-font-smoothing:antialiased;color-scheme:light !important;" bgcolor="#F7F5F2">

${draftBannerHtml}
<!-- Email Container -->
<div style="max-width:600px;margin:0 auto;background:#fbf9f6;overflow:hidden;">

  <!-- Header -->
  <div style="padding:28px 40px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td>
          <img alt="Prospera Properties" src="https://www.prosperaproperties.co/logo.png"
            style="height:36px;width:auto;display:block;"
            onerror="this.style.display='none'" />
        </td>
        <td style="text-align:right;">
          <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#43474b;text-transform:uppercase;letter-spacing:0.1em;">${month} ${year} Report</span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Hero -->
  <div style="padding:8px 40px 40px;">
    <div class="hero-card" style="background:linear-gradient(135deg,#f5f3f0,#eae8e5);border-radius:24px;padding:48px 40px;text-align:center;">
      <div style="display:inline-block;padding:4px 14px;background:#1F2F3A;color:#ffffff !important;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;border-radius:99px;margin-bottom:20px;font-family:Arial,sans-serif;">Monthly Report</div>
      <div class="hero-heading" style="font-family:Arial,sans-serif;font-size:28px;font-weight:700;color:#1F2F3A !important;margin:0 0 12px;">Hello ${ownerFirstNames},</div>
      <p class="hero-text" style="font-family:Arial,sans-serif;font-size:14px;color:#43474b !important;max-width:360px;margin:0 auto 20px;line-height:1.7;">${narrative.openingSentence}</p>
      <div class="hero-address" style="font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:#8B2030 !important;text-decoration:underline;text-underline-offset:4px;">${primaryAddress}</div>
      <div style="margin-top:24px;">
        <div style="width:56px;height:56px;border-radius:99px;overflow:hidden;margin:0 auto 8px;border:3px solid #ffffff;">
          <img alt="Ebin" src="https://www.prosperaproperties.co/ebin-founder.jpg"
            style="width:56px;height:56px;object-fit:cover;display:block;"
            onerror="this.style.display='none'" />
        </div>
        <div class="muted-text" style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#43474b !important;text-transform:uppercase;letter-spacing:0.2em;">Report by Ebin</div>
      </div>
    </div>
  </div>

  <!-- Property Sections -->
  ${propertySectionsHtml}

  <!-- Looking Ahead -->
  <div style="padding:0 40px;margin-bottom:56px;">
    <div style="font-family:Arial,sans-serif;font-size:17px;font-weight:700;color:#1F2F3A;margin:0 0 20px;">Looking Ahead</div>
    <div style="background:#ffffff;border-radius:20px;padding:28px 32px;border:1px solid #e4e2df;">
      ${lookingAheadHtml}
    </div>
    ${narrative.closingNote ? `
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#43474b;line-height:1.7;margin:20px 0 0;padding:0 4px;">${narrative.closingNote}</p>` : ""}
  </div>

  ${criticalAlertHtml}

  <!-- Footer -->
  <div style="background:#fbf9f6;padding:40px;text-align:center;border-top:1px solid #e4e2df;">
    <div style="width:56px;height:56px;border-radius:99px;overflow:hidden;margin:0 auto 16px;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <img alt="Ebin" src="https://www.prosperaproperties.co/ebin-founder.jpg"
        style="width:56px;height:56px;object-fit:cover;display:block;"
        onerror="this.style.display='none'" />
    </div>
    <div style="font-family:Arial,sans-serif;font-size:17px;font-weight:700;color:#1F2F3A;margin:0 0 4px;">Ebin</div>
    <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#43474b;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 16px;opacity:0.6;">Senior Property Manager</div>
    <p style="margin:0 0 4px;"><a href="mailto:prosperapropertiess@gmail.com" style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#8B2030;text-decoration:none;">prosperapropertiess@gmail.com</a></p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#43474b;margin:0 0 24px;">(519) 697-1227</p>
    <div style="border-top:1px solid #e4e2df;border-bottom:1px solid #e4e2df;padding:14px 0;margin:0 0 20px;">
      <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#43474b;opacity:0.7;">Prospera Properties</span>
    </div>
    <p style="font-family:Arial,sans-serif;font-size:9px;color:#43474b;opacity:0.4;text-transform:uppercase;letter-spacing:0.1em;margin:0;">
      © ${year} PROSPERA PROPERTIES MANAGEMENT GROUP
    </p>
  </div>

</div>
</body>
</html>`;
}
