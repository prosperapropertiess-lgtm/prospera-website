// ─────────────────────────────────────────────────────────────
// Prospera Properties — Email Templates
// Design: Navy #1F2F3A + White. Crimson #8B2030 for CTAs only.
// Fonts: DM Sans (body), Cormorant Garamond (headings)
// ─────────────────────────────────────────────────────────────

const BASE_URL = "https://www.prosperaproperties.co";

// Font stacks — web fonts load in Apple Mail / iOS / Samsung Mail.
// Outlook falls back to Arial / Georgia gracefully.
const FONT_SANS = "'DM Sans', Arial, Helvetica, sans-serif";
const FONT_SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

// Palette
const NAVY = "#1F2F3A";
const WHITE = "#FFFFFF";
const CRIMSON = "#8B2030";
const TEXT = "#1E2D3D";       // near-black navy for body
const MUTED = "#64748B";      // grey for secondary text
const BORDER = "#E2E8F0";     // light border
const BG_OUTER = "#EEF2F7";   // very light blue-grey wrapper
const BG_SUBTLE = "#F8FAFC";  // subtle section bg

// ── Markdown → email HTML ────────────────────────────────────
// Converts basic markdown from Claude's analysis to email-safe HTML.
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
      .map((l) => `<li style="margin:0 0 8px;font-size:15px;line-height:1.7;color:${TEXT};font-family:${FONT_SANS};">${l}</li>`)
      .join("");
    return `\n<ul style="margin:12px 0 20px;padding-left:22px;">${items}</ul>\n`;
  });

  // 3. Section headings (##)
  out = out.replace(
    /^#{1,3}\s+(.+)$/gm,
    `<p style="margin:28px 0 8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">$1</p>`
  );

  // 4. Paragraph breaks
  const pStyle = `margin:0 0 16px;font-size:15px;line-height:1.8;color:${TEXT};font-family:${FONT_SANS};`;
  out = out
    .split(/\n{2,}/)
    .map((chunk) => {
      chunk = chunk.trim();
      if (!chunk) return "";
      // Don't wrap things already wrapped in block tags
      if (chunk.startsWith("<ul") || chunk.startsWith("<p style=\"margin:28")) return chunk;
      return `<p style="${pStyle}">${chunk.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return out;
}

// ── Shared components ────────────────────────────────────────

function wrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Prospera Properties</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&display=swap" rel="stylesheet" />
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
<body style="margin:0;padding:0;background-color:${BG_OUTER};font-family:${FONT_SANS};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td class="outer-pad" align="center" style="padding:32px 16px;">
        <table cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:${WHITE};border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td class="header-pad" style="background-color:${NAVY};padding:28px 40px;">
              <p style="margin:0;font-size:20px;font-weight:300;color:${WHITE};font-family:${FONT_SERIF};letter-spacing:0.5px;">Prospera Properties</p>
              <p style="margin:5px 0 0;font-size:12px;color:rgba(255,255,255,0.45);font-family:${FONT_SANS};letter-spacing:1px;">London · St. Thomas · Strathroy</p>
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
            <td class="footer-pad" style="background-color:${NAVY};padding:24px 40px;">
              <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.5);font-family:${FONT_SANS};">Prospera Properties &nbsp;·&nbsp; <a href="tel:+15196971227" style="color:rgba(255,255,255,0.5);text-decoration:none;">(519) 697-1227</a> &nbsp;·&nbsp; <a href="mailto:hello@prosperaproperties.co" style="color:rgba(255,255,255,0.5);text-decoration:none;">hello@prosperaproperties.co</a></p>
              <p style="margin:0;font-size:12px;font-family:${FONT_SANS};"><a href="${BASE_URL}" style="color:rgba(255,255,255,0.3);text-decoration:none;">prosperaproperties.co</a></p>
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
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0;">
    <tr><td style="height:1px;background-color:${BORDER};"></td></tr>
  </table>`;
}

function cta(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0;">
    <tr>
      <td style="background-color:${CRIMSON};border-radius:6px;">
        <a href="${url}" style="display:inline-block;padding:15px 32px;color:${WHITE};text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.5px;font-family:${FONT_SANS};">${text} →</a>
      </td>
    </tr>
  </table>`;
}

function noteBox(body: string, label?: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
    <tr>
      <td style="background-color:${BG_SUBTLE};border-left:3px solid ${NAVY};border-radius:0 6px 6px 0;padding:16px 20px;">
        ${label ? `<p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">${label}</p>` : ""}
        <p style="margin:0;font-size:14px;line-height:1.7;color:${TEXT};font-family:${FONT_SANS};">${body}</p>
      </td>
    </tr>
  </table>`;
}

function signoff(name = "Ebin"): string {
  return `<p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">— ${name}<br/><span style="font-size:13px;color:${MUTED};">Prospera Properties · (519) 697-1227</span></p>`;
}

// ── LANDLORD WELCOME ─────────────────────────────────────────

export function landlordWelcomeEmail(name: string): string {
  const PDF_URL = `${BASE_URL}/lease-addendum.pdf`;

  return wrapper(`
    <p style="margin:0 0 24px;font-size:17px;color:${TEXT};font-family:${FONT_SANS};line-height:1.7;">Hey ${name || "there"},</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">Here's your free Lease Protection Addendum — it fills in the gaps Ontario's standard lease leaves open so you're covered before something goes wrong.</p>

    ${cta("Download the Addendum (PDF)", PDF_URL)}

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">I'm Ebin. I run Prospera Properties — full property management across London, St. Thomas, and Strathroy. Tenant screening, rent collection, maintenance — the whole thing.</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">If you ever want someone to take it off your plate, that's what we do.</p>

    ${cta("See How It Works", `${BASE_URL}/landlords`)}

    ${divider()}

    ${signoff()}
  `);
}

// ── TENANT WELCOME ───────────────────────────────────────────

export function tenantWelcomeEmail(name: string, city?: string): string {
  return wrapper(`
    <p style="margin:0 0 24px;font-size:17px;color:${TEXT};font-family:${FONT_SANS};line-height:1.7;">Hey ${name || "there"},</p>

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">You're on the list — we'll reach out as soon as something opens up${city ? ` in ${city}` : ""}.</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">We're a bit different from most landlords: maintenance actually gets fixed, phones actually get answered, and our places are properly looked after before you move in.</p>

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:${TEXT};font-family:${FONT_SANS};">While you wait</p>
    <p style="margin:0 0 20px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">Check our listings page — we add new properties regularly.</p>

    ${cta("Browse Available Rentals", `${BASE_URL}/listings`)}

    ${divider()}

    ${noteBox("Rent can only be raised once a year with 90 days written notice. Your landlord needs 24 hours notice to enter (except emergencies). You can't be evicted without a proper LTB hearing.", "Know your rights as an Ontario tenant")}

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Questions? Just reply — a real person will get back to you.</p>

    ${signoff()}
  `);
}

// ── CONTACT CONFIRMATION ─────────────────────────────────────

export function contactConfirmationEmail(name: string, type?: string): string {
  const isLandlord = type === "landlord";
  const isTenant = type === "tenant";

  return wrapper(`
    <p style="margin:0 0 24px;font-size:17px;color:${TEXT};font-family:${FONT_SANS};line-height:1.7;">Hey ${name || "there"},</p>

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">Got your message — I'll personally be in touch within one business day.</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">If it's urgent, call me directly at <a href="tel:+15196971227" style="color:${CRIMSON};text-decoration:none;font-weight:600;">(519) 697-1227</a>.</p>

    ${divider()}

    ${isLandlord
      ? `<p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">While you wait, here are our free landlord resources — lease templates, screening checklists, eviction guides.</p>
         ${cta("Browse Free Resources", `${BASE_URL}/resources`)}`
      : isTenant
      ? `<p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Check out what's currently available while you wait — we add new properties regularly.</p>
         ${cta("View Available Rentals", `${BASE_URL}/listings`)}`
      : `<p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Find out how Prospera Properties works for landlords and tenants in Southwest Ontario.</p>
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
    <p style="margin:0 0 24px;font-size:17px;color:${TEXT};font-family:${FONT_SANS};line-height:1.7;">Hey ${name || "there"},</p>

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">Your rent analysis link is ready. Click below, fill in your ${bedsLabel}property details${cityLabel}, and we'll send back a full written report — usually within minutes.</p>

    ${cta("Start My Rent Analysis", link)}

    ${noteBox("This link is just for you and expires in 7 days. The form takes about 2 minutes.", "Quick note")}

    ${divider()}

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">The analysis looks at what similar units are renting for right now, what features add or take away value, and gives you one clear number to work with — not a vague range.</p>

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
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">What similar units rent for in ${city}</p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 8px;background-color:${NAVY};border-radius:8px;overflow:hidden;">
        <tr>
          <td class="market-col" align="center" style="padding:20px 16px;border-right:1px solid rgba(255,255,255,0.1);width:33.3%;">
            <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;font-family:${FONT_SANS};">Budget end</p>
            <p style="margin:0;font-size:24px;font-weight:300;color:${WHITE};font-family:${FONT_SERIF};">${p25}</p>
          </td>
          <td class="market-col" align="center" style="padding:20px 16px;border-right:1px solid rgba(255,255,255,0.1);width:33.3%;">
            <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;font-family:${FONT_SANS};">Most rentals</p>
            <p style="margin:0;font-size:28px;font-weight:600;color:${WHITE};font-family:${FONT_SERIF};">${median}</p>
          </td>
          <td class="market-col" align="center" style="padding:20px 16px;width:33.3%;">
            <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;font-family:${FONT_SANS};">Premium end</p>
            <p style="margin:0;font-size:24px;font-weight:300;color:${WHITE};font-family:${FONT_SERIF};">${p75}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 28px;font-size:13px;color:${MUTED};font-family:${FONT_SANS};">Based on ${count} real ${bedsLabel} rentals tracked in ${city}.</p>
      <p style="margin:0 0 28px;font-size:14px;color:${positionColor};font-family:${FONT_SANS};font-weight:600;">${positionText}</p>
    `;
  })() : "";

  // ── Formatted analysis ──
  const analysisHtml = md(claudeAnalysis);

  return wrapper(`
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">Your Rent Analysis</p>
    <p style="margin:0 0 28px;font-size:28px;font-weight:300;color:${NAVY};font-family:${FONT_SERIF};">Hey ${name || "there"},</p>

    <!-- Property at a glance -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;background-color:${BG_SUBTLE};border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">Your property</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:300;color:${NAVY};font-family:${FONT_SERIF};">${bedsLabel} ${typeLabel} · ${city}</p>
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-right:24px;">
                <p style="margin:0;font-size:22px;font-weight:700;color:${NAVY};font-family:${FONT_SANS};">$${rentAmount.toLocaleString()}<span style="font-size:14px;font-weight:400;color:${MUTED};">/month</span></p>
              </td>
              <td>
                <p style="margin:0;font-size:15px;color:${MUTED};font-family:${FONT_SANS};">$${yearlyRent.toLocaleString()}/year</p>
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
    <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">Full Analysis</p>
    ${analysisHtml}

    ${divider()}

    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">You're now on our monthly market update list — one short email a month showing how rents are moving in ${city}. Reply "unsubscribe" anytime.</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">Want someone to handle the whole thing — tenant screening, rent collection, maintenance? That's what we do.</p>

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
      <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};font-size:15px;color:${TEXT};font-family:${FONT_SANS};font-weight:500;">${row.bedrooms} bed</td>
      <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};font-size:17px;color:${NAVY};font-family:${FONT_SANS};font-weight:700;text-align:right;">${row.median_rent ? `$${Math.round(row.median_rent).toLocaleString()}` : "—"}</td>
      <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};font-size:14px;text-align:right;font-family:${FONT_SANS};">${trendLabel(row.trend_direction)}</td>
    </tr>
    ${row.market_narrative ? `<tr><td colspan="3" style="padding:4px 16px 14px;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};line-height:1.6;font-family:${FONT_SANS};">${row.market_narrative}</td></tr>` : ""}
  `).join("");

  return wrapper(`
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">${city} Rental Market</p>
    <p style="margin:0 0 24px;font-size:28px;font-weight:300;color:${NAVY};font-family:${FONT_SERIF};">${month} Update</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">Hey ${name || "there"}, here's how rents are moving in ${city} this month.</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background-color:${NAVY};">
          <th style="padding:12px 16px;text-align:left;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;font-family:${FONT_SANS};">Unit size</th>
          <th style="padding:12px 16px;text-align:right;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;font-family:${FONT_SANS};">Most units rent for</th>
          <th style="padding:12px 16px;text-align:right;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.5);font-weight:700;text-transform:uppercase;font-family:${FONT_SANS};">Trend</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    ${cta("See Full Market Data", `${BASE_URL}/areas/${citySlug}`)}

    ${divider()}

    <p style="margin:0 0 8px;font-size:13px;color:${MUTED};font-family:${FONT_SANS};">Data from landlord-reported rents and Prospera's market tracking across ${city}.</p>
    <p style="margin:0;font-size:13px;color:${MUTED};font-family:${FONT_SANS};">To stop receiving these, reply with "unsubscribe".</p>
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
      <td style="padding:6px 16px 6px 0;font-size:13px;color:${MUTED};white-space:nowrap;vertical-align:top;font-family:${FONT_SANS};">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:${TEXT};font-weight:600;font-family:${FONT_SANS};">${String(value)}</td>
    </tr>`;
  }

  function section(title: string, rows: string): string {
    const content = rows.replace(/\n/g, "").trim();
    if (!content) return "";
    return `
      <p style="margin:24px 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">${title}</p>
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
    <p style="margin:0 0 4px;font-size:24px;font-weight:300;color:${NAVY};font-family:${FONT_SERIF};">New Rent Analysis</p>
    <p style="margin:0 0 28px;font-size:13px;color:${MUTED};font-family:${FONT_SANS};">ID: ${submissionId}</p>

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

    <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">Analysis Sent to Landlord</p>
    <p style="margin:0;font-size:14px;line-height:1.8;color:${TEXT};font-family:${FONT_SANS};white-space:pre-line;">${claudeAnalysis}</p>
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
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT};font-family:${FONT_SANS};">${city}</td>
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-size:14px;color:${NAVY};font-weight:700;text-align:right;font-family:${FONT_SANS};">${count} listings</td>
    </tr>
  `).join("");

  return wrapper(`
    <p style="margin:0 0 4px;font-size:24px;font-weight:300;color:${NAVY};font-family:${FONT_SERIF};">Scrape Complete</p>
    <p style="margin:0 0 28px;font-size:13px;color:${MUTED};font-family:${FONT_SANS};">${new Date(scrapedAt).toLocaleString("en-CA", { dateStyle: "full", timeStyle: "short" })} · ${source}</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;background-color:${BG_SUBTLE};border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:24px;border-right:1px solid ${BORDER};text-align:center;width:50%;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">Inserted</p>
          <p style="margin:0;font-size:36px;font-weight:300;color:${NAVY};font-family:${FONT_SERIF};">${inserted}</p>
        </td>
        <td style="padding:24px;text-align:center;width:50%;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">Skipped</p>
          <p style="margin:0;font-size:36px;font-weight:300;color:${MUTED};font-family:${FONT_SERIF};">${skipped}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">By City</p>
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
      <p style="margin:0 0 24px;font-size:17px;color:${TEXT};font-family:${FONT_SANS};">Hey ${name || "there"},</p>
      <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">Here's your download: <strong>${resourceTitle}</strong></p>
      ${fileUrl ? cta("Download Now", fileUrl) : ""}
      ${divider()}
      <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Questions? Just reply to this email.</p>
      ${signoff()}
    `);
    return { subject: `Your download: ${resourceTitle}`, html };
  }

  const stepsHtml = guide.steps.map((s, i) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
        <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
          <tr>
            <td width="28" valign="top" style="font-size:13px;font-weight:700;color:${CRIMSON};padding-top:2px;font-family:${FONT_SANS};">${i + 1}.</td>
            <td style="font-size:15px;color:${TEXT};line-height:1.7;font-family:${FONT_SANS};">${s}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  const html = wrapper(`
    <p style="margin:0 0 24px;font-size:17px;color:${TEXT};font-family:${FONT_SANS};">Hey ${name || "there"},</p>

    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">Your Download Is Ready</p>
    <p style="margin:0 0 4px;font-size:26px;font-weight:300;color:${NAVY};font-family:${FONT_SERIF};">${guide.headline}</p>

    <p style="margin:16px 0 24px;font-size:15px;color:${MUTED};font-family:${FONT_SANS};line-height:1.8;">${guide.intro}</p>

    ${fileUrl ? cta("Download: " + resourceTitle, fileUrl) : ""}

    ${divider()}

    <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">How to use this</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
      ${stepsHtml}
    </table>

    ${noteBox(guide.tip.body, guide.tip.title)}

    ${divider()}

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">Got a question about your specific situation? We're happy to help — just reply to this email.</p>

    ${cta(guide.cta.text, guide.cta.url)}

    ${divider()}

    ${signoff()}
  `);

  return { subject: guide.subject, html };
}

// ─────────────────────────────────────────────────────────────
// OWNER MONTHLY REPORT EMAIL
// ─────────────────────────────────────────────────────────────

import type { OwnerReport, RentEntry, MaintenanceItem, Expense } from "@/lib/notion";

const GREEN = "#16a34a";
const RED_ALERT = "#dc2626";
const AMBER = "#d97706";

function statusColor(status: string): string {
  if (status === "Paid") return GREEN;
  if (status === "Unpaid") return RED_ALERT;
  if (status === "Late") return AMBER;
  if (status === "Partial") return AMBER;
  return MUTED;
}

function priorityColor(priority: string): string {
  if (priority === "Urgent") return RED_ALERT;
  if (priority === "High") return AMBER;
  return MUTED;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function formatDollars(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);
}

function rentTable(entries: RentEntry[]): string {
  if (!entries.length) return `<p style="font-size:14px;color:${MUTED};font-family:${FONT_SANS};">No rent entries found for this month.</p>`;

  const rows = entries.map(r => `
    <tr>
      <td style="padding:10px 12px;font-size:14px;color:${TEXT};font-family:${FONT_SANS};border-bottom:1px solid ${BORDER};">${r.entry}</td>
      <td style="padding:10px 12px;font-size:14px;color:${TEXT};font-family:${FONT_SANS};border-bottom:1px solid ${BORDER};text-align:right;">${formatDollars(r.amountDue)}</td>
      <td style="padding:10px 12px;font-size:14px;color:${TEXT};font-family:${FONT_SANS};border-bottom:1px solid ${BORDER};text-align:right;">${formatDollars(r.amountPaid)}</td>
      <td style="padding:10px 12px;font-size:14px;font-family:${FONT_SANS};border-bottom:1px solid ${BORDER};text-align:center;">
        ${r.datePaid ? `<span style="font-size:12px;color:${MUTED};">${formatDate(r.datePaid)}</span>` : "—"}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};text-align:center;">
        <span style="font-size:12px;font-weight:700;color:${statusColor(r.paymentStatus)};font-family:${FONT_SANS};">${r.paymentStatus.toUpperCase()}</span>
      </td>
    </tr>
  `).join("");

  const totalDue = entries.reduce((s, r) => s + (r.amountDue ?? 0), 0);
  const totalPaid = entries.reduce((s, r) => s + (r.amountPaid ?? 0), 0);

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;margin:0 0 8px;">
      <thead>
        <tr style="background-color:${BG_SUBTLE};">
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};text-align:left;">Unit / Entry</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};text-align:right;">Due</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};text-align:right;">Paid</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};text-align:center;">Date</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};text-align:center;">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="background-color:${BG_SUBTLE};">
          <td style="padding:10px 12px;font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT_SANS};">Total</td>
          <td style="padding:10px 12px;font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT_SANS};text-align:right;">${formatDollars(totalDue)}</td>
          <td style="padding:10px 12px;font-size:14px;font-weight:700;color:${totalPaid >= totalDue ? GREEN : AMBER};font-family:${FONT_SANS};text-align:right;">${formatDollars(totalPaid)}</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>
  `;
}

