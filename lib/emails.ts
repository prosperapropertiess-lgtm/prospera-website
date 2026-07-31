// ─────────────────────────────────────────────────────────────
// Prospera Properties — Email Templates
// Design: Text-first, mobile-optimised
// Body text 17px / 2.0 line-height / 28px paragraph spacing
// Font: Arial/Helvetica (email-safe, no external fonts)
// ─────────────────────────────────────────────────────────────

const BASE_URL = "https://www.prosperaproperties.co";

// Palette
const NAVY    = "#1F2F3A";
const CRIMSON = "#8B2030";
const WHITE   = "#ffffff";
const TEXT    = "#1a1a1a";
const MUTED   = "#5a6068";
const BORDER  = "#e8e4df";
const BG_CARD    = "#ffffff";
const BG_SUBTLE  = "#f6f4f1";

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
      .map((l) => `<li style="margin:0 0 12px;font-size:17px;line-height:1.9;color:${TEXT};font-family:${FONT};">${l}</li>`)
      .join("");
    return `\n<ul style="margin:16px 0 28px;padding-left:24px;">${items}</ul>\n`;
  });

  // 3. Section headings (##)
  out = out.replace(
    /^#{1,3}\s+(.+)$/gm,
    `<p style="margin:36px 0 10px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">$1</p>`
  );

  // 4. Paragraph breaks
  const pStyle = `margin:0 0 28px;font-size:17px;line-height:2.0;color:${TEXT};font-family:${FONT};`;
  out = out
    .split(/\n{2,}/)
    .map((chunk) => {
      chunk = chunk.trim();
      if (!chunk) return "";
      if (chunk.startsWith("<ul") || chunk.startsWith("<p style=\"margin:36")) return chunk;
      return `<p style="${pStyle}">${chunk.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return out;
}

// ── Shared components ────────────────────────────────────────

function wrapper(content: string): string {
  const year = new Date().getFullYear();
  const BG_OUTER = "#F5F4F1";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Prospera Properties</title>
  <style>
    :root { color-scheme: light only; supported-color-schemes: light only; }
    body { background-color: ${BG_OUTER} !important; margin: 0 !important; padding: 0 !important; }
    @media only screen and (max-width: 620px) {
      .outer-pad  { padding: 0 !important; }
      .body-pad   { padding: 36px 24px 40px !important; }
      .header-pad { padding: 16px 20px !important; }
      .footer-pad { padding: 28px 20px !important; }
      .card-wrap  { padding: 0 !important; border-radius: 0 !important; }
      .cta-btn    { width: auto !important; text-align: center !important; display: inline-block !important; box-sizing: border-box !important; }
      .market-col { display: block !important; width: 100% !important; text-align: center !important; padding: 12px 0 !important; }
      p, li       { font-size: 17px !important; line-height: 2.0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BG_OUTER};font-family:${FONT};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;" bgcolor="${BG_OUTER}">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td class="outer-pad" align="center" style="padding:28px 16px;background-color:${BG_OUTER};" bgcolor="${BG_OUTER}">
        <table class="email-container" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td class="header-pad" style="padding:20px 8px 16px;" bgcolor="${BG_OUTER}">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="https://www.prosperaproperties.co/logo.png" alt="Prospera Properties" height="34" style="height:34px;width:auto;display:block;" />
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="font-family:${FONT};font-size:12px;font-weight:700;color:rgba(15,28,40,0.45);text-transform:uppercase;letter-spacing:0.10em;">Prospera Properties</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- White content card -->
          <tr>
            <td class="card-wrap" style="padding:0;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(15,28,40,0.06),0 12px 32px rgba(15,28,40,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${WHITE};border-radius:20px;overflow:hidden;">
                <tr>
                  <td class="body-pad" style="padding:44px 40px 48px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-pad" style="padding:28px 8px 36px;text-align:center;" bgcolor="${BG_OUTER}">
              <div style="width:40px;height:40px;border-radius:99px;overflow:hidden;margin:0 auto 12px;border:2px solid rgba(15,28,40,0.10);">
                <img src="https://www.prosperaproperties.co/ebin-founder.jpg" alt="Ebin" width="40" height="40" style="width:40px;height:40px;object-fit:cover;display:block;" onerror="this.style.display='none'" />
              </div>
              <p style="margin:0 0 2px;font-family:${FONT};font-size:14px;font-weight:700;color:${NAVY};">Ebin Jaison</p>
              <p style="margin:0 0 12px;font-family:${FONT};font-size:11px;color:rgba(15,28,40,0.45);letter-spacing:0.08em;text-transform:uppercase;">Prospera Properties</p>
              <p style="margin:0 0 4px;"><a href="mailto:prosperapropertiess@gmail.com" style="font-family:${FONT};font-size:14px;color:${CRIMSON};text-decoration:none;">prosperapropertiess@gmail.com</a></p>
              <p style="margin:0 0 20px;font-family:${FONT};font-size:13px;color:rgba(15,28,40,0.45);">(519) 697-1227</p>
              <p style="margin:0;font-family:${FONT};font-size:10px;color:rgba(15,28,40,0.25);text-transform:uppercase;letter-spacing:0.1em;">&#169; ${year} Prospera Properties Management Group</p>
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
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:36px 0;">
    <tr><td style="height:1px;background-color:${BORDER};"></td></tr>
  </table>`;
}

function cta(text: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0;">
    <tr>
      <td align="center" style="text-align:center;">
        <a class="cta-btn" href="${url}" style="display:inline-block;padding:16px 36px;background-color:${CRIMSON};color:${WHITE};text-decoration:none;font-size:16px;font-weight:700;letter-spacing:0.3px;font-family:${FONT};border-radius:10px;">${text} &rarr;</a>
      </td>
    </tr>
  </table>`;
}

function noteBox(body: string, label?: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0;">
    <tr>
      <td style="background-color:${BG_SUBTLE};border-left:4px solid ${CRIMSON};border-radius:0 12px 12px 0;padding:20px 24px;">
        ${label ? `<p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">${label}</p>` : ""}
        <p style="margin:0;font-size:16px;line-height:1.9;color:${TEXT};font-family:${FONT};">${body}</p>
      </td>
    </tr>
  </table>`;
}

function signoff(name = "Ebin"): string {
  return `<p style="margin:0;font-size:16px;color:${TEXT};font-family:${FONT};line-height:1.9;">&#8212; ${name} &middot; Prospera Properties &middot; (519) 697-1227</p>`;
}

function heroCard(greeting: string, subtitle: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;">
    <tr>
      <td style="background:${NAVY};border-radius:14px;padding:36px 32px 32px;text-align:left;">
        <p style="margin:0 0 4px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(250,248,245,0.45);">Prospera Properties</p>
        <p style="margin:0 0 12px;font-family:${FONT};font-size:28px;font-weight:700;color:#FAF8F5;line-height:1.25;">${greeting}</p>
        <p style="margin:0;font-family:${FONT};font-size:15px;color:rgba(250,248,245,0.6);line-height:1.7;">${subtitle}</p>
      </td>
    </tr>
  </table>`;
}

// Dark stat band — big bold numbers on navy, like a property spec row
function darkStats(items: { value: string; label: string }[]): string {
  const cols = items.map((item, i) => `
    <td style="text-align:center;padding:28px 12px;${i > 0 ? `border-left:1px solid rgba(250,248,245,0.10);` : ""}">
      <p style="margin:0 0 6px;font-family:${FONT};font-size:34px;font-weight:700;color:#FAF8F5;line-height:1;">${item.value}</p>
      <p style="margin:0;font-family:${FONT};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(250,248,245,0.45);">${item.label}</p>
    </td>
  `).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;border-radius:14px;overflow:hidden;background:${NAVY};">
    <tr>${cols}</tr>
  </table>`;
}

// ── LANDLORD WELCOME ─────────────────────────────────────────

export function landlordWelcomeEmail(name: string): string {
  const PDF_URL = `${BASE_URL}/lease-addendum.pdf`;

  return wrapper(`
    ${heroCard(`Hey ${name || "there"},`, "Your Lease Protection Addendum is ready — and it fills in gaps most landlords don't even know exist.")}

    ${darkStats([
      { value: "90", label: "Day Guarantee" },
      { value: "2–5", label: "Unit Specialists" },
      { value: "24hr", label: "Response Time" },
    ])}

    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Ontario's standard lease leaves a lot open. This addendum closes it — noise, pets, parking, utilities, entry notice, subletting. The stuff that causes problems later.</p>

    ${cta("Download the Addendum (PDF)", PDF_URL)}

    ${divider()}

    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">I'm Ebin. I run Prospera Properties — full-service management across London, St. Thomas, and Strathroy. Tenant screening, rent collection, maintenance, the whole thing.</p>

    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">If you're still doing it yourself on 2–5 units and want to hand it off, that's exactly who we work with.</p>

    ${cta("See How It Works", `${BASE_URL}/for-landlords`)}

    ${divider()}

    ${signoff()}
  `);
}

// ── TENANT WELCOME ───────────────────────────────────────────

export function tenantWelcomeEmail(name: string, city?: string): string {
  return wrapper(`
    ${heroCard(`Hey ${name || "there"},`, `You're on the list${city ? ` for ${city}` : ""}. We'll be in touch as soon as something opens up.`)}

    ${darkStats([
      { value: "24hr", label: "Maintenance Response" },
      { value: "3", label: "Cities Covered" },
      { value: "100%", label: "Verified Listings" },
    ])}

    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">We're a bit different from most landlords: maintenance actually gets fixed, phones actually get answered, and our places are properly looked after before you move in.</p>

    ${cta("Browse Available Rentals", `${BASE_URL}/listings`)}

    ${divider()}

    ${noteBox("Rent can only be raised once a year with 90 days written notice. Your landlord needs 24 hours notice to enter (except emergencies). You can't be evicted without a proper LTB hearing.", "Know your rights as an Ontario tenant")}

    ${divider()}

    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};">Questions? Just reply — a real person will get back to you.</p>

    ${signoff()}
  `);
}

// ── CONTACT CONFIRMATION ─────────────────────────────────────

export function contactConfirmationEmail(name: string, type?: string): string {
  const isLandlord = type === "landlord";
  const isTenant = type === "tenant";

  return wrapper(`
    ${heroCard(`Hey ${name || "there"},`, "Got your message. I'll be in touch personally within one business day.")}

    ${darkStats([
      { value: "1", label: "Business Day Response" },
      { value: "90", label: "Day Guarantee" },
      { value: "SW", label: "Ontario Coverage" },
    ])}

    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">If it's urgent, call me directly at <a href="tel:+15196971227" style="color:${CRIMSON};text-decoration:none;font-weight:600;">(519) 697-1227</a>.</p>

    ${divider()}

    ${isLandlord
      ? `<p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};">In the meantime, our free landlord resources are worth a look — lease templates, screening checklists, eviction guides.</p>
         ${cta("Browse Free Resources", `${BASE_URL}/resources`)}`
      : isTenant
      ? `<p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};">Check what's available while you wait — we add new properties regularly.</p>
         ${cta("View Available Rentals", `${BASE_URL}/listings`)}`
      : `<p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};">Find out how Prospera Properties works for landlords and tenants across Southwest Ontario.</p>
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

    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Your rent analysis link is ready. Click below, fill in your ${bedsLabel}property details${cityLabel}, and we'll send back a full written report — usually within minutes.</p>

    ${cta("Start My Rent Analysis", link)}

    ${noteBox("This link is just for you and expires in 7 days. The form takes about 2 minutes.", "Quick note")}

    ${divider()}

    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">The analysis looks at what similar units are renting for right now, what features add or take away value, and gives you one clear number to work with — not a vague range.</p>

    ${signoff()}
  `);
}

// ── RENT ANALYSIS — REPORT EMAIL ────────────────────────────

interface ComparableItem {
  city: string;
  city_zone: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  rent_amount: number;
  garage: string | null;
  parking_spots: number | null;
  utilities_included: string | null;
  laundry: string | null;
  furnished: string | null;
  source_note: string | null;
  source_url: string | null;
  submitted_at: string;
}

export function rentAnalysisReportEmail({
  name,
  city,
  bedrooms,
  unitType,
  rentAmount,
  claudeAnalysis,
  marketData,
  comparables,
}: {
  name?: string | null;
  city: string;
  bedrooms?: number | null;
  unitType?: string | null;
  rentAmount: number;
  claudeAnalysis: string;
  marketData?: { p25_rent: number | null; median_rent: number | null; p75_rent: number | null; submission_count: number } | null;
  comparables?: ComparableItem[];
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
      <p style="margin:0 0 28px;font-size:16px;color:${positionColor};font-family:${FONT};font-weight:600;">${positionText}</p>
    `;
  })() : "";

  // ── Formatted analysis ──
  const analysisHtml = md(claudeAnalysis);

  // ── Comparables block ──
  const comparablesBlock = comparables && comparables.length > 0 ? (() => {
    const cards = comparables.map((c) => {
      const type = c.property_type ? c.property_type.charAt(0).toUpperCase() + c.property_type.slice(1).replace(/_/g, " ") : "Unit";
      const area = c.city_zone ? c.city_zone.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) + ", " + c.city : c.city;
      const tags: string[] = [];
      if (c.sqft) tags.push(`${c.sqft.toLocaleString()} sqft`);
      if (c.bathrooms) tags.push(`${c.bathrooms} bath`);
      if (c.laundry && c.laundry !== "none") tags.push(c.laundry === "in_unit" ? "In-unit laundry" : c.laundry === "shared" ? "Shared laundry" : c.laundry.replace(/_/g, " "));
      if (c.utilities_included && c.utilities_included !== "none") {
        const util = c.utilities_included.replace(/_/g, "+").replace("water+hydro+gas", "all utilities").replace("water+hydro", "water+hydro");
        tags.push(`${util} incl.`);
      }
      if (c.parking_spots && c.parking_spots > 0) tags.push(`${c.parking_spots} parking`);
      if (c.garage && c.garage !== "none") tags.push(`${c.garage.replace(/_/g, " ")} garage`);

      const tagHtml = tags.length > 0
        ? `<p style="margin:6px 0 0;font-size:13px;color:${MUTED};font-family:${FONT};">${tags.join(" &middot; ")}</p>`
        : "";

      const sourceName = c.source_note || "Listing";
      const linkHtml = c.source_url
        ? `<a href="${c.source_url}" style="display:inline-block;margin-top:12px;font-size:13px;font-weight:700;color:${CRIMSON};font-family:${FONT};text-decoration:none;">View listing &rarr;</a>`
        : `<p style="margin-top:12px;font-size:13px;color:${MUTED};font-family:${FONT};">${sourceName}</p>`;

      return `
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 10px;background-color:${BG_SUBTLE};border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:16px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:${MUTED};font-family:${FONT};text-transform:uppercase;letter-spacing:1px;font-weight:700;">${type} &middot; ${area}</p>
                    <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:${NAVY};font-family:${FONT};">$${c.rent_amount.toLocaleString()}<span style="font-size:14px;font-weight:400;color:${MUTED};">/mo</span></p>
                    ${tagHtml}
                    ${linkHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    }).join("");

    return `
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">What similar units are renting for right now</p>
      <p style="margin:0 0 16px;font-size:14px;color:${MUTED};font-family:${FONT};">These are real active listings we tracked in ${city} — same bedroom count, same area, last 60 days. Click through to see exactly what you're up against.</p>
      ${cards}
    `;
  })() : "";

  return wrapper(`
    ${heroCard(`Hey ${name || "there"},`, `Your ${bedsLabel} ${typeLabel} rent analysis for ${city}`)}

    <!-- Property at a glance -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;background-color:${BG_CARD};border:1px solid ${BORDER};border-radius:20px;overflow:hidden;">
      <tr>
        <td style="padding:24px 28px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">Your property</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:${NAVY};font-family:${FONT};">${bedsLabel} ${typeLabel} &middot; ${city}</p>
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-right:24px;">
                <p style="margin:0;font-size:22px;font-weight:700;color:${NAVY};font-family:${FONT};">$${rentAmount.toLocaleString()}<span style="font-size:14px;font-weight:400;color:${MUTED};">/month</span></p>
              </td>
              <td>
                <p style="margin:0;font-size:17px;color:${MUTED};font-family:${FONT};">$${yearlyRent.toLocaleString()}/year</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Market data -->
    ${marketBlock}

    <!-- Comparables -->
    ${comparablesBlock.length > 0 ? `${divider()}${comparablesBlock}` : ""}

    ${divider()}

    <!-- Analysis -->
    <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">Full Analysis</p>
    ${analysisHtml}

    ${divider()}

    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">You're now on our monthly market update list — one short email a month showing how rents are moving in ${city}. Reply "unsubscribe" anytime.</p>

    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Want someone to handle the whole thing — tenant screening, rent collection, maintenance? That's what we do.</p>

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
    if (t === "up")   return `<span style="color:#0D6E5A;font-weight:600;">&#8593; Rising</span>`;
    if (t === "down") return `<span style="color:${CRIMSON};font-weight:600;">&#8595; Falling</span>`;
    if (t === "flat") return `<span style="color:${MUTED};">&#8594; Stable</span>`;
    return `<span style="color:${MUTED};">&#8212;</span>`;
  };

  const rowsHtml = data.map((row) => `
    <tr style="background-color:${WHITE};">
      <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};font-size:17px;color:${TEXT};font-family:${FONT};font-weight:500;">${row.bedrooms} bed</td>
      <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};font-size:17px;color:${NAVY};font-family:${FONT};font-weight:700;text-align:right;">${row.median_rent ? `$${Math.round(row.median_rent).toLocaleString()}` : "—"}</td>
      <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};font-size:14px;text-align:right;font-family:${FONT};">${trendLabel(row.trend_direction)}</td>
    </tr>
    ${row.market_narrative ? `<tr><td colspan="3" style="padding:4px 16px 14px;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};line-height:1.6;font-family:${FONT};">${row.market_narrative}</td></tr>` : ""}
  `).join("");

  return wrapper(`
    ${heroCard(`${city} Market &#8212; ${month}`, "Here's how rents are moving this month.")}

    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Hey ${name || "there"}, here's how rents are moving in ${city} this month.</p>

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
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-size:16px;color:${TEXT};font-family:${FONT};">${city}</td>
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-size:16px;color:${NAVY};font-weight:700;text-align:right;font-family:${FONT};">${count} listings</td>
    </tr>
  `).join("");

  return wrapper(`
    <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:${NAVY};font-family:${FONT};">Scrape Complete</p>
    <p style="margin:0 0 28px;font-size:13px;color:${MUTED};font-family:${FONT};">${new Date(scrapedAt).toLocaleString("en-CA", { dateStyle: "full", timeStyle: "short" })} &middot; ${source}</p>

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
      <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Here's your download: <strong>${resourceTitle}</strong></p>
      ${fileUrl ? cta("Download Now", fileUrl) : ""}
      ${divider()}
      <p style="margin:0;font-size:17px;color:${TEXT};font-family:${FONT};">Questions? Just reply to this email.</p>
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
            <td style="font-size:17px;color:${TEXT};line-height:1.7;font-family:${FONT};">${step}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  const html = wrapper(`
    ${heroCard(`Your download is ready, ${name || "there"}.`, guide.headline)}

    <p style="margin:16px 0 24px;font-size:17px;color:${MUTED};font-family:${FONT};line-height:2.0;">${guide.intro}</p>

    ${fileUrl ? cta("Download: " + resourceTitle, fileUrl) : ""}

    ${divider()}

    <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">How to use this</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
      ${stepsHtml}
    </table>

    ${noteBox(guide.tip.body, guide.tip.title)}

    ${divider()}

    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Got a question about your specific situation? We're happy to help — just reply to this email.</p>

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
    ${heroCard(`New listing &#8212; ${propertyAddress}`, `${propertyCity} &middot; ${bedrooms} bed &middot; $${price.toLocaleString()}/mo`)}

    <p style="margin:0 0 32px;font-size:17px;color:${MUTED};font-family:${FONT};">Hey ${agentName || "there"} — a new property is available. Get your application link and start marketing it.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_CARD};border:1px solid ${BORDER};border-radius:20px;margin:0 0 24px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 4px;font-size:13px;color:${MUTED};font-family:${FONT};text-transform:uppercase;letter-spacing:0.08em;">Property</p>
        <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:${TEXT};font-family:${FONT};">${propertyAddress}, ${propertyCity}</p>
        <p style="margin:0;font-size:17px;color:${TEXT};font-family:${FONT};">
          <strong>$${price.toLocaleString()}/mo</strong> &nbsp;&middot;&nbsp; ${bedrooms} bed &nbsp;&middot;&nbsp; ${bathrooms} bath
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

    <p style="margin:0 0 32px;font-size:17px;color:${MUTED};font-family:${FONT};">Hey ${agentName || "there"} — a tenant just submitted an application for one of your properties.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_CARD};border:1px solid ${BORDER};border-radius:20px;margin:0 0 24px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 12px;font-size:17px;color:${TEXT};font-family:${FONT};"><strong>Applicant:</strong> ${tenantName}</p>
        <p style="margin:0 0 12px;font-size:17px;color:${TEXT};font-family:${FONT};"><strong>Email:</strong> ${tenantEmail}</p>
        <p style="margin:0 0 12px;font-size:17px;color:${TEXT};font-family:${FONT};"><strong>Phone:</strong> ${tenantPhone}</p>
        <p style="margin:0;font-size:17px;color:${TEXT};font-family:${FONT};"><strong>Property:</strong> ${propertyAddress}</p>
      </td></tr>
    </table>

    <p style="margin:0 0 24px;font-size:16px;color:${MUTED};font-family:${FONT};">Documents are being processed. You'll hear from Ebin once the screening report is ready. Application ID: <code>${applicationId}</code></p>

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
    <p style="margin:0 0 28px;font-size:17px;color:${MUTED};font-family:${FONT};">A screening report has been generated. Your decision is needed.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_CARD};border:1px solid ${BORDER};border-radius:20px;margin:0 0 24px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 12px;font-size:17px;color:${TEXT};font-family:${FONT};"><strong>Applicant:</strong> ${tenantName}</p>
        <p style="margin:0 0 12px;font-size:17px;color:${TEXT};font-family:${FONT};"><strong>Property:</strong> ${propertyAddress}</p>
        <p style="margin:0 0 12px;font-size:17px;color:${TEXT};font-family:${FONT};"><strong>Referred by:</strong> ${agentName}</p>
        <p style="margin:0;font-size:17px;color:${TEXT};font-family:${FONT};"><strong>AI Score:</strong> <span style="color:${scoreColor};font-weight:700;">${aiScore}/10</span></p>
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

    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">We're pleased to let you know that your application for <strong>${propertyAddress}</strong> has been approved.</p>
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">Someone from our team will be in touch shortly with next steps — lease signing, move-in details, and first/last month's rent collection.</p>
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">If you have any questions in the meantime, just reply to this email.</p>

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
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">Hi ${tenantName},</p>
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">Thank you for applying for <strong>${propertyAddress}</strong>. After reviewing your application, we are not able to move forward at this time.</p>
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">We appreciate your interest in Prospera Properties and wish you all the best in your search.</p>

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
    <p style="margin:0 0 32px;font-size:17px;color:${MUTED};font-family:${FONT};">Hi ${agentName},</p>
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">${body}</p>

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

    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">Just checking in on your application for <strong>${propertyAddress}</strong>. We've received everything and your file is currently under review.</p>
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">You'll hear from us as soon as a decision has been made. If you have any questions in the meantime, feel free to reply to this email.</p>
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};">&#8212; ${agentName}, Prospera Properties</p>

    ${divider()}
    ${signoff()}
  `);
}

// ─────────────────────────────────────────────────────────────
// LANDLORD ONBOARDING SEQUENCE — 8 emails + tenant intro
// Dark-first design, progress bar in every email.
// Short, punchy, one CTA per email.
// ─────────────────────────────────────────────────────────────

function onboardProgressBar(step: number, label: string): string {
  const pct = Math.round((step / 10) * 100);
  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0 8px;">
    <tr>
      <td>
        <div style="background:#e5e7eb;border-radius:6px;height:8px;overflow:hidden;">
          <div style="background:${CRIMSON};border-radius:6px;height:8px;width:${pct}%;"></div>
        </div>
        <p style="margin:6px 0 0;font-family:${FONT};font-size:11px;color:${MUTED};letter-spacing:0.05em;">
          <strong style="color:${CRIMSON};">${pct}% complete</strong> &nbsp;·&nbsp; ${label}
        </p>
      </td>
    </tr>
  </table>`;
}

