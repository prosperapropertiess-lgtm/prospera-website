// ─────────────────────────────────────────────────────────────
// Prospera Properties — Email Templates
// Design: Navy #1F2F3A + Crimson #8B2030 + Warm neutrals
// Font: Arial/Helvetica (email-safe, no external fonts)
// ─────────────────────────────────────────────────────────────

const BASE_URL = "https://www.prosperaproperties.co";

// Palette
const NAVY    = "#1F2F3A";
const CRIMSON = "#8B2030";
const WHITE   = "#ffffff";
const TEXT    = "#1b1c1a";
const MUTED   = "#43474b";
const BORDER  = "#e4e2df";
const BG_OUTER   = "#F7F5F2";
const BG_CARD    = "#ffffff";
const BG_SUBTLE  = "#f5f3f0";
const BG_HERO    = "linear-gradient(135deg,#f5f3f0,#eae8e5)";

// Single font stack — no Google Fonts
const FONT = "Arial, Helvetica, sans-serif";

// ── Markdown → email HTML ────────────────────────────────────
function md(text: string): string {
  // 1. Bold
  let out = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 2. Collect bullet lines into <ul> blocks
  out = out.replace(/((?:^|\n)[-•*]\s+.+)+/g, (block) => {
    const items = block
      .trim()
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => l.replace(/^[-•*]\s+/, "").trim())
      .map((l) => `<li style="margin:0 0 8px;font-size:15px;line-height:1.7;color:${TEXT};font-family:${FONT};">${l}</li>`)
      .join("");
    return `\n<ul style="margin:12px 0 20px;padding-left:22px;">${items}</ul>\n`;
  });

  // 3. Section headings (##)
  out = out.replace(
    /^#{1,3}\s+(.+)$/gm,
    `<p style="margin:28px 0 8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">$1</p>`
  );

  // 4. Paragraph breaks
  const pStyle = `margin:0 0 16px;font-size:15px;line-height:1.8;color:${TEXT};font-family:${FONT};`;
  out = out
    .split(/\n{2,}/)
    .map((chunk) => {
      chunk = chunk.trim();
      if (!chunk) return "";
      if (chunk.startsWith("<ul") || chunk.startsWith("<p style=\"margin:28")) return chunk;
      return `<p style="${pStyle}">${chunk.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return out;
}

// ── Shared components ────────────────────────────────────────

function wrapper(content: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Prospera Properties</title>
  <style>
    @media only screen and (max-width: 620px) {
      .outer-pad { padding: 16px 8px !important; }
      .body-pad   { padding: 32px 24px !important; }
      .header-pad { padding: 24px !important; }
      .footer-pad { padding: 20px 24px !important; }
      .market-col { display: block !important; width: 100% !important; text-align: center !important; padding: 12px 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BG_OUTER};font-family:${FONT};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td class="outer-pad" align="center" style="padding:24px 16px;">
        <table cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#fbf9f6;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td class="header-pad" style="padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <img src="https://www.prosperaproperties.co/logo.png" alt="Prospera Properties" height="36" style="height:36px;width:auto;display:block;" onerror="this.style.display='none'" />
                  </td>
                  <td style="text-align:right;">
                    <span style="font-family:${FONT};font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;">PROSPERA PROPERTIES</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="body-pad" style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-pad" style="padding:40px;text-align:center;border-top:1px solid ${BORDER};">
              <div style="width:48px;height:48px;border-radius:99px;overflow:hidden;margin:0 auto 12px;border:3px solid ${WHITE};box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <img src="https://www.prosperaproperties.co/ebin-founder.jpg" alt="Ebin" width="48" height="48" style="width:48px;height:48px;object-fit:cover;display:block;" onerror="this.style.display='none'" />
              </div>
              <p style="margin:0 0 2px;font-family:${FONT};font-size:16px;font-weight:700;color:${NAVY};">Ebin</p>
              <p style="margin:0 0 12px;font-family:${FONT};font-size:10px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.2em;">Senior Property Manager</p>
              <p style="margin:0 0 4px;"><a href="mailto:prosperapropertiess@gmail.com" style="font-family:${FONT};font-size:13px;font-weight:600;color:${CRIMSON};text-decoration:none;">prosperapropertiess@gmail.com</a></p>
              <p style="margin:0 0 20px;font-family:${FONT};font-size:12px;color:${MUTED};">(519) 697-1227</p>
              <p style="margin:0;font-family:${FONT};font-size:9px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;">© ${year} PROSPERA PROPERTIES MANAGEMENT GROUP</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0;">
    <tr><td style="height:1px;background-color:${BORDER};"></td></tr>
  </table>`;
}

function cta(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0;">
    <tr>
      <td style="background-color:${CRIMSON};border-radius:10px;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;color:${WHITE};text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.5px;font-family:${FONT};">${text} →</a>
      </td>
    </tr>
  </table>`;
}

function noteBox(body: string, label?: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
    <tr>
      <td style="background-color:${BG_SUBTLE};border-left:3px solid ${CRIMSON};border-radius:0 12px 12px 0;padding:16px 20px;">
        ${label ? `<p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">${label}</p>` : ""}
        <p style="margin:0;font-size:14px;line-height:1.7;color:${TEXT};font-family:${FONT};">${body}</p>
      </td>
    </tr>
  </table>`;
}

function signoff(name = "Ebin"): string {
  return `<p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">— ${name} · Prospera Properties · (519) 697-1227</p>`;
}

function heroCard(greeting: string, subtitle: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;">
    <tr>
      <td style="background:${BG_HERO};border-radius:20px;padding:40px;text-align:center;">
        <div style="display:inline-block;padding:4px 14px;background:${NAVY};color:${WHITE};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;border-radius:99px;margin-bottom:20px;font-family:${FONT};">Prospera Properties</div>
        <p style="margin:0 0 12px;font-family:${FONT};font-size:28px;font-weight:700;color:${NAVY};line-height:1.2;">${greeting}</p>
        <p style="margin:0;font-family:${FONT};font-size:14px;color:${MUTED};line-height:1.7;">${subtitle}</p>
      </td>
    </tr>
  </table>`;
}

// ── LANDLORD WELCOME ─────────────────────────────────────────

export function landlordWelcomeEmail(name: string): string {
  const PDF_URL = `${BASE_URL}/lease-addendum.pdf`;

  return wrapper(`
    ${heroCard(`Hey ${name || "there"},`, "Your Lease Protection Addendum is ready.")}

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">Here's your free Lease Protection Addendum — it fills in the gaps Ontario's standard lease leaves open so you're covered before something goes wrong.</p>

    ${cta("Download the Addendum (PDF)", PDF_URL)}

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">I'm Ebin. I run Prospera Properties — full property management across London, St. Thomas, and Strathroy. Tenant screening, rent collection, maintenance — the whole thing.</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">If you ever want someone to take it off your plate, that's what we do.</p>

    ${cta("See How It Works", `${BASE_URL}/landlords`)}

    ${divider()}

    ${signoff()}
  `);
}

// ── TENANT WELCOME ───────────────────────────────────────────

export function tenantWelcomeEmail(name: string, city?: string): string {
  return wrapper(`
    ${heroCard(`Hey ${name || "there"},`, "You're on the list.")}

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">You're on the list — we'll reach out as soon as something opens up${city ? ` in ${city}` : ""}.</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">We're a bit different from most landlords: maintenance actually gets fixed, phones actually get answered, and our places are properly looked after before you move in.</p>

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:${TEXT};font-family:${FONT};">While you wait</p>
    <p style="margin:0 0 20px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">Check our listings page — we add new properties regularly.</p>

    ${cta("Browse Available Rentals", `${BASE_URL}/listings`)}

    ${divider()}

    ${noteBox("Rent can only be raised once a year with 90 days written notice. Your landlord needs 24 hours notice to enter (except emergencies). You can't be evicted without a proper LTB hearing.", "Know your rights as an Ontario tenant")}

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT};">Questions? Just reply — a real person will get back to you.</p>

    ${signoff()}
  `);
}

// ── CONTACT CONFIRMATION ─────────────────────────────────────

export function contactConfirmationEmail(name: string, type?: string): string {
  const isLandlord = type === "landlord";
  const isTenant = type === "tenant";

  return wrapper(`
    ${heroCard(`Hey ${name || "there"},`, "We got your message.")}

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">Got your message — I'll personally be in touch within one business day.</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">If it's urgent, call me directly at <a href="tel:+15196971227" style="color:${CRIMSON};text-decoration:none;font-weight:600;">(519) 697-1227</a>.</p>

    ${divider()}

    ${isLandlord
      ? `<p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT};">While you wait, here are our free landlord resources — lease templates, screening checklists, eviction guides.</p>
         ${cta("Browse Free Resources", `${BASE_URL}/resources`)}`
      : isTenant
      ? `<p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT};">Check out what's currently available while you wait — we add new properties regularly.</p>
         ${cta("View Available Rentals", `${BASE_URL}/listings`)}`
      : `<p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT};">Find out how Prospera Properties works for landlords and tenants in Southwest Ontario.</p>
         ${cta("About Prospera Properties", `${BASE_URL}/about`)}`
    }

    ${divider()}

    ${signoff()}
  `);
}

// ── RENT ANALYSIS — LINK EMAIL ───────────────────────────────

export function rentAnalysisLinkEmail({
  name,
  token,
  city,
  bedrooms,
}: {
  name?: string | null;
  token: string;
  city?: string | null;
  bedrooms?: number | null;
}): string {
  const link = `${BASE_URL}/rent-analysis/${token}`;
  const bedsLabel = bedrooms ? `${bedrooms}-bedroom ` : "";
  const cityLabel = city ? ` in ${city}` : "";

  return wrapper(`
    ${heroCard(`Hey ${name || "there"},`, "Your rent analysis link is ready.")}

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">Your rent analysis link is ready. Click below, fill in your ${bedsLabel}property details${cityLabel}, and we'll send back a full written report — usually within minutes.</p>

    ${cta("Start My Rent Analysis", link)}

    ${noteBox("This link is just for you and expires in 7 days. The form takes about 2 minutes.", "Quick note")}

    ${divider()}

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">The analysis looks at what similar units are renting for right now, what features add or take away value, and gives you one clear number to work with — not a vague range.</p>

    ${signoff()}
  `);
}

// ── RENT ANALYSIS — REPORT EMAIL ────────────────────────────

export function rentAnalysisReportEmail({
  name,
  city,
  bedrooms,
  unitType,
  rentAmount,
  claudeAnalysis,
  marketData,
}: {
  name?: string | null;
  city: string;
  bedrooms?: number | null;
  unitType?: string | null;
  rentAmount: number;
  claudeAnalysis: string;
  marketData?: { p25_rent: number | null; median_rent: number | null; p75_rent: number | null; submission_count: number } | null;
}): string {
  const bedsLabel = bedrooms ? `${bedrooms}-bedroom` : "rental";
  const typeLabel = unitType ? unitType.replace(/_/g, " ") : "unit";
  const yearlyRent = rentAmount * 12;

  // ── Market snapshot block ──
  const marketBlock = marketData?.median_rent ? (() => {
    const p25 = marketData.p25_rent ? `$${Math.round(marketData.p25_rent).toLocaleString()}` : "—";
    const median = `$${Math.round(marketData.median_rent).toLocaleString()}`;
    const p75 = marketData.p75_rent ? `$${Math.round(marketData.p75_rent).toLocaleString()}` : "—";
    const count = marketData.submission_count;

    let positionText = "";
    let positionColor = MUTED;
    if (marketData.p25_rent && rentAmount < marketData.p25_rent) {
      positionText = "Your rent is below what most similar units charge — there may be room to increase it.";
      positionColor = "#0D6E5A";
    } else if (marketData.p75_rent && rentAmount > marketData.p75_rent) {
      positionText = "Your rent is on the higher end — make sure your unit's features justify the price.";
      positionColor = CRIMSON;
    } else if (marketData.median_rent && rentAmount < marketData.median_rent) {
      positionText = "You're slightly below the middle of the market — a modest increase could be well-supported.";
      positionColor = "#0D6E5A";
    } else {
      positionText = "You're right in the middle of the market — well positioned for the current conditions.";
      positionColor = "#0D6E5A";
    }

    return `
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">What similar units rent for in ${city}</p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 8px;background-color:${NAVY};border-radius:8px;overflow:hidden;">
        <tr>
          <td class="market-col" align="center" style="padding:20px 16px;border-right:1px solid rgba(255,255,255,0.1);width:33.3%;">
            <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;font-family:${FONT};">Budget end</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:${WHITE};font-family:${FONT};">${p25}</p>
          </td>
          <td class="market-col" align="center" style="padding:20px 16px;border-right:1px solid rgba(255,255,255,0.1);width:33.3%;">
            <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;font-family:${FONT};">Most rentals</p>
            <p style="margin:0;font-size:28px;font-weight:700;color:${WHITE};font-family:${FONT};">${median}</p>
          </td>
          <td class="market-col" align="center" style="padding:20px 16px;width:33.3%;">
            <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;font-family:${FONT};">Premium end</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:${WHITE};font-family:${FONT};">${p75}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 28px;font-size:13px;color:${MUTED};font-family:${FONT};">Based on ${count} real ${bedsLabel} rentals tracked in ${city}.</p>
      <p style="margin:0 0 28px;font-size:14px;color:${positionColor};font-family:${FONT};font-weight:600;">${positionText}</p>
    `;
  })() : "";

  // ── Formatted analysis ──
  const analysisHtml = md(claudeAnalysis);

  return wrapper(`
    ${heroCard(`Hey ${name || "there"},`, `Your ${bedsLabel} ${typeLabel} rent analysis for ${city}`)}

    <!-- Property at a glance -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;background-color:${BG_CARD};border:1px solid ${BORDER};border-radius:20px;overflow:hidden;">
      <tr>
        <td style="padding:24px 28px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">Your property</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:${NAVY};font-family:${FONT};">${bedsLabel} ${typeLabel} · ${city}</p>
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-right:24px;">
                <p style="margin:0;font-size:22px;font-weight:700;color:${NAVY};font-family:${FONT};">$${rentAmount.toLocaleString()}<span style="font-size:14px;font-weight:400;color:${MUTED};">/month</span></p>
              </td>
              <td>
                <p style="margin:0;font-size:15px;color:${MUTED};font-family:${FONT};">$${yearlyRent.toLocaleString()}/year</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Market data -->
    ${marketBlock}

    ${divider()}

    <!-- Analysis -->
    <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">Full Analysis</p>
    ${analysisHtml}

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">You're now on our monthly market update list — one short email a month showing how rents are moving in ${city}. Reply "unsubscribe" anytime.</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">Want someone to handle the whole thing — tenant screening, rent collection, maintenance? That's what we do.</p>

    ${cta("See How Prospera Works", `${BASE_URL}/landlords`)}

    ${divider()}

    ${signoff()}
  `);
}

// ── MONTHLY RENT TRENDS ──────────────────────────────────────

export function monthlyRentTrendsEmail({
  name,
  city,
  data,
  month,
}: {
  name?: string | null;
  city: string;
  data: Array<{
    bedrooms: number;
    median_rent: number | null;
    trend_direction: string | null;
    market_narrative: string | null;
  }>;
  month: string;
}): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");

  const trendLabel = (t: string | null) => {
    if (t === "up")   return `<span style="color:#0D6E5A;font-weight:600;">↑ Rising</span>`;
    if (t === "down") return `<span style="color:${CRIMSON};font-weight:600;">↓ Falling</span>`;
    if (t === "flat") return `<span style="color:${MUTED};">→ Stable</span>`;
    return `<span style="color:${MUTED};">—</span>`;
  };

  const rowsHtml = data.map((row) => `
    <tr style="background-color:${WHITE};">
      <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};font-size:15px;color:${TEXT};font-family:${FONT};font-weight:500;">${row.bedrooms} bed</td>
      <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};font-size:17px;color:${NAVY};font-family:${FONT};font-weight:700;text-align:right;">${row.median_rent ? `$${Math.round(row.median_rent).toLocaleString()}` : "—"}</td>
      <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};font-size:14px;text-align:right;font-family:${FONT};">${trendLabel(row.trend_direction)}</td>
    </tr>
    ${row.market_narrative ? `<tr><td colspan="3" style="padding:4px 16px 14px;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};line-height:1.6;font-family:${FONT};">${row.market_narrative}</td></tr>` : ""}
  `).join("");

  return wrapper(`
    ${heroCard(`${city} Market — ${month}`, "Here's how rents are moving this month.")}

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">Hey ${name || "there"}, here's how rents are moving in ${city} this month.</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background-color:${NAVY};">
          <th style="padding:12px 16px;text-align:left;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;font-family:${FONT};">Unit size</th>
          <th style="padding:12px 16px;text-align:right;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;font-family:${FONT};">Most units rent for</th>
          <th style="padding:12px 16px;text-align:right;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;font-family:${FONT};">Trend</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    ${cta("See Full Market Data", `${BASE_URL}/areas/${citySlug}`)}

    ${divider()}

    <p style="margin:0 0 8px;font-size:13px;color:${MUTED};font-family:${FONT};">Data from landlord-reported rents and Prospera's market tracking across ${city}.</p>
    <p style="margin:0;font-size:13px;color:${MUTED};font-family:${FONT};">To stop receiving these, reply with "unsubscribe".</p>
  `);
}

// ── INTERNAL — RENT SUBMISSION NOTIFICATION ──────────────────

export function rentSubmissionNotificationEmail({
  submissionId,
  landlordName,
  landlordEmail,
  landlordPhone,
  submission,
  claudeAnalysis,
}: {
  submissionId: string;
  landlordName: string | null;
  landlordEmail: string;
  landlordPhone: string | null;
  submission: Record<string, unknown>;
  claudeAnalysis: string;
}): string {
  const s = submission;

  function row(label: string, value: unknown): string {
    if (value === null || value === undefined || value === "" || value === "not specified") return "";
    return `<tr>
      <td style="padding:6px 16px 6px 0;font-size:13px;color:${MUTED};white-space:nowrap;vertical-align:top;font-family:${FONT};">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:${TEXT};font-weight:600;font-family:${FONT};">${String(value)}</td>
    </tr>`;
  }

  function section(title: string, rows: string): string {
    const content = rows.replace(/\n/g, "").trim();
    if (!content) return "";
    return `
      <p style="margin:24px 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">${title}</p>
      <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin-bottom:4px;">${content}</table>
    `;
  }

  const appliances = [
    s.appliance_fridge && "Fridge",
    s.appliance_stove && "Stove",
    s.appliance_dishwasher && "Dishwasher",
    s.appliance_washer && "Washer",
    s.appliance_dryer && "Dryer",
  ].filter(Boolean).join(", ") || "None";

  return wrapper(`
    <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:${NAVY};font-family:${FONT};">New Rent Analysis</p>
    <p style="margin:0 0 28px;font-size:13px;color:${MUTED};font-family:${FONT};">ID: ${submissionId}</p>

    ${section("Landlord", `
      ${row("Name", landlordName || "Not given")}
      ${row("Email", landlordEmail)}
      ${row("Phone", landlordPhone || "Not given")}
    `)}

    ${section("Property", `
      ${row("City", `${s.city}${s.city_zone ? ` — ${String(s.city_zone).replace(/_/g, " ")}` : ""}`)}
      ${row("Address", s.address)}
      ${row("Type", s.property_type ? String(s.property_type).replace(/_/g, " ") : null)}
      ${row("Bedrooms", s.bedrooms)}
      ${row("Bathrooms", `${s.bathrooms ?? "?"}bd + ${s.half_bathrooms ?? 0} half`)}
      ${row("Sqft", s.sqft ? `${s.sqft} sqft` : null)}
      ${row("Floor", s.floor)}
      ${row("Era", s.building_era ? String(s.building_era).replace(/_/g, " ") : null)}
      ${row("Units in building", s.units_in_building)}
      ${row("Separate entrance", s.separate_entrance === true ? "Yes" : s.separate_entrance === false ? "No" : null)}
    `)}

    ${section("Parking & Outdoor", `
      ${row("Garage", s.garage !== "none" ? String(s.garage).replace(/_/g, " ") : "None")}
      ${row("Parking spots", s.parking_spots)}
      ${row("Visitor parking", s.visitor_parking === true ? "Yes" : s.visitor_parking === false ? "No" : null)}
      ${row("Backyard", s.backyard === true ? "Yes" : s.backyard === false ? "No" : null)}
      ${row("Balcony", s.balcony === true ? "Yes" : s.balcony === false ? "No" : null)}
      ${row("Lawn care", s.lawn_care ? String(s.lawn_care).replace(/_/g, " ") : null)}
    `)}

    ${section("Interior", `
      ${row("Furnished", s.furnished ? String(s.furnished).replace(/_/g, " ") : null)}
      ${row("Heat", s.heat_type ? String(s.heat_type).replace(/_/g, " ") : null)}
      ${row("AC", s.ac_type ? String(s.ac_type).replace(/_/g, " ") : null)}
      ${row("Appliances", appliances)}
      ${row("Laundry", s.laundry ? String(s.laundry).replace(/_/g, " ") : null)}
      ${row("Utilities included", s.utilities_included ? String(s.utilities_included).replace(/_/g, " ") : null)}
      ${row("Pets", s.pet_friendly === true ? "Yes" : s.pet_friendly === false ? "No" : null)}
      ${row("Amenities", s.amenities)}
      ${row("Condo fees incl.", s.condo_fees_included === true ? "Yes" : s.condo_fees_included === false ? "No" : null)}
    `)}

    ${section("Condition", `
      ${row("Newly renovated", s.newly_renovated === true ? "Yes" : s.newly_renovated === false ? "No" : null)}
      ${row("Upkeep rating", s.upkeep_rating ? `${s.upkeep_rating}/10` : null)}
      ${row("Transit", s.transit_distance_min ? `${s.transit_distance_min} min walk to bus` : null)}
    `)}

    ${section("Rent", `
      ${row("Rent", `$${Number(s.rent_amount).toLocaleString()}/mo · ${s.is_asking_rent ? "asking rent" : "current tenant"}`)}
      ${row("Previous rent", s.previous_rent ? `$${Number(s.previous_rent).toLocaleString()}/mo` : null)}
      ${row("Occupied", s.is_occupied === true ? "Yes" : s.is_occupied === false ? "No" : null)}
      ${row("Last increase", s.last_rent_increase)}
      ${row("Neighbouring rent", s.neighbouring_rent ? `$${Number(s.neighbouring_rent).toLocaleString()}/mo` : null)}
      ${row("Lease preference", s.lease_preference ? String(s.lease_preference).replace(/_/g, " ") : null)}
      ${row("Available", s.available_date)}
    `)}

    ${section("Context", `
      ${row("Landlord style", s.landlord_style ? String(s.landlord_style).replace(/_/g, " ") : null)}
      ${row("Special features", s.special_features)}
      ${row("Remarks", s.remarks)}
    `)}

    ${divider()}

    <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">Analysis Sent to Landlord</p>
    <p style="margin:0;font-size:14px;line-height:1.8;color:${TEXT};font-family:${FONT};white-space:pre-line;">${claudeAnalysis}</p>
  `);
}

// ── INTERNAL — SCRAPE INGEST NOTIFICATION ────────────────────

export function scrapeIngestNotificationEmail({
  inserted,
  skipped,
  cities,
  source,
  scrapedAt,
}: {
  inserted: number;
  skipped: number;
  cities: Record<string, number>;
  source: string;
  scrapedAt: string;
}): string {
  const cityRows = Object.entries(cities).map(([city, count]) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT};font-family:${FONT};">${city}</td>
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-size:14px;color:${NAVY};font-weight:700;text-align:right;font-family:${FONT};">${count} listings</td>
    </tr>
  `).join("");

  return wrapper(`
    <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:${NAVY};font-family:${FONT};">Scrape Complete</p>
    <p style="margin:0 0 28px;font-size:13px;color:${MUTED};font-family:${FONT};">${new Date(scrapedAt).toLocaleString("en-CA", { dateStyle: "full", timeStyle: "short" })} · ${source}</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;background-color:${BG_SUBTLE};border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:24px;border-right:1px solid ${BORDER};text-align:center;width:50%;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">Inserted</p>
          <p style="margin:0;font-size:36px;font-weight:700;color:${NAVY};font-family:${FONT};">${inserted}</p>
        </td>
        <td style="padding:24px;text-align:center;width:50%;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">Skipped</p>
          <p style="margin:0;font-size:36px;font-weight:700;color:${MUTED};font-family:${FONT};">${skipped}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">By City</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
      <tbody>${cityRows}</tbody>
    </table>
  `);
}