function maintenanceSection(items: MaintenanceItem[]): string {
  if (!items.length) return `<p style="font-size:14px;color:${GREEN};font-family:${FONT_SANS};">✓ No open maintenance items.</p>`;

  return items.map(m => `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 12px;border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:14px 16px;border-left:4px solid ${priorityColor(m.priority)};">
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${TEXT};font-family:${FONT_SANS};">${m.issue}</p>
          <p style="margin:0 0 8px;font-size:13px;color:${MUTED};font-family:${FONT_SANS};">
            ${m.category} &nbsp;·&nbsp;
            <span style="color:${priorityColor(m.priority)};font-weight:700;">${m.priority} priority</span> &nbsp;·&nbsp;
            Status: <strong>${m.status}</strong>
            ${m.reportedBy ? ` &nbsp;·&nbsp; Reported by ${m.reportedBy}` : ""}
          </p>
          ${m.dateReported ? `<p style="margin:0 0 4px;font-size:13px;color:${MUTED};font-family:${FONT_SANS};">Reported: ${formatDate(m.dateReported)} — <strong style="color:${m.daysPending && m.daysPending > 30 ? AMBER : TEXT};">${m.daysPending} days pending</strong></p>` : ""}
          ${m.cost ? `<p style="margin:0 0 4px;font-size:13px;color:${TEXT};font-family:${FONT_SANS};">Estimated cost: <strong>${formatDollars(m.cost)}</strong></p>` : ""}
          ${m.notes ? `<p style="margin:8px 0 0;font-size:13px;color:${MUTED};font-family:${FONT_SANS};font-style:italic;">${m.notes}</p>` : ""}
        </td>
      </tr>
    </table>
  `).join("");
}