function onboardChecklist(items: { label: string; done: boolean }[]): string {
  const rows = items.map(item => `
    <tr>
      <td style="padding:6px 0;font-family:${FONT};font-size:16px;color:${item.done ? TEXT : MUTED};">
        <span style="margin-right:10px;">${item.done ? "✅" : "⬜"}</span>${item.label}
      </td>
    </tr>`).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">${rows}</table>`;
}

// Email 1 — Welcome + unified step list
export function onboardEmail1Welcome(data: {
  ownerName: string;
  propertyAddress: string;
  dashboardUrl: string;
}): string {
  const firstName = data.ownerName.split(" ")[0];
  const GREEN = "#0A7A52";

  const steps = [
    { done: true,  label: "We met and talked about your property",      detail: "" },
    { done: true,  label: "Your property was added to our system",       detail: "" },
    { done: true,  label: "Welcome email sent — you're reading it now",  detail: "" },
    { done: false, label: "Upload your current lease",                   detail: "If you already have tenants, upload the lease you signed with them. We'll read it and pull all the details automatically — you won't need to type anything." },
    { done: false, label: "Answer a few quick questions",                detail: "Things like how many units, roughly how much rent, anything else we should know. Takes about 3 minutes." },
    { done: false, label: "Sign the management agreement",               detail: "A short, plain-English agreement that explains exactly what we do and what it costs. No confusing legal language." },
    { done: false, label: "Hand over the keys — we take it from here",   detail: "We'll do the first inspection, introduce ourselves to your tenants, and set everything up. After this, the day-to-day is ours to handle." },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const totalCount = steps.length;
  const pct = Math.round((doneCount / totalCount) * 100);

  const stepRows = steps.map((s, i) => {
    if (s.done) {
      return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
          <table cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr>
            <td style="width:28px;vertical-align:top;padding-top:1px;font-size:17px;line-height:1;">✅</td>
            <td style="padding-left:10px;">
              <p style="margin:0;font-family:${FONT};font-size:15px;color:${MUTED};text-decoration:line-through;line-height:1.6;">${s.label}</p>
            </td>
          </tr></table>
        </td>
      </tr>`;
    }
    const isNext = i === doneCount; // first incomplete step
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
          <table cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr>
            <td style="width:28px;vertical-align:top;padding-top:2px;">
              <div style="width:22px;height:22px;border-radius:99px;background:${isNext ? CRIMSON : "#d1d5db"};text-align:center;font-family:${FONT};font-size:11px;font-weight:700;color:#fff;line-height:22px;">${i + 1}</div>
            </td>
            <td style="padding-left:12px;">
              <p style="margin:0 0 ${s.detail ? "4px" : "0"};font-family:${FONT};font-size:15px;font-weight:${isNext ? "700" : "400"};color:${isNext ? TEXT : MUTED};line-height:1.6;">${isNext ? "→ " : ""}${s.label}${isNext ? " <span style=\"font-size:12px;background:" + CRIMSON + ";color:#fff;border-radius:4px;padding:1px 7px;font-weight:700;vertical-align:middle;margin-left:6px;\">Next</span>" : ""}</p>
              ${s.detail ? `<p style="margin:0;font-family:${FONT};font-size:14px;color:${MUTED};line-height:1.7;">${s.detail}</p>` : ""}
            </td>
          </tr></table>
        </td>
      </tr>`;
  }).join("");

  return wrapper(`
    <!-- Title -->
    <p style="margin:0 0 4px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">Prospera Properties</p>
    <p style="margin:0 0 4px;font-family:${FONT};font-size:26px;font-weight:700;color:${NAVY};line-height:1.2;">Welcome to Prospera, ${firstName}.</p>
    <p style="margin:0 0 24px;font-family:${FONT};font-size:16px;color:${MUTED};line-height:1.6;">${data.propertyAddress} is in good hands.</p>

    <p style="margin:0 0 16px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:1.9;">I'm Ebin — I run Prospera personally. Thank you for trusting us with your property. I know that's not a small thing, and I take it seriously.</p>
    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:1.9;">We've set up a personal dashboard just for you. Think of it like a live checklist — it shows exactly what's been done, what's coming up next, and where everything stands. You'll get an email every time something changes.</p>

    <!-- Before you start block -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;">
      <tr>
        <td style="background:#f6f4f1;border-radius:12px;padding:22px 24px;">
          <p style="margin:0 0 12px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">Before you start — set aside 30 minutes</p>
          <p style="margin:0 0 16px;font-family:${FONT};font-size:15px;color:${TEXT};line-height:1.8;">This is the only time you'll ever fill this in. Once it's done, you hand it off and never think about it again. Here's what you'll need handy:</p>
          <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tr><td style="padding:5px 0;font-family:${FONT};font-size:15px;color:${TEXT};line-height:1.7;">📄 &nbsp;Your current lease (PDF or a photo is fine)</td></tr>
            <tr><td style="padding:5px 0;font-family:${FONT};font-size:15px;color:${TEXT};line-height:1.7;">💳 &nbsp;Banking details for receiving your rent</td></tr>
            <tr><td style="padding:5px 0;font-family:${FONT};font-size:15px;color:${TEXT};line-height:1.7;">🔑 &nbsp;Access codes — front door, garage, alarm (if any)</td></tr>
            <tr><td style="padding:5px 0;font-family:${FONT};font-size:15px;color:${TEXT};line-height:1.7;">🛡️ &nbsp;Your insurance provider name (optional but helpful)</td></tr>
            <tr><td style="padding:5px 0;font-family:${FONT};font-size:15px;color:${TEXT};line-height:1.7;">🔧 &nbsp;Names of any contractors you already trust</td></tr>
            <tr><td style="padding:5px 0;font-family:${FONT};font-size:15px;color:${TEXT};line-height:1.7;">🗑️ &nbsp;Garbage pickup day and where the bins go</td></tr>
          </table>
          <p style="margin:16px 0 0;font-family:${FONT};font-size:15px;color:${MUTED};line-height:1.8;">Thirty minutes now saves you hours of phone calls, back-and-forth, and late-night stress down the road. That's the whole point.</p>
        </td>
      </tr>
    </table>

    <!-- Progress bar -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 6px;">
      <tr><td>
        <div style="background:#e5e7eb;border-radius:6px;height:8px;overflow:hidden;">
          <div style="background:${GREEN};border-radius:6px;height:8px;width:${pct}%;"></div>
        </div>
      </td></tr>
    </table>
    <p style="margin:0 0 28px;font-family:${FONT};font-size:13px;color:${MUTED};">${doneCount} of ${totalCount} steps complete</p>

    ${divider()}

    <!-- Unified step list -->
    <p style="margin:0 0 12px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">Your onboarding checklist</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;">
      ${stepRows}
    </table>

    ${cta("Open My Dashboard", data.dashboardUrl)}

    <p style="margin:12px 0 0;text-align:center;font-family:${FONT};font-size:13px;color:${MUTED};">Your dashboard tracks all of this live — it updates every time something changes.</p>

    ${divider()}

    <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.9;">Any questions? Just reply — I read every single one personally.<br><br>&#8212; Ebin &nbsp;&middot;&nbsp; (519) 697-1227</p>
  `);
}

// Email 2 — Details Received + Agreement Link
export function onboardEmail2DetailsReceived(data: {
  ownerName: string;
  propertyAddress: string;
  tenantCount: number;
  fieldsExtracted: number;
  agreementUrl: string;
}): string {
  return wrapper(`
    ${heroCard(
      "Details received.",
      `${data.propertyAddress} is taking shape.`
    )}

    ${onboardProgressBar(5, "Property details confirmed")}

    ${onboardChecklist([
      { label: `Property at ${data.propertyAddress} set up`, done: true },
      { label: `${data.tenantCount} tenant${data.tenantCount !== 1 ? "s" : ""} added${data.fieldsExtracted > 0 ? ` (${data.fieldsExtracted} fields pulled from lease)` : ""}`, done: true },
      { label: "Rent collection schedule created", done: true },
      { label: "Management agreement — pending your signature", done: false },
    ])}

    <p style="margin:20px 0 24px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      One more thing: your management agreement. Straightforward — takes about 2 minutes to read and sign.
    </p>

    ${cta("Review & Sign Your Agreement →", data.agreementUrl)}

    ${divider()}
    ${signoff()}
  `);
}

// Email 3 — Agreement Signed + Book Meeting
export function onboardEmail3AgreementSigned(data: {
  ownerName: string;
  propertyAddress: string;
  signedAt: string;
  agreementUrl?: string;
}): string {
  const firstName = data.ownerName.split(" ")[0];
  const signedDate = new Date(data.signedAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

  return wrapper(`
    <p style="margin:0 0 4px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">Prospera Properties</p>
    <p style="margin:0 0 4px;font-family:${FONT};font-size:26px;font-weight:700;color:${NAVY};line-height:1.2;">Agreement signed, ${firstName}.</p>
    <p style="margin:0 0 28px;font-family:${FONT};font-size:16px;color:${MUTED};line-height:1.6;">${data.propertyAddress}</p>

    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Your management agreement is signed and on file. Ebin has been notified and will reach out shortly to arrange a time to meet at the property, collect the keys, and do the initial walkthrough — usually 30–45 minutes.</p>

    ${noteBox(`Signed by ${data.ownerName} · ${signedDate}`, "Agreement on record")}

    ${data.agreementUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0 32px;">
      <tr>
        <td style="background:#f6f4f1;border-radius:12px;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
            <td style="font-family:${FONT};font-size:15px;color:${TEXT};font-weight:600;">📄 &nbsp;Management Agreement.pdf</td>
            <td align="right" style="white-space:nowrap;">
              <a href="${data.agreementUrl}" style="font-family:${FONT};font-size:14px;font-weight:700;color:${CRIMSON};text-decoration:none;">Download →</a>
            </td>
          </tr></table>
        </td>
      </tr>
    </table>` : ""}

    ${divider()}
    <p style="margin:0;font-size:15px;color:${TEXT};font-family:${FONT};line-height:1.9;">Nothing else needed from you right now. I'll be in touch soon.<br><br>&#8212; Ebin &nbsp;&middot;&nbsp; (519) 697-1227</p>
  `);
}

// Email 4 — Keys Received
export function onboardEmail4KeysReceived(data: {
  ownerName: string;
  propertyAddress: string;
  keyCount?: number;
}): string {
  return wrapper(`
    ${heroCard("Keys received. 🔑", `${data.propertyAddress} is secure with us.`)}

    ${onboardProgressBar(6, "Keys & access confirmed")}

    <p style="margin:24px 0 24px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      We've received ${data.keyCount ? `${data.keyCount} key${data.keyCount !== 1 ? "s" : ""}` : "the keys"} for ${data.propertyAddress}. We're storing them securely. Next up: the initial inspection — we'll send you the full report when it's done.
    </p>

    ${divider()}
    ${signoff()}
  `);
}

// Email 5 — Inspection Complete
export function onboardEmail5InspectionDone(data: {
  ownerName: string;
  propertyAddress: string;
  condition: string;
  issueCount: number;
  nextInspectionDate: string;
}): string {
  const hasIssues = data.issueCount > 0;
  return wrapper(`
    ${heroCard(
      "Inspection complete. 📋",
      hasIssues
        ? `${data.issueCount} item${data.issueCount !== 1 ? "s" : ""} noted at ${data.propertyAddress}.`
        : `${data.propertyAddress} is in great shape.`
    )}

    ${onboardProgressBar(7, "Initial inspection done")}

    ${onboardChecklist([
      { label: `Overall condition: ${data.condition}`, done: true },
      { label: hasIssues
          ? `${data.issueCount} issue${data.issueCount !== 1 ? "s" : ""} logged — we'll follow up with quotes`
          : "No issues found", done: true },
      { label: `Next inspection: ${data.nextInspectionDate}`, done: true },
    ])}

    ${hasIssues
      ? `<p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">We'll follow up with quotes and timelines shortly.</p>`
      : `<p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Your property is well maintained. We'll check in again on ${data.nextInspectionDate}.</p>`
    }

    ${divider()}
    ${signoff()}
  `);
}

// Email 6 — Tenants Notified
export function onboardEmail6TenantsNotified(data: {
  ownerName: string;
  propertyAddress: string;
  tenantCount: number;
}): string {
  return wrapper(`
    ${heroCard("Your tenants have been notified. ✅", data.propertyAddress)}

    ${onboardProgressBar(8, "Tenant notifications sent")}

    <p style="margin:24px 0 24px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      All ${data.tenantCount} tenant${data.tenantCount !== 1 ? "s" : ""} at ${data.propertyAddress} received an introduction letter and their Tenant Guidebook — garbage schedule, parking, property rules, and emergency contacts.
    </p>
    <p style="margin:0 0 0;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      One last step — confirming your financial setup and you're fully onboarded.
    </p>

    ${divider()}
    ${signoff()}
  `);
}

// Email 7 — Financial Setup Confirmed
export function onboardEmail7FinancialSetup(data: {
  ownerName: string;
  propertyAddress: string;
  rentCollectionDate: string;
  feeDescription: string;
  reportDay?: number;
}): string {
  const rd = data.reportDay ?? 3;
  const suffix = rd === 1 ? "st" : rd === 2 ? "nd" : rd === 3 ? "rd" : "th";
  return wrapper(`
    ${heroCard("Financial setup complete. 💰", "Here's what happens next.")}

    ${onboardProgressBar(9, "Financial setup confirmed")}

    ${onboardChecklist([
      { label: `Rent collection begins ${data.rentCollectionDate}`, done: true },
      { label: `Management fee: ${data.feeDescription} — deducted monthly`, done: true },
      { label: "Net payment arrives by the 5th of each month", done: true },
      { label: `Monthly report arrives on the ${rd}${suffix} of each month`, done: true },
    ])}

    <p style="margin:20px 0 0;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      Almost there — your personal dashboard is being prepared now.
    </p>

    ${divider()}
    ${signoff()}
  `);
}

// Email 8 — Welcome, Fully Onboarded
export function onboardEmail8Welcome(data: {
  ownerName: string;
  propertyAddress: string;
  tenantCount: number;
  rentCollectionDate: string;
  dashboardUrl: string;
  checkInDate?: string;
}): string {
  return wrapper(`
    ${heroCard("You're officially with Prospera. 🎉", `${data.propertyAddress} is live.`)}

    ${onboardProgressBar(10, "Fully onboarded")}

    ${onboardChecklist([
      { label: `${data.propertyAddress} set up in our system`, done: true },
      { label: `${data.tenantCount} tenant${data.tenantCount !== 1 ? "s" : ""} on file and notified`, done: true },
      { label: "Initial inspection complete", done: true },
      { label: `Rent collection begins ${data.rentCollectionDate}`, done: true },
      { label: "Monthly reports arrive on the 3rd of each month", done: true },
      { label: "Your personal dashboard is ready", done: true },
    ])}

    ${cta("Open Your Owner Dashboard →", data.dashboardUrl)}

    <!-- Homescreen + bookmark tip -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0 32px;">
      <tr>
        <td style="background:#f6f4f1;border-radius:12px;padding:20px 24px;">
          <p style="margin:0 0 12px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">Save this for quick access</p>
          <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tr><td style="padding:4px 0;font-family:${FONT};font-size:15px;color:${TEXT};line-height:1.7;">📱 &nbsp;<strong>Add to home screen</strong> — open the dashboard in your browser, tap Share → "Add to Home Screen" (iPhone) or the three-dot menu → "Add to Home Screen" (Android)</td></tr>
            <tr><td style="padding:4px 0;font-family:${FONT};font-size:15px;color:${TEXT};line-height:1.7;">⭐ &nbsp;<strong>Bookmark this email</strong> — it has your personal dashboard link. Keep it somewhere you can find it.</td></tr>
          </table>
        </td>
      </tr>
    </table>

    ${data.checkInDate
      ? noteBox(`I'll reach out on ${data.checkInDate} for our first check-in. Until then, my direct line is always open.`, "30-Day Check-In")
      : ""}

    ${divider()}
    <p style="margin:0 0 8px;font-size:17px;color:${TEXT};font-family:${FONT};font-weight:600;">You're in good hands.</p>
    ${signoff()}
  `);
}

// Tenant Intro Letter
export function onboardTenantIntroEmail(data: {
  tenantName: string;
  propertyAddress: string;
  startDate: string;
}): string {
  return wrapper(`
    ${heroCard(
      `Hi ${data.tenantName.split(" ")[0]},`,
      "Important update about your property management."
    )}

    <p style="margin:24px 0 16px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      My name is Ebin Jaison from <strong>Prospera Properties</strong>. Starting ${data.startDate}, I'll be managing <strong>${data.propertyAddress}</strong> on behalf of the property owner.
    </p>
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      For maintenance requests, rent questions, or anything related to your unit — I'm your contact going forward.
    </p>

    ${noteBox("Phone/Text: (519) 697-1227<br>Email: hello@prosperaproperties.co<br>Response time: same day for urgent matters", "How to reach me")}

    <p style="margin:20px 0 16px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      <strong>Rent payments:</strong> Please continue paying rent as you normally do. Any changes to payment instructions will be sent in writing with at least 60 days' notice.
    </p>
    <p style="margin:0 0 32px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      Attached is your Tenant Guidebook — property rules, garbage schedule, parking info, and emergency contacts.
    </p>

    ${divider()}
    <p style="margin:0;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Looking forward to working with you.</p>
    <br>
    ${signoff()}
  `);
}

// ── Weekly blog newsletter ────────────────────────────────────────────────────
export function weeklyBlogEmail({
  name,
  blogTitle,
  blogSlug,
  blogExcerpt,
  takeaways,
  whyItMatters,
  category,
}: {
  name: string;
  blogTitle: string;
  blogSlug: string;
  blogExcerpt: string;
  takeaways: string[];
  whyItMatters: string;
  category: string;
}): string {
  const blogUrl = `${BASE_URL}/blog/${blogSlug}`;
  const firstName = name?.split(" ")[0] || "there";

  const takeawayItems = takeaways
    .map(
      (t) =>
        `<li style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};line-height:1.6;">${t}</li>`
    )
    .join("");

  return wrapper(`
    ${heroCard(`Hey ${firstName},`, "New from Prospera this week.")}

    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">
      I just published a new guide that I think is genuinely useful for you as an Ontario landlord:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
      <tr>
        <td style="background:${BG_SUBTLE};border-left:4px solid ${CRIMSON};border-radius:0 12px 12px 0;padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">${category}</p>
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:${TEXT};font-family:${FONT};line-height:1.3;">${blogTitle}</p>
          <p style="margin:0;font-size:16px;color:${MUTED};font-family:${FONT};line-height:1.6;">${blogExcerpt}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">What's covered</p>
    <ul style="margin:0 0 24px;padding:0 0 0 20px;">
      ${takeawayItems}
    </ul>

    ${noteBox(whyItMatters, "Why this matters to you")}

    ${cta("Read the full guide", blogUrl)}

    ${divider()}

    <p style="margin:0 0 8px;font-size:13px;color:${MUTED};font-family:${FONT};line-height:1.6;">
      You're receiving this because you're on the Prospera Properties landlord list. I send one useful guide per week — no fluff, no spam.
    </p>
    <p style="margin:0;font-size:13px;color:${MUTED};font-family:${FONT};">
      Questions? Reply to this email or call (519) 697-1227.
    </p>
    <br>
    ${signoff()}
  `);
}

// ═══════════════════════════════════════════════════════════════
// EMAIL SEQUENCES — HubSpot contact-type nurture sequences
// ═══════════════════════════════════════════════════════════════

// ── POTENTIAL LANDLORD sequence ──────────────────────────────

export function seqLandlord1(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`Hi ${firstName},`, "A quick gift from Prospera Properties.")}
    ${md(`I noticed you connected with us — and I wanted to reach out personally.

Managing a rental property in Ontario is more complicated than most people expect. Tenant laws, maintenance timelines, late rent — it adds up fast.

So I put together something that's helped a lot of landlords I know: a **Lease Protection Addendum** that fills in the gaps Ontario's standard lease leaves open.`)}
    ${noteBox("It covers things like: pet clauses, early termination penalties, property condition documentation, and more. Completely free — no strings attached.", "What's included")}
    ${cta("Download the Addendum (PDF)", `${BASE_URL}/lease-addendum.pdf`)}
    ${divider()}
    ${md(`If you have questions about your rental — or just want a second opinion — reply to this email. I'm happy to help.`)}
    <br>${signoff()}
  `);
}

export function seqLandlord2(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`Hey ${firstName},`, "3 things Ontario landlords often get wrong.")}
    ${md(`Quick follow-up — I wanted to share the three biggest mistakes I see landlords make when managing on their own. Not to alarm you — just because knowing these saves a lot of headaches later.