// ── RESOURCE DOWNLOAD EMAILS ─────────────────────────────────

interface ResourceGuide {
  subject: string;
  headline: string;
  intro: string;
  steps: string[];
  tip: { title: string; body: string };
  cta: { text: string; url: string };
}

const resourceGuides: Record<string, ResourceGuide> = {
  "ontario-standard-lease": {
    subject: "Your Ontario Standard Lease — plus how to fill it out correctly",
    headline: "The Standard Lease. It's simpler than it looks.",
    intro: "Ontario's standard lease form is mandatory for most residential rentals — so both sides know exactly what they're getting into. Here's how to fill it out right.",
    steps: [
      "<strong>Don't skip Section D (Additional Terms).</strong> This is where you add things like pet rules, parking details, utility responsibilities. Vague here = arguments later.",
      "<strong>Both parties sign every page.</strong> Sounds obvious. People skip this. Don't.",
      "<strong>Tenant gets a copy within 21 days.</strong> Ontario law requires it. Keep a signed copy somewhere you can actually find it.",
      "<strong>The lease can't override the RTA.</strong> Doesn't matter what you write — if it contradicts Ontario's Residential Tenancies Act, the Act wins.",
      "<strong>Month-to-month after the term ends is normal.</strong> When a 12-month lease expires, it automatically becomes month-to-month. That's not a problem — it's how it works.",
    ],
    tip: { title: "Heads up", body: "Using a lease that's NOT the Ontario standard form (for tenancies that started after April 30, 2018) gives the tenant the right to withhold one month's rent until you provide the correct form. Use the right form." },
    cta: { text: "Get a free lease review", url: `${BASE_URL}/contact` },
  },
  "lease-addendum": {
    subject: "Your 17-Point Lease Addendum — attached and ready to use",
    headline: "Attach this before your next tenant signs.",
    intro: "The standard Ontario lease was written to be fair to both sides — which means it leaves gaps that experienced tenants know how to use. This addendum closes them. Here's how to use it properly.",
    steps: [
      "<strong>Attach it to the standard lease on signing day.</strong> Both you and the tenant sign both documents at the same time. Never follow up later — an unsigned addendum is just a piece of paper.",
      "<strong>Walk through it with the tenant before they sign.</strong> Don't just hand it over. Reading it together sets expectations and removes 'I didn't know' as a defence.",
      "<strong>Keep a signed copy — physical and digital.</strong> Scan it on signing day. If it ever goes to the LTB, you need your copy immediately.",
      "<strong>Use it on every tenancy — even short-term.</strong> The addendum applies to all residential tenancies in Ontario regardless of length.",
      "<strong>Don't modify clauses without legal advice.</strong> Each clause was written to hold up under Ontario's RTA. Changes could weaken enforceability.",
    ],
    tip: { title: "Important", body: "Both parties must sign the addendum for it to be enforceable. Make it part of the same signing session as the standard lease — not a separate step." },
    cta: { text: "Questions about your lease or a tenant situation?", url: `${BASE_URL}/contact` },
  },
  "tenant-screening-checklist": {
    subject: "Your Tenant Screening Checklist — how to use it",
    headline: "One bad tenant costs more than a year of management fees.",
    intro: "We've placed 25+ tenants. All paying rent. No LTB cases. This checklist is the exact process we use.",
    steps: [
      "<strong>Pre-screen on the phone first.</strong> Before you show the unit, have a 5-minute call. Ask about move-in date, occupants, pets, why they're moving. You'll filter 30% of bad fits right there.",
      "<strong>Income should be 3x the rent.</strong> $2,000/month rent = $6,000/month gross income needed. Verify with pay stubs or an employment letter.",
      "<strong>Always pull credit.</strong> A 580 score with a reasonable explanation is very different from a 580 with collections. Don't skip this.",
      "<strong>Call previous landlords — not just the most recent one.</strong> The current landlord might give a glowing reference just to get rid of a problem tenant.",
      "<strong>Document your decision.</strong> If you're declining someone, have a documented reason based on financials, references, and credit.",
    ],
    tip: { title: "Important", body: "You cannot decline a tenant based on age, race, family status, source of income, or any other protected ground under the Ontario Human Rights Code. Decline based on financials, references, and credit — always." },
    cta: { text: "Want us to handle screening for you?", url: `${BASE_URL}/landlords` },
  },
  "rent-increase-n1": {
    subject: "Your N1 Guide — how to raise rent without making it a whole thing",
    headline: "Rent increases in Ontario: simple when you follow the rules.",
    intro: "Ontario has strict rules around rent increases — but they're easy to follow once you know them.",
    steps: [
      "<strong>90 days written notice. No exceptions.</strong> Give the tenant the N1 form at least 90 days before the increase takes effect. Keep proof.",
      "<strong>Once per year only.</strong> You can only raise rent once every 12 months.",
      "<strong>Check the guideline first.</strong> Ontario sets an annual rent increase guideline. You can raise up to that percentage without LTB approval.",
      "<strong>Fill in the form completely.</strong> Current rent, new rent, effective date. Incomplete N1 forms can be challenged.",
      "<strong>New tenants are exempt.</strong> The guideline only applies to sitting tenants. When a unit turns over, you can set any rent you want.",
    ],
    tip: { title: "2026 guideline", body: "Ontario's 2026 rent increase guideline is 2.5%. Anything at or below that — with proper 90-day notice — is straightforward. Above that requires an Above-Guideline Increase (AGI) application to the LTB." },
    cta: { text: "Questions about your specific situation?", url: `${BASE_URL}/contact` },
  },
  "eviction-notices": {
    subject: "Your Eviction Notice Templates — N4, N5, N12 explained plainly",
    headline: "Evictions are stressful. Using the wrong form makes them worse.",
    intro: "The three forms in your download cover the most common eviction scenarios in Ontario. Here's when to use each one.",
    steps: [
      "<strong>N4 — Non-payment of rent.</strong> Serve it the day after rent was due. Tenant has 14 days to pay or move out. If they pay, the N4 is void.",
      "<strong>N5 — Interference, damage, or overcrowding.</strong> For noise, damage, illegal activity, or too many people. First N5 gives 20 days to fix it. Second N5 within 6 months — no second chance.",
      "<strong>N12 — Landlord or family moving in.</strong> Tenant gets 60 days notice and one month's rent as compensation. Heavily scrutinized at the LTB — make sure this is genuine.",
      "<strong>Serve it properly.</strong> Hand-deliver, registered mail, or through a tenant portal. Keep proof.",
      "<strong>File with the LTB if the issue isn't resolved.</strong> Don't skip to changing locks — that's illegal in Ontario.",
    ],
    tip: { title: "Heads up", body: "Changing locks, removing belongings, or shutting off utilities to force a tenant out is illegal in Ontario — regardless of how behind they are on rent. Always go through the LTB process." },
    cta: { text: "Need help with an LTB filing?", url: `${BASE_URL}/contact` },
  },
  "property-inspection-checklist": {
    subject: "Your Inspection Checklist — how to use it properly",
    headline: "No inspection = no proof. It's that simple.",
    intro: "The inspection checklist protects you when a tenant moves out and things aren't right.",
    steps: [
      "<strong>Do the move-in inspection together.</strong> Walk through with the tenant on day one. Both sign. This is your baseline.",
      "<strong>Take photos. Date-stamped.</strong> The form is good. Photos are better. Photos with timestamps are undeniable.",
      "<strong>Note existing damage in writing.</strong> Scuff on the wall? Write it down. If it's not on the form, you can't claim it later.",
      "<strong>Repeat at move-out — same process.</strong> Any damage beyond normal wear and tear can be claimed.",
      "<strong>Normal wear and tear is not claimable.</strong> Small scuffs, minor carpet wear, small nail holes — normal. Large holes, broken fixtures, deep stains — damage.",
    ],
    tip: { title: "Ontario rule", body: "You cannot collect a security deposit in Ontario. You can only collect first and last month's rent. The 'last month's rent' cannot be used for damages — only for the final month of tenancy." },
    cta: { text: "Learn more about property management", url: `${BASE_URL}/landlords` },
  },
  "landlord-tax-guide": {
    subject: "Your Ontario Landlord Tax Guide — what you can actually write off",
    headline: "You're probably leaving money on the table.",
    intro: "A lot of landlords don't claim everything they're entitled to. Here's what's deductible and what isn't.",
    steps: [
      "<strong>Mortgage interest — yes. Principal — no.</strong> Only the interest portion is deductible. The principal paydown is equity, not an expense.",
      "<strong>Property management fees — 100% deductible.</strong> What you pay Prospera comes right off your rental income. Keep the invoices.",
      "<strong>Repairs vs. improvements.</strong> Fixing a broken furnace = deductible this year. Replacing it with a better one = depreciated over time.",
      "<strong>Home office — if you manage yourself.</strong> A portion of home office expenses may be deductible. Talk to an accountant.",
      "<strong>Keep every receipt.</strong> CRA can audit going back 6 years.",
    ],
    tip: { title: "Talk to an accountant", body: "This guide is a starting point — not tax advice. An accountant who works with rental property owners can find deductions specific to your situation. The cost of the accountant is also deductible." },
    cta: { text: "Questions about managing your rental?", url: `${BASE_URL}/contact` },
  },
  "maintenance-request-form": {
    subject: "Your Maintenance Request Form — how to set it up properly",
    headline: "No paper trail = no accountability. This form fixes that.",
    intro: "The maintenance request form protects you legally and stops tenants from calling at midnight for non-emergencies.",
    steps: [
      "<strong>Give it to tenants on move-in day.</strong> Set the expectation early — non-emergency maintenance goes through the form.",
      "<strong>Define 'emergency' in writing.</strong> No heat in winter, flooding, gas smell = emergency call. Everything else — form first.",
      "<strong>Set a response time and stick to it.</strong> 24 hours to acknowledge, 72 hours for non-urgent issues. Consistency builds trust.",
      "<strong>Keep copies of every request and response.</strong> Your records tell a different story from 'they ignored me.'",
      "<strong>Note the date each issue is resolved.</strong> Closes the loop on every request and shows responsiveness.",
    ],
    tip: { title: "Your obligation under Ontario law", body: "Ontario landlords are legally required to maintain rental units in good repair. Ignoring maintenance can result in rent abatement orders from the LTB." },
    cta: { text: "Let us handle maintenance coordination", url: `${BASE_URL}/landlords` },
  },
  "rental-application": {
    subject: "Your Rental Application Template — how to use it",
    headline: "The application is your first look at who's applying. Make it count.",
    intro: "A good rental application collects everything you need to make a confident decision — without crossing lines under Ontario's Human Rights Code.",
    steps: [
      "<strong>Send it before showing the unit if possible.</strong> If the income doesn't work on paper, no need to schedule a showing.",
      "<strong>Income verification is mandatory.</strong> Pay stubs, employment letter, or NOA for self-employed applicants.",
      "<strong>Reference checks — actually call them.</strong> Ask previous landlords: Did they pay on time? Would you rent to them again?",
      "<strong>Credit check consent is included in the form.</strong> Keep the signed consent. You need it to legally pull credit in Canada.",
      "<strong>Keep applications for declined candidates.</strong> If someone claims discrimination, your documented process is your defence.",
    ],
    tip: { title: "What you cannot ask", body: "You cannot ask about age, marital status, family status, religion, race, disability, or source of income (Ontario Works, ODSP, etc. are protected). Stick to financials, rental history, and references." },
    cta: { text: "Want us to handle tenant placement?", url: `${BASE_URL}/landlords` },
  },
  "landlord-rights-guide": {
    subject: "Your Ontario Landlord Rights Guide — the stuff that actually matters",
    headline: "You have more rights than most landlords realize.",
    intro: "Ontario's RTA gets a reputation for being tenant-friendly — and it is. But landlords have real, enforceable rights too.",
    steps: [
      "<strong>Entry with 24 hours written notice.</strong> You can enter to show it, inspect it, or make repairs — with proper notice.",
      "<strong>Rent must be paid on time.</strong> The day it's late, you can serve an N4. You don't have to wait or ask nicely first.",
      "<strong>Tenants can't withhold rent because something's broken.</strong> Their remedy is to apply to the LTB — not to stop paying.",
      "<strong>You can raise rent once a year.</strong> With proper notice and within the guideline.",
      "<strong>You can evict for legitimate reasons.</strong> Non-payment, damage, illegal activity, personal use — all valid grounds.",
    ],
    tip: { title: "Document everything", body: "Every notice served, every maintenance request, every lease signed — keep copies. The LTB makes decisions based on evidence. Landlords who document well almost always come out ahead." },
    cta: { text: "Talk to us about your property", url: `${BASE_URL}/contact` },
  },
};