function expensesSection(items: Expense[]): string {
  if (!items.length) return `<p style="font-size:14px;color:${MUTED};font-family:${FONT_SANS};">No expenses logged this month.</p>`;

  const rows = items.map(e => `
    <tr>
      <td style="padding:10px 12px;font-size:14px;color:${TEXT};font-family:${FONT_SANS};border-bottom:1px solid ${BORDER};">${e.description}</td>
      <td style="padding:10px 12px;font-size:13px;color:${MUTED};font-family:${FONT_SANS};border-bottom:1px solid ${BORDER};">${e.category}</td>
      <td style="padding:10px 12px;font-size:14px;color:${TEXT};font-family:${FONT_SANS};border-bottom:1px solid ${BORDER};text-align:right;">${formatDollars(e.amount)}</td>
      <td style="padding:10px 12px;font-size:13px;color:${MUTED};font-family:${FONT_SANS};border-bottom:1px solid ${BORDER};">${formatDate(e.date)}</td>
    </tr>
  `).join("");

  const total = items.reduce((s, e) => s + (e.amount ?? 0), 0);

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;margin:0 0 8px;">
      <thead>
        <tr style="background-color:${BG_SUBTLE};">
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};text-align:left;">Description</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};text-align:left;">Category</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};text-align:right;">Amount</th>
          <th style="padding:10px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};">Date</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="background-color:${BG_SUBTLE};">
          <td colspan="2" style="padding:10px 12px;font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT_SANS};">Total</td>
          <td style="padding:10px 12px;font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT_SANS};text-align:right;">${formatDollars(total)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;
}