**1. No documented move-in condition report**
Without one, it's your word against theirs if there's damage at move-out. Ontario tribunals side with tenants when the landlord can't prove pre-existing condition.

**2. Verbal rent increase agreements**
Any rent increase in Ontario must follow the RTA guidelines AND be given in writing with 90 days' notice. Verbal agreements are unenforceable.

**3. DIY lease clauses that contradict the RTA**
If a lease clause contradicts the Residential Tenancies Act, it's void — even if the tenant signed it. You lose the protection you thought you had.`)}
    ${noteBox("These aren't edge cases — they come up all the time at the Landlord and Tenant Board. A solid process prevents all three.", "The fix")}
    ${md(`If you'd like a free review of your current lease or process, I'm happy to take a look. No commitment — just a conversation.`)}
    ${cta("Book a Free 15-Min Call", `${BASE_URL}/contact`)}
    <br>${signoff()}
  `);
}

export function seqLandlord3(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`${firstName}, here's what full management actually looks like.`, "Real results from London, Strathroy & St. Thomas.")}
    ${md(`I want to be straight with you: property management isn't for everyone. Some landlords love being hands-on. That's fine.

But for landlords who want their time back — here's what working with Prospera actually looks like in practice:`)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0 24px;">
      <tr>
        <td style="background:${BG_SUBTLE};border-radius:12px;padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">What we handle</p>
          <ul style="margin:0;padding:0 0 0 18px;">
            <li style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};line-height:1.6;">Tenant screening (credit, reference, employment verification)</li>
            <li style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};line-height:1.6;">Lease drafting &amp; signing</li>
            <li style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};line-height:1.6;">Move-in / move-out inspections with photo documentation</li>
            <li style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};line-height:1.6;">Rent collection &amp; owner transfers</li>
            <li style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};line-height:1.6;">Maintenance coordination</li>
            <li style="margin:0;font-size:16px;color:${TEXT};font-family:${FONT};line-height:1.6;">Monthly owner statements</li>
          </ul>
        </td>
      </tr>
    </table>
    ${md(`You get one monthly report and a direct line to me. That's it. No late-night maintenance calls, no tribunal stress.`)}
    ${cta("Let's Talk About Your Property", `${BASE_URL}/contact`)}
    <br>${signoff()}
  `);
}

export function seqLandlord4(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`Last one, ${firstName}.`, "Checking in one more time.")}
    ${md(`I've sent a few emails over the past few weeks — I don't want to keep showing up in your inbox if it's not useful.