export function resourceDownloadEmail(
  name: string,
  resourceId: string,
  resourceTitle: string,
  fileUrl: string | null
): { subject: string; html: string } {
  const guide = resourceGuides[resourceId];

  if (!guide) {
    const html = wrapper(`
      ${heroCard(`Your download is ready, ${name || "there"}.`, resourceTitle)}
      <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">Here's your download: <strong>${resourceTitle}</strong></p>
      ${fileUrl ? cta("Download Now", fileUrl) : ""}
      ${divider()}
      <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT};">Questions? Just reply to this email.</p>
      ${signoff()}
    `);
    return { subject: `Your download: ${resourceTitle}`, html };
  }

  const stepsHtml = guide.steps.map((step, i) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
        <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
          <tr>
            <td width="28" valign="top" style="font-size:13px;font-weight:700;color:${CRIMSON};padding-top:2px;font-family:${FONT};">${i + 1}.</td>
            <td style="font-size:15px;color:${TEXT};line-height:1.7;font-family:${FONT};">${step}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  const html = wrapper(`
    ${heroCard(`Your download is ready, ${name || "there"}.`, guide.headline)}

    <p style="margin:16px 0 24px;font-size:15px;color:${MUTED};font-family:${FONT};line-height:1.8;">${guide.intro}</p>

    ${fileUrl ? cta("Download: " + resourceTitle, fileUrl) : ""}

    ${divider()}

    <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">How to use this</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
      ${stepsHtml}
    </table>

    ${noteBox(guide.tip.body, guide.tip.title)}

    ${divider()}

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.8;">Got a question about your specific situation? We're happy to help — just reply to this email.</p>

    ${cta(guide.cta.text, guide.cta.url)}

    ${divider()}

    ${signoff()}
  `);

  return { subject: guide.subject, html };
}

// ─────────────────────────────────────────────────────────────
// APPLICATION SYSTEM EMAILS
// ─────────────────────────────────────────────────────────────

// New property notification → sent to all active agents
export function newPropertyAgentEmail({
  agentName,
  propertyAddress,
  propertyCity,
  bedrooms,
  bathrooms,
  price,
  propertyId,
  agentId,
}: {
  agentName: string | null;
  propertyAddress: string;
  propertyCity: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  propertyId: string;
  agentId: string;
}): string {
  const applyLink = `${BASE_URL}/apply/${agentId}/${propertyId}`;
  const dashboardLink = `${BASE_URL}/agents/dashboard`;

  return wrapper(`
    ${heroCard(`New listing — ${propertyAddress}`, `${propertyCity} · ${bedrooms} bed · $${price.toLocaleString()}/mo`)}

    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};font-family:${FONT};">Hey ${agentName || "there"} — a new property is available. Get your application link and start marketing it.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_CARD};border:1px solid ${BORDER};border-radius:20px;margin:0 0 24px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 4px;font-size:13px;color:${MUTED};font-family:${FONT};text-transform:uppercase;letter-spacing:0.08em;">Property</p>
        <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:${TEXT};font-family:${FONT};">${propertyAddress}, ${propertyCity}</p>
        <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT};">
          <strong>$${price.toLocaleString()}/mo</strong> &nbsp;·&nbsp; ${bedrooms} bed &nbsp;·&nbsp; ${bathrooms} bath
        </p>
      </td></tr>
    </table>

    ${cta("Open Agent Dashboard", dashboardLink)}

    <p style="margin:24px 0 0;font-size:13px;color:${MUTED};font-family:${FONT};text-align:center;">Your unique application link: <a href="${applyLink}" style="color:${CRIMSON};">${applyLink}</a></p>

    ${divider()}
    ${signoff()}
  `);
}

// Application received → sent to agent when tenant submits
export function applicationReceivedAgentEmail({
  agentName,
  tenantName,
  tenantEmail,
  tenantPhone,
  propertyAddress,
  applicationId,
}: {
  agentName: string | null;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  propertyAddress: string;
  applicationId: string;
}): string {
  return wrapper(`
    ${heroCard("New application received", `${tenantName} applied for ${propertyAddress}`)}

    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};font-family:${FONT};">Hey ${agentName || "there"} — a tenant just submitted an application for one of your properties.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_CARD};border:1px solid ${BORDER};border-radius:20px;margin:0 0 24px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT};"><strong>Applicant:</strong> ${tenantName}</p>
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT};"><strong>Email:</strong> ${tenantEmail}</p>
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT};"><strong>Phone:</strong> ${tenantPhone}</p>
        <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT};"><strong>Property:</strong> ${propertyAddress}</p>
      </td></tr>
    </table>

    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};font-family:${FONT};">Documents are being processed. You'll hear from Ebin once the screening report is ready. Application ID: <code>${applicationId}</code></p>

    ${cta("View Your Dashboard", `${BASE_URL}/agents/dashboard`)}

    ${divider()}
    ${signoff()}
  `);
}

// Application review notification → sent to Ebin when AI report is ready
export function applicationEbinReviewEmail({
  tenantName,
  propertyAddress,
  agentName,
  aiScore,
  applicationId,
}: {
  tenantName: string;
  propertyAddress: string;
  agentName: string;
  aiScore: number;
  applicationId: string;
}): string {
  const scoreColor = aiScore >= 7 ? "#0D6E5A" : aiScore >= 5 ? "#B45309" : "#B91C1C";

  return wrapper(`
    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:${NAVY};font-family:${FONT};">Application ready for review</p>
    <p style="margin:0 0 28px;font-size:15px;color:${MUTED};font-family:${FONT};">A screening report has been generated. Your decision is needed.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_CARD};border:1px solid ${BORDER};border-radius:20px;margin:0 0 24px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT};"><strong>Applicant:</strong> ${tenantName}</p>
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT};"><strong>Property:</strong> ${propertyAddress}</p>
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT};"><strong>Referred by:</strong> ${agentName}</p>
        <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT};"><strong>AI Score:</strong> <span style="color:${scoreColor};font-weight:700;">${aiScore}/10</span></p>
      </td></tr>
    </table>

    ${cta("Review Application", `${BASE_URL}/admin/applications/${applicationId}`)}

    ${divider()}
    ${signoff()}
  `);
}

// Approval → sent to tenant
export function applicationApprovedTenantEmail({
  tenantName,
  propertyAddress,
}: {
  tenantName: string;
  propertyAddress: string;
}): string {
  return wrapper(`
    ${heroCard(`You're approved, ${tenantName}!`, propertyAddress)}

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">We're pleased to let you know that your application for <strong>${propertyAddress}</strong> has been approved.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">Someone from our team will be in touch shortly with next steps — lease signing, move-in details, and first/last month's rent collection.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">If you have any questions in the meantime, just reply to this email.</p>

    ${divider()}
    ${signoff()}
  `);
}

// Rejection → sent to tenant
export function applicationRejectedTenantEmail({
  tenantName,
  propertyAddress,
}: {
  tenantName: string;
  propertyAddress: string;
}): string {
  return wrapper(`
    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:${NAVY};font-family:${FONT};">Application update</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">Hi ${tenantName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">Thank you for applying for <strong>${propertyAddress}</strong>. After reviewing your application, we are not able to move forward at this time.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">We appreciate your interest in Prospera Properties and wish you all the best in your search.</p>

    ${divider()}
    ${signoff()}
  `);
}

// Application status update → sent to agent when Ebin approves or rejects
export function applicationStatusAgentEmail({
  agentName,
  tenantName,
  propertyAddress,
  status,
  applicationId,
}: {
  agentName: string;
  tenantName: string;
  propertyAddress: string;
  status: "approved" | "rejected";
  applicationId: string;
}): string {
  const approved = status === "approved";
  const heading = approved ? "Application approved" : "Application not approved";
  const body = approved
    ? `Good news — <strong>${tenantName}</strong>'s application for <strong>${propertyAddress}</strong> has been approved. The tenant has been notified and next steps are in motion.`
    : `<strong>${tenantName}</strong>'s application for <strong>${propertyAddress}</strong> was not approved at this time. The tenant has been notified.`;

  return wrapper(`
    <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:${NAVY};font-family:${FONT};">${heading}</p>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};font-family:${FONT};">Hi ${agentName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">${body}</p>

    ${cta("View Application", `${BASE_URL}/admin/applications/${applicationId}`)}

    ${divider()}
    ${signoff()}
  `);
}

// Follow-up → agent clicks button, sent to tenant on behalf of Prospera
export function agentFollowUpEmail({
  tenantName,
  propertyAddress,
  agentName,
}: {
  tenantName: string;
  propertyAddress: string;
  agentName: string;
}): string {
  return wrapper(`
    ${heroCard(`Hi ${tenantName},`, "Following up on your application")}

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">Just checking in on your application for <strong>${propertyAddress}</strong>. We've received everything and your file is currently under review.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">You'll hear from us as soon as a decision has been made. If you have any questions in the meantime, feel free to reply to this email.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT};">— ${agentName}, Prospera Properties</p>

    ${divider()}
    ${signoff()}
  `);
}