export function ownerMonthlyReportEmail(report: OwnerReport): { subject: string; html: string } {
  const { owner, month, year, properties } = report;
  const firstName = owner.name.split(" ")[0];

  const allRent = properties.flatMap(p => p.rent);
  const totalDue = allRent.reduce((s, r) => s + (r.amountDue ?? 0), 0);
  const totalPaid = allRent.reduce((s, r) => s + (r.amountPaid ?? 0), 0);
  const unpaidCount = allRent.filter(r => r.paymentStatus === "Unpaid" || r.paymentStatus === "Late").length;
  const allMaintenance = properties.flatMap(p => p.maintenance);
  const urgentItems = allMaintenance.filter(m => m.priority === "Urgent" || m.priority === "High");

  // Opening line — friendly, varies by situation
  let openingNote = `Everything is running smoothly at your ${properties.length > 1 ? "properties" : "property"} this month.`;
  if (unpaidCount > 0) openingNote = `Most things are on track — there ${unpaidCount === 1 ? "is 1 rent item" : `are ${unpaidCount} rent items`} that need attention.`;
  if (urgentItems.length > 0) openingNote = `Good news on rent — there ${urgentItems.length === 1 ? "is 1 maintenance item" : `are ${urgentItems.length} maintenance items`} I want to flag for you.`;

  const propertySections = properties.map(({ property, rent, maintenance, expenses }) => `
    ${divider()}
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">${property.city || "Property"}</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:300;color:${NAVY};font-family:${FONT_SERIF};">${property.name || property.address}</p>

    <p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};">Rent — ${month} ${year}</p>
    ${rentTable(rent)}

    <p style="margin:20px 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};">Open Maintenance</p>
    ${maintenanceSection(maintenance)}

    ${expenses.length > 0 ? `
      <p style="margin:20px 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-family:${FONT_SANS};">Expenses This Month</p>
      ${expensesSection(expenses)}
    ` : ""}
  `).join("");

  const html = wrapper(`
    <p style="margin:0 0 24px;font-size:17px;color:${TEXT};font-family:${FONT_SANS};line-height:1.7;">Hey ${firstName},</p>

    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT_SANS};">Monthly Update</p>
    <p style="margin:0 0 20px;font-size:28px;font-weight:300;color:${NAVY};font-family:${FONT_SERIF};">${month} ${year} — Property Report</p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">${openingNote} Here's everything for the month.</p>

    ${properties.length > 1 ? `
      ${noteBox(`Total collected: <strong>${formatDollars(totalPaid)}</strong> of <strong>${formatDollars(totalDue)}</strong> due across all properties.`, "Summary")}
    ` : ""}

    ${propertySections}

    ${divider()}

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};line-height:1.8;">Any questions or anything you want to discuss, just reply to this email or give me a call — happy to walk through anything.</p>

    ${signoff()}
  `);

  return {
    subject: `${month} ${year} — Property Update from Ebin`,
    html,
  };
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
    ${divider()}
    <h2 style="margin:0 0 8px;font-size:26px;font-weight:400;color:${NAVY};font-family:${FONT_SERIF};">New property just listed</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};font-family:${FONT_SANS};">Hey ${agentName || "there"} — a new property is available. Get your application link and start marketing it.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_SUBTLE};border:1px solid ${BORDER};border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:24px;">
        <p style="margin:0 0 4px;font-size:13px;color:${MUTED};font-family:${FONT_SANS};text-transform:uppercase;letter-spacing:0.08em;">Property</p>
        <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:${TEXT};font-family:${FONT_SANS};">${propertyAddress}, ${propertyCity}</p>
        <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">
          <strong>$${price.toLocaleString()}/mo</strong> &nbsp;·&nbsp; ${bedrooms} bed &nbsp;·&nbsp; ${bathrooms} bath
        </p>
      </td></tr>
    </table>

    ${cta("Open Agent Dashboard", dashboardLink)}

    <p style="margin:24px 0 0;font-size:13px;color:${MUTED};font-family:${FONT_SANS};text-align:center;">Your unique application link: <a href="${applyLink}" style="color:${CRIMSON};">${applyLink}</a></p>

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
    ${divider()}
    <h2 style="margin:0 0 8px;font-size:26px;font-weight:400;color:${NAVY};font-family:${FONT_SERIF};">New application received</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};font-family:${FONT_SANS};">Hey ${agentName || "there"} — a tenant just submitted an application for one of your properties.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_SUBTLE};border:1px solid ${BORDER};border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:24px;">
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};"><strong>Applicant:</strong> ${tenantName}</p>
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};"><strong>Email:</strong> ${tenantEmail}</p>
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};"><strong>Phone:</strong> ${tenantPhone}</p>
        <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT_SANS};"><strong>Property:</strong> ${propertyAddress}</p>
      </td></tr>
    </table>

    <p style="margin:0 0 24px;font-size:14px;color:${MUTED};font-family:${FONT_SANS};">Documents are being processed. You'll hear from Ebin once the screening report is ready. Application ID: <code>${applicationId}</code></p>

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
    ${divider()}
    <h2 style="margin:0 0 8px;font-size:26px;font-weight:400;color:${NAVY};font-family:${FONT_SERIF};">Application ready for review</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};font-family:${FONT_SANS};">A screening report has been generated. Your decision is needed.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_SUBTLE};border:1px solid ${BORDER};border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:24px;">
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};"><strong>Applicant:</strong> ${tenantName}</p>
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};"><strong>Property:</strong> ${propertyAddress}</p>
        <p style="margin:0 0 12px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};"><strong>Referred by:</strong> ${agentName}</p>
        <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT_SANS};"><strong>AI Score:</strong> <span style="color:${scoreColor};font-weight:700;">${aiScore}/10</span></p>
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
    ${divider()}
    <h2 style="margin:0 0 8px;font-size:26px;font-weight:400;color:${NAVY};font-family:${FONT_SERIF};">Your application has been approved</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Hi ${tenantName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">We're pleased to let you know that your application for <strong>${propertyAddress}</strong> has been approved.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Someone from our team will be in touch shortly with next steps — lease signing, move-in details, and first/last month's rent collection.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">If you have any questions in the meantime, just reply to this email.</p>

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
    ${divider()}
    <h2 style="margin:0 0 8px;font-size:26px;font-weight:400;color:${NAVY};font-family:${FONT_SERIF};">Application update</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Hi ${tenantName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Thank you for applying for <strong>${propertyAddress}</strong>. After reviewing your application, we are not able to move forward at this time.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">We appreciate your interest in Prospera Properties and wish you all the best in your search.</p>

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
    ${divider()}
    <h2 style="margin:0 0 8px;font-size:26px;font-weight:400;color:${NAVY};font-family:${FONT_SERIF};">${heading}</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};font-family:${FONT_SANS};">Hi ${agentName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">${body}</p>

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
    ${divider()}
    <h2 style="margin:0 0 8px;font-size:26px;font-weight:400;color:${NAVY};font-family:${FONT_SERIF};">Following up on your application</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Hi ${tenantName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">Just checking in on your application for <strong>${propertyAddress}</strong>. We've received everything and your file is currently under review.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">You'll hear from us as soon as a decision has been made. If you have any questions in the meantime, feel free to reply to this email.</p>
    <p style="margin:0 0 24px;font-size:15px;color:${TEXT};font-family:${FONT_SANS};">— ${agentName}, Prospera Properties</p>

    ${divider()}
    ${signoff()}
  `);
}