So this is my last check-in. If now isn't the right time to talk about your property, no problem at all.

But if you're at a point where you're thinking about handing off the day-to-day — I'd love to have a 15-minute conversation. No pitch, no pressure. Just an honest look at whether we're a good fit.`)}
    ${cta("Book a Free 15-Min Consultation", `${BASE_URL}/contact`)}
    ${divider()}
    ${md(`Either way — the lease addendum and guides I sent are yours to keep. I hope they've been useful.

If anything changes down the road, you know where to find me.`)}
    <br>${signoff()}
  `);
}

// ── REALTOR sequence ─────────────────────────────────────────

export function seqRealtor1(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`Hi ${firstName},`, "Great connecting with you.")}
    ${md(`I wanted to reach out directly — I think there's a real opportunity for us to work together.

As a property management company in London, Strathroy, and St. Thomas, I work with investors and landlords who are buying income properties. When they close, they need someone to manage the property.

That's where I'd love to be your go-to referral.`)}
    ${noteBox("When you refer an investor client to Prospera, you look good — they get a reliable, professional manager from day one. No awkward handoffs, no dropped balls.", "Why it works")}
    ${md(`I keep things simple for your clients:
- Fast tenant placement (typically 2–3 weeks)
- Clear, transparent monthly reporting
- You stay in the loop if they ever want to sell again

Happy to grab a quick call if you want to learn more about how we work.`)}
    ${cta("Let's Connect", `${BASE_URL}/contact`)}
    <br>${signoff()}
  `);
}

export function seqRealtor2(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`${firstName}, here's what your clients get.`, "When you refer an investor to Prospera.")}
    ${md(`I know you're busy — so I'll keep this short.

Here's exactly what happens when you refer a landlord or investor client to us:`)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0 24px;">
      <tr>
        <td style="background:${BG_SUBTLE};border-radius:12px;padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding:0 0 12px;border-bottom:1px solid ${BORDER};">
                <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT};">Within 48 hours</p>
                <p style="margin:4px 0 0;font-size:13px;color:${MUTED};font-family:${FONT};">I contact your client, schedule a walkthrough, and confirm management scope.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0 12px;border-bottom:1px solid ${BORDER};">
                <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT};">Within 2 weeks</p>
                <p style="margin:4px 0 0;font-size:13px;color:${MUTED};font-family:${FONT};">Property listed, tenant applications screened, best candidate presented for approval.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0 0;">
                <p style="margin:0;font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT};">Ongoing</p>
                <p style="margin:4px 0 0;font-size:13px;color:${MUTED};font-family:${FONT};">Monthly reports, rent collection, maintenance — all handled. Your client hears from us, not you.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${md(`I make sure your clients feel well taken care of — because that reflects on you too.

Have a client in mind? Reply here and let's set something up.`)}
    ${cta("Send a Referral", `${BASE_URL}/contact`)}
    <br>${signoff()}
  `);
}

export function seqRealtor3(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`Staying top of mind, ${firstName}.`, "Just a quick check-in.")}
    ${md(`I know referrals happen when the timing is right — so I just wanted to stay on your radar.

If you have a client who's recently bought an investment property, is thinking about renting out their home, or is frustrated with their current property manager — I'd love to be your first call.

A few things realtors have told me they appreciate:`)}
    ${noteBox("\"Ebin responds fast, keeps my clients happy, and I never have to chase him for updates.\" — that's what I'm going for every time.", "From a local realtor")}
    ${md(`- I always loop you in if the client ever wants to sell again
- Quick response time — your clients won't feel dropped
- Serving London, Strathroy, and St. Thomas

Let's keep in touch.`)}
    ${cta("Connect on LinkedIn or by Phone", `${BASE_URL}/contact`)}
    <br>${signoff()}
  `);
}

// ── CLIENT (active) sequence ─────────────────────────────────

export function seqClient1(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`Welcome to Prospera, ${firstName}.`, "Here's what happens next.")}
    ${md(`I'm really glad to have you on board. Here's a quick overview of what the next few weeks look like so you always know where things stand.

**This week:**
Your property profile is being set up — photos, listing details, and pricing strategy. You'll hear from me if I have any questions.

**Next 1–2 weeks:**
We'll list the property, start receiving applications, and screen candidates. I'll present you with the top applicant(s) for your approval before any lease is signed.

**Once a tenant is placed:**
You'll receive a monthly owner statement by the 5th of every month. Rent is transferred to you after that.`)}
    ${noteBox("My direct line is (519) 697-1227 and email is prosperapropertiess@gmail.com. Don't hesitate to reach out any time.", "How to reach me")}
    ${md(`One thing I ask: if you have concerns about the property or tenants, come to me first. I handle all tenant communication directly — that's what keeps things professional and protects you legally.`)}
    ${cta("View Your Property Details", `${BASE_URL}/owners`)}
    <br>${signoff()}
  `);
}

export function seqClient2(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`${firstName}, your first 30 days explained.`, "What to expect as a new Prospera client.")}
    ${md(`Now that we're underway, I want to set clear expectations for the first 30 days. Knowing what's normal saves a lot of unnecessary worry.

**Tenant placement takes 2–3 weeks on average.**
Don't be alarmed if we don't have a signed lease in the first week — I'd rather wait for the right tenant than rush a placement I'm not confident in.

**You may not hear from me every day.**
That's actually a good sign. I'll reach out proactively if anything needs your attention. No news is good news.

**Your first owner statement arrives by the 5th.**
It'll show rent collected, any maintenance costs deducted, and your net transfer. Clear and detailed.`)}
    ${noteBox("If something feels off or you have a question at any point — just text or email. I respond within a few hours during business days.", "Open door policy")}
    <br>${signoff()}
  `);
}

export function seqClient3(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`A quick check-in, ${firstName}.`, "One week in — how's everything looking?")}
    ${md(`Just wanted to touch base. By now you should have:
- Received confirmation of your property listing
- Heard from me about any initial showing feedback
- Had a chance to review the management agreement details

If any of that's missing or unclear — reply here and I'll sort it out immediately.

**Your owner portal:**
You can log in anytime to see your property's status, maintenance history, and payment records.`)}
    ${cta("Access Owner Portal", `${BASE_URL}/owners`)}
    ${divider()}
    ${md(`A reminder: all maintenance requests go through me. If a tenant ever contacts you directly, just forward them my number: **(519) 697-1227**.

Thanks for trusting me with your property — I take that seriously.`)}
    <br>${signoff()}
  `);
}

export function seqClient4(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`30-day check-in, ${firstName}.`, "How's the first month been?")}
    ${md(`It's been about a month — I wanted to check in and make sure everything is running the way you expected.

By now you should have received your first owner statement. If anything on it looks off or you have questions about a line item, just reply and I'll explain it.

**A few things I'd love your feedback on:**
- Is the communication frequency right for you?
- Is there anything you'd like more visibility into?
- Any concerns about the property or tenant so far?`)}
    ${noteBox("Your feedback directly shapes how I manage your property. If something isn't working for you, I'd rather know now than later.", "Why I'm asking")}
    ${md(`I'm also always looking for ways to improve the property's value or reduce costs over time. If you have thoughts on that, I'd love to hear them.

Thanks again for being a Prospera client — I'm committed to making this work well for you.`)}
    ${cta("Reply or Book a Check-In Call", `${BASE_URL}/contact`)}
    <br>${signoff()}
  `);
}

// ── SELF-MANAGER sequence ─────────────────────────────────────

export function seqSelfManager1(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`Hi ${firstName},`, "Resources for landlords who do it themselves.")}
    ${md(`I know you're managing your own rental — and I have a lot of respect for that. It takes real effort.

Since you're handling things yourself, I figured the most useful thing I can do is give you tools that make it easier. Here are the two most valuable resources I offer for free:`)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0 24px;">
      <tr>
        <td style="padding:0 0 12px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BG_SUBTLE};border-radius:12px;padding:16px 20px;">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT};">📄 Lease Protection Addendum</p>
                <p style="margin:0 0 8px;font-size:13px;color:${MUTED};font-family:${FONT};">Fills in the gaps Ontario's standard lease leaves open — pets, early termination, condition documentation.</p>
                <a href="${BASE_URL}/lease-addendum.pdf" style="font-size:13px;font-weight:700;color:${CRIMSON};text-decoration:none;font-family:${FONT};">Download PDF &rarr;</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BG_SUBTLE};border-radius:12px;padding:16px 20px;">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT};">📊 Free Rent Analysis</p>
                <p style="margin:0 0 8px;font-size:13px;color:${MUTED};font-family:${FONT};">See what comparable units in your area are renting for — so you know if you're priced right.</p>
                <a href="${BASE_URL}/rent-analysis" style="font-size:13px;font-weight:700;color:${CRIMSON};text-decoration:none;font-family:${FONT};">Get Your Analysis &rarr;</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${md(`No catch. These are just useful and I'd rather you have them.`)}
    <br>${signoff()}
  `);
}

export function seqSelfManager2(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`${firstName}, 5 pitfalls to avoid.`, "Common self-managing landlord mistakes in Ontario.")}
    ${md(`Managing your own property puts you directly in the path of Ontario's Residential Tenancies Act — which heavily favours tenants. Here are the five most common mistakes I see at the LTB (Landlord and Tenant Board):

**1. Entering without proper notice**
You need 24 hours written notice for non-emergency entry. Verbal notice doesn't count. Violating this can result in a rent abatement order.

**2. Not documenting everything in writing**
Rent increases, repairs, tenant complaints — if it's not in writing, it didn't happen in the eyes of the LTB.

**3. Accepting partial rent without a written agreement**
Accepting partial rent can waive your right to serve an N4 (non-payment notice) for that period.

**4. Raising rent more than the guideline**
Ontario has an annual rent increase guideline. Exceeding it — even with the tenant's verbal agreement — can be reversed by the LTB.

**5. No formal move-in inspection**
Without a signed move-in condition report, you cannot claim tenant damage at move-out.`)}
    ${noteBox("The Lease Protection Addendum I sent last week addresses most of these. If you haven't downloaded it yet, it's worth a few minutes of your time.", "Quick reminder")}
    <br>${signoff()}
  `);
}

export function seqSelfManager3(name: string): string {
  const firstName = name?.split(" ")[0] || "there";
  return wrapper(`
    ${heroCard(`Still here if you need backup, ${firstName}.`, "No pressure — just wanted to check in.")}
    ${md(`I've sent a couple of emails with resources and tips. I hope they've been useful.

I'm not going to keep filling your inbox — but I did want to say one more thing before I step back:

If you ever hit a situation where you're in over your head — a difficult tenant, an LTB hearing, a property you can't find tenants for — **Prospera is here as backup.**

Some landlords self-manage for years and only call us in a crisis. That's fine. We'll show up when you need us.

Others start self-managing and realize they'd rather hand it off. That's fine too.

There's no wrong answer — just what works for your life.`)}
    ${cta("Talk to Ebin When You're Ready", `${BASE_URL}/contact`)}
    ${divider()}
    ${md(`In the meantime — keep the lease addendum, use the rent analysis when you need it, and feel free to reply any time if you have a question about a tenant situation. I'm happy to give a second opinion, no commitment required.`)}
    <br>${signoff()}
  `);
}

// ── Tenant Placement Process Email ────────────────────────────────────────────
// Sent manually to landlord prospects to show the full placement process.
// Attach: lease-addendum.pdf, sample-screening-report.pdf

export function placementProcessEmail(name?: string): string {
  const firstName = name?.split(" ")[0] || "there";

  const P = `margin:0 0 28px;font-family:${FONT};font-size:19px;line-height:2.1;color:#222222;`;

  function step(num: string, title: string, body: string): string {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 36px;">
        <tr>
          <td style="width:40px;vertical-align:top;padding-top:3px;">
            <div style="width:32px;height:32px;border-radius:99px;background-color:${CRIMSON};text-align:center;line-height:32px;">
              <span style="font-family:${FONT};font-size:12px;font-weight:700;color:${WHITE};">${num}</span>
            </div>
          </td>
          <td style="padding-left:16px;vertical-align:top;">
            <p style="margin:0 0 10px;font-family:${FONT};font-size:13px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:1.5px;">${title}</p>
            <p style="margin:0;font-family:${FONT};font-size:19px;line-height:2.1;color:#222222;">${body}</p>
          </td>
        </tr>
      </table>`;
  }

  function checkList(items: string[]): string {
    const rows = items.map(item => `
      <tr>
        <td style="width:24px;vertical-align:top;padding-top:5px;">
          <span style="font-family:${FONT};font-size:14px;color:${CRIMSON};font-weight:700;">✓</span>
        </td>
        <td style="padding-left:10px;padding-bottom:14px;">
          <span style="font-family:${FONT};font-size:17px;line-height:1.9;color:#222222;">${item}</span>
        </td>
      </tr>`).join("");
    return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0 8px;width:100%;">${rows}</table>`;
  }

  function driveItem(label: string): string {
    return `<tr>
      <td style="padding:13px 20px;border-bottom:1px solid ${BORDER};">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="width:20px;font-size:14px;">📄</td>
            <td style="padding-left:12px;">
              <span style="font-family:${FONT};font-size:16px;color:#222222;line-height:1.6;">${label}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }

  const driveItems = [
    "Signed lease agreement",
    "17-point additional terms and conditions",
    "All applicable N forms",
    "Formal tenant screening report",
    "Full credit report",
    "Government ID verification",
    "Employment verification &amp; pay stubs",
    "Previous landlord reference notes",
    "102-point move-in inspection report",
    "Move-in condition photos",
    "Utilities transfer confirmation",
    "Itemized financial receipt",
  ];

  return wrapper(`
    <p style="margin:0 0 8px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">Tenant Placement</p>
    <h1 style="margin:0 0 24px;font-family:${FONT};font-size:28px;font-weight:700;line-height:1.3;color:${TEXT};">Hi ${firstName} — here's exactly how we fill a unit.</h1>
    <p style="${P}">Not to sell you anything. Just so you know what the process actually looks like when it's done properly.</p>

    ${divider()}

    ${step("1", "The Listing", "We write it. We take the photos. We push it across Facebook Marketplace, Kijiji, our website, and direct outreach channels. We don't just post and wait — we actively track how your unit performs against competing properties in real time.")}

    ${step("2", "Showings", "We handle every message and every inquiry. We schedule all showings and show the unit ourselves. You don't take a single call. After every showing, we document what applicants said — what they liked, what they didn't, what they chose instead. That feedback drives our pricing decisions.")}

    ${step("3", "Pricing", "We don't guess. We research what similar units nearby are actually renting for right now. We set a strategic opening price, test it with the market, and adjust based on real data. You always know why we priced it the way we did.")}

    ${step("4", "Screening", "This is the most important part. And it's where most placements go wrong.")}

    ${noteBox("Every applicant goes through all of the following before anyone is approved.", "For every single applicant")}

    ${checkList([
      "Photo ID verification",
      "Single Key Report (included in the fee)",
      "Last 4 pay stubs",
      "Employment letter",
      "Direct call to employer to confirm",
      "Full credit report",
      "Criminal background check",
      "Direct call to previous landlord",
      "Character references",
      "Emergency contact",
      "Completed rental application",
    ])}

    <p style="${P}">Everything gets compiled into a <strong>formal Tenant Screening Report</strong> — written, assessed, and signed by us. You know exactly who is moving in and why they were approved. See the attached sample.</p>

    ${divider()}

    ${step("5", "The Lease", "We use the Ontario standard lease — and we attach our <strong>17-point Additional Terms and Conditions</strong> on top. It's a document we built specifically to close the gaps the standard lease leaves open.")}

    ${noteBox("We're including the 17-point lease addendum as a free gift with this email. Use it whether you work with us or not.", "Attached — yours to keep")}

    ${step("6", "Move-In Day", "We show up. We conduct a <strong>102-point move-in inspection</strong> — every room, every detail, documented and photographed. We walk through everything with the tenant. We collect first and last month's rent, transfer utilities into their name, hand over the keys, and remove the lockbox.")}

    <p style="${P}">You hear from us when it's done.</p>

    ${step("7", "Your Money", "First month's rent goes straight to you with a clear itemized breakdown of every dollar. Last month's rent and key deposit follow on the first of the following month. Ongoing rent routed directly to you from there.")}

    ${divider()}

    <p style="margin:0 0 16px;font-family:${FONT};font-size:16px;font-weight:700;color:${TEXT};">When it's complete, you get a Google Drive folder with everything:</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid ${BORDER};border-radius:12px;overflow:hidden;margin:0 0 36px;">
      <tr>
        <td style="background-color:${NAVY};padding:12px 20px;">
          <span style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.55);">Your Placement Folder</span>
        </td>
      </tr>
      ${driveItems.map(driveItem).join("")}
    </table>

    <p style="${P}">Hard copies of everything mailed to your address as well.</p>

    ${divider()}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;">
      <tr>
        <td style="background-color:#FDF9F9;border:1px solid #E8CECE;border-radius:14px;padding:32px;">
          <p style="margin:0 0 8px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED};">Worth thinking about</p>
          <p style="margin:0 0 20px;font-family:${FONT};font-size:24px;font-weight:700;line-height:1.35;color:${TEXT};">At $2,500/month, every day your unit sits empty costs you $83.</p>
          <p style="margin:0 0 20px;font-family:${FONT};font-size:19px;line-height:2.1;color:#333333;">Most landlords who handle this themselves take 1–2 months to fill a unit. That's $2,500–$5,000 out of your pocket before they've even found someone. And that doesn't include the time, the stress, or the risk of approving the wrong person.</p>
          <p style="margin:0;font-family:${FONT};font-size:17px;font-weight:700;color:${CRIMSON};">We fill units in 21 days on average.</p>
        </td>
      </tr>
    </table>

    <p style="${P}">You could do this yourself. But now you know exactly what it involves.</p>

    ${cta("Book a Free Consultation", `${BASE_URL}/contact`)}

    ${divider()}
    ${signoff()}
  `);
}

// ── MAINTENANCE: ACKNOWLEDGEMENT EMAIL ──────────────────────

interface MaintenanceAckParams {
  tenantName: string;
  propertyAddress: string;
  category: string;
  description: string;
  photoUrls?: string[];
}

export function maintenanceAckTenantEmail(p: MaintenanceAckParams): string {
  const P = `margin:0 0 28px;font-size:17px;line-height:2.0;color:${TEXT};font-family:${FONT};`;

  const photosHtml = p.photoUrls && p.photoUrls.length > 0
    ? `<p style="${P}"><strong>Photos attached:</strong> ${p.photoUrls.length} image${p.photoUrls.length > 1 ? "s" : ""}</p>`
    : "";

  return wrapper(`
    ${heroCard("We got your request.", `${p.propertyAddress}`)}

    <p style="${P}">Hi ${p.tenantName.split(" ")[0]},</p>

    <p style="${P}">Your maintenance request has been received. Here's what you reported:</p>

    ${noteBox(`<strong>${p.category}</strong><br/>${p.description}`, "Issue Reported")}

    ${photosHtml}

    <p style="${P}"><strong>What happens next:</strong></p>
    <ul style="margin:16px 0 28px;padding-left:24px;">
      <li style="margin:0 0 12px;font-size:17px;line-height:1.9;color:${TEXT};font-family:${FONT};">Ebin reviews this within a few hours</li>
      <li style="margin:0 0 12px;font-size:17px;line-height:1.9;color:${TEXT};font-family:${FONT};">You'll get a follow-up email with possible solutions you can try</li>
      <li style="margin:0 0 12px;font-size:17px;line-height:1.9;color:${TEXT};font-family:${FONT};">If a technician is needed, we'll coordinate everything — you don't have to find anyone</li>
    </ul>

    <p style="${P}">If this is <strong>urgent</strong> (flooding, gas smell, no heat in winter), call Ebin directly at <a href="tel:5196971227" style="color:${CRIMSON};text-decoration:none;font-weight:700;">(519) 697-1227</a>.</p>

    ${divider()}
    ${signoff()}
  `);
}

export function maintenanceAckAdminEmail(p: MaintenanceAckParams & { tenantEmail?: string; ownerName?: string }): string {
  const P = `margin:0 0 28px;font-size:17px;line-height:2.0;color:${TEXT};font-family:${FONT};`;

  const photosHtml = p.photoUrls && p.photoUrls.length > 0
    ? p.photoUrls.map(u => `<p style="margin:0 0 8px;"><a href="${u}" style="color:${CRIMSON};font-size:15px;font-family:${FONT};">View photo</a></p>`).join("")
    : "<p style='font-size:15px;color:" + MUTED + ";font-family:" + FONT + ";'>No photos attached</p>";

  return wrapper(`
    ${heroCard("New Maintenance Request", `${p.tenantName} · ${p.propertyAddress}`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background-color:${BG_SUBTLE};border-radius:12px;padding:24px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">Details</p>
          <p style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};"><strong>Tenant:</strong> ${p.tenantName}${p.tenantEmail ? ` (${p.tenantEmail})` : ""}</p>
          <p style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};"><strong>Property:</strong> ${p.propertyAddress}</p>
          ${p.ownerName ? `<p style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};"><strong>Owner:</strong> ${p.ownerName}</p>` : ""}
          <p style="margin:0 0 8px;font-size:16px;color:${TEXT};font-family:${FONT};"><strong>Category:</strong> ${p.category}</p>
          <p style="margin:0;font-size:16px;color:${TEXT};font-family:${FONT};"><strong>Issue:</strong> ${p.description}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">Photos</p>
    ${photosHtml}

    ${divider()}
    <p style="${P}">AI analysis email will be sent to the tenant shortly.</p>
  `);
}

// ── MAINTENANCE: AI ANALYSIS EMAIL ──────────────────────────

interface MaintenanceAnalysisParams {
  tenantName: string;
  propertyAddress: string;
  category: string;
  description: string;
  analysis: string;
}

export function maintenanceAnalysisEmail(p: MaintenanceAnalysisParams): string {
  const P = `margin:0 0 28px;font-size:17px;line-height:2.0;color:${TEXT};font-family:${FONT};`;

  return wrapper(`
    ${heroCard("Here's what we think is going on.", `${p.category} · ${p.propertyAddress}`)}

    <p style="${P}">Hi ${p.tenantName.split(" ")[0]},</p>

    <p style="${P}">We've looked into your maintenance request and put together some information that might help.</p>

    ${md(p.analysis)}

    ${divider()}

    <p style="${P}">If none of this resolves the issue, <strong>you don't need to do anything else</strong>. Ebin is already aware and will coordinate next steps.</p>

    <p style="${P}">For anything urgent, call <a href="tel:5196971227" style="color:${CRIMSON};text-decoration:none;font-weight:700;">(519) 697-1227</a>.</p>

    ${divider()}
    ${signoff()}
  `);
}

// ── Placement Welcome Email (with Market Comps) ──────────────────

export function placementWelcomeEmail(data: {
  ownerName: string;
  propertyAddress: string;
  city: string;
  bedrooms: number;
  dashboardUrl: string;
  rentLow: number;
  rentMarket: number;
  rentPremium: number;
  comparables?: string[];
}): string {
  const firstName = data.ownerName.split(" ")[0];
  const reportUrl = data.dashboardUrl.replace("/onboard/", "/market-comp/");
  const F = "Arial, Helvetica, sans-serif";
  const N = "#1F2F3A";
  const T = "#1a1a1a";
  const M = "#5a6068";
  const B = "#e8e4df";
  const C = "#8B2030";

  return wrapper(`
    <p style="margin:0 0 4px;font-family:${F};font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${M};">Prospera Properties</p>
    <p style="margin:0 0 4px;font-family:${F};font-size:26px;font-weight:700;color:${N};line-height:1.2;">Hi ${firstName}.</p>
    <p style="margin:0 0 28px;font-family:${F};font-size:16px;color:${M};line-height:1.6;">Your rental analysis for ${data.propertyAddress} is ready.</p>

    <p style="margin:0 0 28px;font-size:18px;color:${T};font-family:${F};line-height:1.9;">Good talking today. I put together a full market analysis for your property — comparable listings, recommended pricing, and an interactive tool that shows exactly how pricing affects your vacancy and annual income.</p>

    <!-- Quick snapshot -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
      <tr><td style="background:${N};border-radius:12px;padding:24px;">
        <p style="margin:0 0 8px;font-family:${F};font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(250,248,245,0.45);">${data.bedrooms} Bedroom in ${data.city} — Market Range</p>
        <p style="margin:0;font-family:${F};font-size:32px;font-weight:800;color:#FAF8F5;">$${data.rentLow.toLocaleString()} — $${data.rentPremium.toLocaleString()}<span style="font-size:16px;font-weight:400;color:rgba(250,248,245,0.5);"> /mo</span></p>
        <p style="margin:8px 0 0;font-family:${F};font-size:14px;color:rgba(250,248,245,0.6);">Recommended: <strong style="color:#FAF8F5;">$${data.rentMarket.toLocaleString()}/mo</strong></p>
      </td></tr>
    </table>

    <p style="margin:0 0 28px;font-size:17px;color:${T};font-family:${F};line-height:1.9;">The full report includes ${data.comparables?.length ? `${data.comparables.length} comparable properties, ` : ""}a pricing simulator, neighbourhood analysis, and our honest recommendation on where to price.</p>

    <!-- Big CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 8px;"><tr><td align="center"><a href="${reportUrl}" style="display:inline-block;background:${C};color:#fff;font-family:${F};font-size:18px;font-weight:700;text-decoration:none;padding:18px 48px;border-radius:12px;">View Your Market Report</a></td></tr></table>
    <p style="margin:0 0 20px;text-align:center;font-family:${F};font-size:13px;color:${M};">Takes 3 minutes to review. Includes an interactive pricing tool.</p>

    <!-- Secondary CTA — Placement Agreement -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;"><tr><td align="center"><a href="${data.dashboardUrl}/agreement" style="display:inline-block;background:#ffffff;color:${N};font-family:${F};font-size:16px;font-weight:700;text-decoration:none;padding:15px 40px;border-radius:12px;border:2px solid ${N};">Sign the Placement Agreement</a></td></tr></table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 6px;"><tr><td style="border-bottom:1px solid ${B};padding:0;height:1px;"></td></tr></table>
    <div style="height:24px;"></div>

    <p style="margin:0 0 28px;font-size:16px;color:${T};font-family:${F};line-height:1.9;">Once you've reviewed the numbers and you're comfortable with pricing, you can sign the placement agreement directly from the report. The whole thing takes 2 minutes.</p>

    <p style="margin:0;font-size:15px;color:${T};font-family:${F};line-height:1.9;">Questions? Reply to this email or call me. I'm happy to walk through every number in detail.<br><br>&#8212; Ebin &nbsp;&middot;&nbsp; (519) 697-1227</p>
  `);
}

// ── Placement Agreement Signed ────────────────────────────────

export function placementAgreementSignedEmail(
  ownerName: string,
  propertyAddress: string,
  signedAt: string,
): string {
  const firstName = ownerName.split(" ")[0];
  const signedDate = new Date(signedAt).toLocaleDateString("en-CA", {
    year: "numeric", month: "long", day: "numeric",
  });

  function stepRow(icon: string, heading: string, detail: string): string {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 4px;">
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid ${BORDER};">
            <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
              <tr>
                <td style="width:32px;vertical-align:top;font-size:18px;padding-top:2px;">${icon}</td>
                <td style="padding-left:12px;font-size:16px;color:${TEXT};font-family:${FONT};line-height:1.75;">
                  <strong style="color:${NAVY};">${heading}</strong><br/>
                  <span style="color:${MUTED};font-size:15px;">${detail}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
  }

  return wrapper(`
    ${heroCard(`You're all set, ${firstName}.`, propertyAddress)}

    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Your placement agreement is signed and on file. We're already on it — here's exactly what happens from here.</p>

    ${stepRow("✅", `Agreement signed — ${signedDate}`, "Locked in. Your file is open.")}
    ${stepRow("📊", "Rental market analysis", "We confirm your pricing against current comparable listings before anything goes live.")}
    ${stepRow("📋", "Your listing goes live within the hour", "Posted on our website, Kijiji, Facebook Marketplace, and everywhere tenants are looking.")}
    ${stepRow("🪧", "Lawn sign up within 12–24 hours", "Placed at your property to catch local interest right away.")}
    ${stepRow("📞", "Every inquiry gets a same-day response", "We pre-screen every caller before booking a showing — no wasted viewings.")}
    ${stepRow("🔎", "Full background check on every applicant", "Employment, income, credit, references, and identity — before we bring anyone to you.")}
    ${stepRow("📬", "Weekly updates from us", "You'll hear from us at least once a week throughout the process, even when things are quiet.")}
    ${stepRow("✅", "You choose the tenant", "We bring you the top applicants with our recommendation. The final call is always yours.")}

    <div style="height:28px;"></div>

    ${noteBox("You don't need to do a single thing from here. We handle every inquiry, every showing, every application — and we keep you posted the whole way. <strong>Sit back and relax.</strong> Finding the right tenant is our job now.", "What this means for you")}

    ${divider()}

    <p style="margin:0 0 28px;font-size:17px;color:${TEXT};font-family:${FONT};line-height:2.0;">Questions at any point? Just reply to this email or call me directly. I'm easy to reach.</p>

    ${signoff()}
  `);
}
