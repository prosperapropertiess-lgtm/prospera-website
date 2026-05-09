// ─────────────────────────────────────────────────────────────
// Prospera Properties — Email Templates
// ─────────────────────────────────────────────────────────────

const BASE_URL = "https://www.prosperaproperties.co";

function wrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Prospera Properties</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-body { padding: 28px 24px !important; }
      .email-header { padding: 24px !important; }
      .email-footer { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:Georgia,serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0EB;padding:24px 0;">
    <tr>
      <td align="center" style="padding:0 16px;">
        <table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FAF8F5;">

          <!-- Header -->
          <tr>
            <td class="email-header" style="background-color:#1F2F3A;padding:28px 40px;">
              <p style="margin:0;font-size:20px;font-weight:300;color:#FAF8F5;letter-spacing:1px;">Prospera Properties</p>
              <p style="margin:6px 0 0;font-size:13px;color:#8B2030;letter-spacing:1px;">London · St. Thomas · Strathroy</p>
            </td>
          </tr>

          <!-- Gold bar -->
          <tr><td style="height:3px;background-color:#8B2030;"></td></tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="background-color:#1F2F3A;padding:24px 40px;">
              <p style="margin:0 0 6px;font-size:14px;color:rgba(250,248,245,0.6);">Prospera Properties · <a href="mailto:hello@prosperaproperties.co" style="color:#8B2030;text-decoration:none;">hello@prosperaproperties.co</a></p>
              <p style="margin:0;font-size:13px;color:rgba(250,248,245,0.35);"><a href="${BASE_URL}" style="color:rgba(250,248,245,0.35);text-decoration:none;">prosperaproperties.co</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function bodyText(html: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#2C2C2C;">${html}</td></tr>
  </table>`;
}

function btn(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td style="background-color:#1F2F3A;padding:14px 28px;">
        <a href="${url}" style="color:#FAF8F5;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr><td style="height:1px;background-color:#E8E4DF;"></td></tr>
  </table>`;
}

function tipBox(title: string, body: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="background-color:#F5F0EB;border-left:3px solid #8B2030;padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:11px;color:#8B2030;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${title}</p>
        <p style="margin:0;font-size:14px;color:#2C2C2C;line-height:1.6;">${body}</p>
      </td>
    </tr>
  </table>`;
}

// ─── LANDLORD WELCOME ────────────────────────────────────────

export function landlordWelcomeEmail(name: string): string {
  const PDF_URL = `${BASE_URL}/lease-addendum.pdf`;

  const content = bodyText(`
    <p style="margin:0 0 28px;font-size:18px;color:#2C2C2C;line-height:1.5;">Hey ${name || "there"},</p>

    <p style="margin:0 0 28px;font-size:18px;color:#2C2C2C;line-height:1.7;">Here's your free Lease Protection Addendum — it fills in the gaps Ontario's standard lease leaves open.</p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
      <tr>
        <td style="background-color:#1F2F3A;padding:18px 36px;border-radius:2px;">
          <a href="${PDF_URL}" style="color:#FAF8F5;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.5px;">Download the Addendum (PDF) →</a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
      <tr><td style="height:1px;background-color:#E8E4DF;"></td></tr>
    </table>

    <p style="margin:0 0 24px;font-size:18px;color:#2C2C2C;line-height:1.7;">I'm Ebin. I run Prospera Properties — full property management across London, St. Thomas, and Strathroy.</p>

    <p style="margin:0 0 32px;font-size:18px;color:#2C2C2C;line-height:1.7;">If you ever want someone to handle your rental — screening, rent, maintenance, all of it — that's what we do.</p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
      <tr>
        <td style="background-color:#8B2030;padding:18px 36px;border-radius:2px;">
          <a href="${BASE_URL}/landlords" style="color:#FAF8F5;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.5px;">See How It Works →</a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td style="height:1px;background-color:#E8E4DF;"></td></tr>
    </table>

    <p style="margin:0;font-size:17px;color:#2C2C2C;line-height:1.7;">Reply to this email anytime — I read every one.<br/><br/>— Ebin<br/><span style="color:#9B9B9B;font-size:15px;">(519) 697-1227</span></p>
  `);
  return wrapper(content);
}

// ─── TENANT WELCOME ──────────────────────────────────────────

export function tenantWelcomeEmail(name: string, city?: string): string {
  const content = bodyText(`
    <p style="margin:0 0 20px;">Hey ${name || "there"},</p>

    <p style="margin:0 0 16px;">You're on the list — and we'll be in touch the moment something opens up${city ? ` in ${city}` : ""}.</p>

    <p style="margin:0 0 16px;">Renting shouldn't be stressful. Maintenance that actually gets fixed. A landlord who picks up the phone. A place that's been properly looked after. That's what we're about.</p>

    ${divider()}

    <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">While you wait</p>

    <p style="margin:12px 0 16px;">Check our listings page — we add new properties regularly:</p>

    ${btn("Browse Available Rentals", `${BASE_URL}/listings`)}

    ${divider()}

    <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Know your rights</p>

    <p style="margin:12px 0 16px;">Ontario tenants have strong protections under the Residential Tenancies Act. We always operate within them — and we think you should know them too. Here's a quick guide:</p>

    ${tipBox("Your rights as an Ontario tenant", "Rent can only be increased once per year with 90 days written notice. Your landlord can only enter with 24 hours notice (except emergencies). You cannot be evicted without a proper LTB hearing.")}

    ${divider()}

    <p style="margin:0 0 8px;">Questions? Just reply to this email — a real person will get back to you.</p>

    <p style="margin:0;">— Ebin &amp; the Prospera team<br/><span style="font-size:13px;color:#9B9B9B;">(519) 697-1227</span></p>
  `);
  return wrapper(content);
}

// ─── CONTACT CONFIRMATION ────────────────────────────────────

export function contactConfirmationEmail(name: string, type?: string): string {
  const isLandlord = type === "landlord";
  const isTenant = type === "tenant";

  const content = bodyText(`
    <p style="margin:0 0 20px;">Hey ${name || "there"},</p>

    <p style="margin:0 0 16px;">Got your message — thanks for reaching out.</p>

    <p style="margin:0 0 16px;">I'll personally be in touch within one business day. If it's urgent, call me directly at <a href="tel:+15196971227" style="color:#7B1C1C;">(519) 697-1227</a>.</p>

    ${divider()}

    ${isLandlord ? `
    <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">While you wait</p>
    <p style="margin:12px 0 16px;">Take a look at our free landlord resources — lease templates, screening checklists, eviction guides:</p>
    ${btn("Browse Free Resources", `${BASE_URL}/resources`)}
    ` : isTenant ? `
    <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Browse our listings</p>
    <p style="margin:12px 0 16px;">Check out what's currently available — we add new properties regularly:</p>
    ${btn("View Available Rentals", `${BASE_URL}/listings`)}
    ` : `
    <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Learn more</p>
    <p style="margin:12px 0 16px;">Find out how Prospera Properties works for landlords and tenants in London, St. Thomas, and Strathroy:</p>
    ${btn("About Prospera Properties", `${BASE_URL}/about`)}
    `}

    ${divider()}

    <p style="margin:0;">— Ebin<br/><span style="font-size:13px;color:#9B9B9B;">Founder, Prospera Properties</span></p>
  `);
  return wrapper(content);
}

// ─── RENT ANALYSIS — LINK EMAIL ─────────────────────────────

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

  const content = bodyText(`
    <p style="margin:0 0 20px;">Hey ${name || "there"},</p>

    <p style="margin:0 0 16px;">Your personalized rent analysis link is ready. Fill out the short form and we'll send back a detailed report on your ${bedsLabel}rental${cityLabel} — including where your rent sits relative to the current market.</p>

    <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="background-color:#8B2030;padding:18px 36px;border-radius:2px;">
          <a href="${link}" style="color:#FAF8F5;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.5px;">Get Your Rent Analysis →</a>
        </td>
      </tr>
    </table>

    ${tipBox("Note", "This link is personal to you and expires in 7 days. The form takes about 2 minutes to fill out.")}

    ${divider()}

    <p style="margin:0 0 16px;">Once you submit, Claude (our AI analyst) will review your property details and market data — then send you back a written analysis within minutes.</p>

    <p style="margin:0;">Questions? Just reply to this email.<br/>— Ebin, Prospera Properties<br/><span style="font-size:13px;color:#9B9B9B;">(519) 697-1227</span></p>
  `);
  return wrapper(content);
}

// ─── RENT ANALYSIS — REPORT EMAIL ───────────────────────────

export function rentAnalysisReportEmail({
  name,
  city,
  bedrooms,
  unitType,
  rentAmount,
  claudeAnalysis,
}: {
  name?: string | null;
  city: string;
  bedrooms?: number | null;
  unitType?: string | null;
  rentAmount: number;
  claudeAnalysis: string;
}): string {
  const bedsLabel = bedrooms ? `${bedrooms} bed` : "rental";
  const typeLabel = unitType || "unit";

  const content = bodyText(`
    <p style="margin:0 0 20px;">Hey ${name || "there"},</p>

    <p style="margin:0 0 20px;">Here's the rent analysis for your property in ${city}. We've looked at your unit's details alongside current market data across Southwest Ontario.</p>

    <!-- Property summary card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;background-color:#F5F0EB;border-left:3px solid #8B2030;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:11px;color:#8B2030;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Property</p>
          <p style="margin:0;font-size:15px;color:#2C2C2C;">${bedsLabel} ${typeLabel} · ${city} · $${rentAmount.toLocaleString()}/mo</p>
        </td>
      </tr>
    </table>

    <!-- Analysis -->
    <p style="margin:0 0 12px;font-size:11px;color:#8B2030;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Analysis</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#2C2C2C;white-space:pre-line;">${claudeAnalysis.replace(/\n\n/g, "</p><p style=\"margin:0 0 16px;font-size:15px;line-height:1.75;color:#2C2C2C;\">")}</p>

    ${divider()}

    <p style="margin:0 0 16px;font-size:14px;color:#2C2C2C;">You're now on our monthly market update list — you'll get a short email once a month showing how rents are moving in ${city}. You can unsubscribe anytime by replying "unsubscribe".</p>

    <p style="margin:0 0 16px;font-size:14px;color:#2C2C2C;">Want someone to handle the whole thing — screening, rent, maintenance — so you never have to think about it? That's what we do.</p>

    ${btn("See How Prospera Works", `${BASE_URL}/landlords`)}

    ${divider()}

    <p style="margin:0;font-size:13px;color:#9B9B9B;">— Ebin Jaison<br/>Founder, Prospera Properties<br/>(519) 697-1227</p>
  `);
  return wrapper(content);
}

// ─── MONTHLY RENT TRENDS EMAIL ───────────────────────────────

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
  month: string; // e.g. "May 2026"
}): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
  const cityPageUrl = `${BASE_URL}/areas/${citySlug}`;

  const trendLabel = (t: string | null) => {
    if (t === "up") return "↑ Rising";
    if (t === "down") return "↓ Falling";
    if (t === "flat") return "→ Stable";
    return "—";
  };

  const rowsHtml = data
    .map(
      (row) => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #E8E4DF;font-size:14px;color:#2C2C2C;font-weight:500;">${row.bedrooms} Bedroom</td>
      <td style="padding:14px 16px;border-bottom:1px solid #E8E4DF;font-size:16px;color:#1F2F3A;font-weight:600;text-align:right;">${row.median_rent ? `$${row.median_rent.toLocaleString()}/mo` : "—"}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #E8E4DF;font-size:13px;color:#8B2030;text-align:right;">${trendLabel(row.trend_direction)}</td>
    </tr>
    ${row.market_narrative ? `<tr><td colspan="3" style="padding:4px 16px 14px;border-bottom:1px solid #E8E4DF;font-size:13px;color:#5A5A5A;line-height:1.6;">${row.market_narrative}</td></tr>` : ""}
  `
    )
    .join("");

  const content = bodyText(`
    <p style="margin:0 0 6px;font-size:11px;color:#8B2030;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${city} Rental Market</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:300;color:#1F2F3A;">${month} Update</p>

    <p style="margin:0 0 20px;font-size:14px;color:#2C2C2C;">Hey ${name || "there"}, here's how rents are moving in ${city} this month.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #E8E4DF;">
      <thead>
        <tr style="background-color:#1F2F3A;">
          <th style="padding:12px 16px;text-align:left;font-size:11px;letter-spacing:1px;color:#8B2030;font-weight:600;text-transform:uppercase;">Unit</th>
          <th style="padding:12px 16px;text-align:right;font-size:11px;letter-spacing:1px;color:#8B2030;font-weight:600;text-transform:uppercase;">Median Rent</th>
          <th style="padding:12px 16px;text-align:right;font-size:11px;letter-spacing:1px;color:#8B2030;font-weight:600;text-transform:uppercase;">Trend</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    ${btn("See Full Market Data", cityPageUrl)}

    ${divider()}

    <p style="margin:0 0 8px;font-size:13px;color:#9B9B9B;">Data from landlord-reported rents and Prospera's market research across ${city}.</p>
    <p style="margin:0;font-size:13px;color:#9B9B9B;">To unsubscribe from these monthly updates, reply with "unsubscribe".</p>
  `);
  return wrapper(content);
}

// ─── INTERNAL — RENT SUBMISSION NOTIFICATION ─────────────────

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
      <td style="padding:6px 12px 6px 0;font-size:13px;color:#999999;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:#1F2F3A;font-weight:500;">${String(value)}</td>
    </tr>`;
  }

  function section(title: string, rows: string): string {
    const content = rows.replace(/\n/g, "").trim();
    if (!content) return "";
    return `
      <p style="margin:20px 0 8px;font-size:11px;color:#8B2030;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${title}</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:4px;">${content}</table>
    `;
  }

  const appliances = [
    s.appliance_fridge && "Fridge",
    s.appliance_stove && "Stove",
    s.appliance_dishwasher && "Dishwasher",
    s.appliance_washer && "Washer",
    s.appliance_dryer && "Dryer",
  ].filter(Boolean).join(", ") || "None";

  const content = `
    <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#1F2F3A;">New Rent Analysis Submission</p>
    <p style="margin:0 0 24px;font-size:13px;color:#999999;">Submission ID: ${submissionId}</p>

    ${section("Landlord", `
      ${row("Name", landlordName || "Not given")}
      ${row("Email", landlordEmail)}
      ${row("Phone", landlordPhone || "Not given")}
    `)}

    ${section("Property", `
      ${row("City", `${s.city}${s.city_zone ? ` — ${String(s.city_zone).replace(/_/g, " ")}` : ""}`)}
      ${row("Address", s.address)}
      ${row("Type", s.property_type)}
      ${row("Bedrooms", s.bedrooms)}
      ${row("Bathrooms", `${s.bathrooms ?? "?"}bd + ${s.half_bathrooms ?? 0} half`)}
      ${row("Sqft", s.sqft ? `${s.sqft} sqft` : null)}
      ${row("Floor", s.floor)}
      ${row("Era", s.building_era)}
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
      ${row("Heat", s.heat_type)}
      ${row("AC", s.ac_type ? String(s.ac_type).replace(/_/g, " ") : null)}
      ${row("Appliances", appliances)}
      ${row("Laundry", s.laundry)}
      ${row("Utilities included", s.utilities_included)}
      ${row("Pets", s.pet_friendly === true ? "Yes" : s.pet_friendly === false ? "No" : null)}
      ${row("Amenities", s.amenities)}
      ${row("Condo fees incl.", s.condo_fees_included === true ? "Yes" : s.condo_fees_included === false ? "No" : null)}
    `)}

    ${section("Condition & Access", `
      ${row("Newly renovated", s.newly_renovated === true ? "Yes" : s.newly_renovated === false ? "No" : null)}
      ${row("Upkeep rating", s.upkeep_rating ? `${s.upkeep_rating}/10` : null)}
      ${row("Transit", s.transit_distance_min ? `${s.transit_distance_min} min walk` : null)}
    `)}

    ${section("Rent Details", `
      ${row("Rent amount", `$${Number(s.rent_amount).toLocaleString()}/mo (${s.is_asking_rent ? "asking" : "current tenant"})`)}
      ${row("Previous rent", s.previous_rent ? `$${Number(s.previous_rent).toLocaleString()}/mo` : null)}
      ${row("Is occupied", s.is_occupied === true ? "Yes" : s.is_occupied === false ? "No" : null)}
      ${row("Last increase", s.last_rent_increase)}
      ${row("Neighbouring rent", s.neighbouring_rent ? `$${Number(s.neighbouring_rent).toLocaleString()}/mo` : null)}
      ${row("Lease preference", s.lease_preference ? String(s.lease_preference).replace(/_/g, " ") : null)}
      ${row("Available date", s.available_date)}
    `)}

    ${section("Context", `
      ${row("Landlord style", s.landlord_style ? String(s.landlord_style).replace(/_/g, " ") : null)}
      ${row("Special features", s.special_features)}
      ${row("Remarks", s.remarks)}
    `)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr><td style="height:1px;background-color:#E8E4DF;"></td></tr></table>

    <p style="margin:20px 0 8px;font-size:11px;color:#8B2030;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Analysis Sent to Landlord</p>
    <p style="margin:0;font-size:14px;line-height:1.75;color:#2C2C2C;white-space:pre-line;">${claudeAnalysis}</p>
  `;

  return wrapper(content);
}

// ─── RESOURCE DOWNLOAD EMAILS ────────────────────────────────

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
    intro: "Good news: Ontario's standard lease form is mandatory for most residential rentals — so both sides know exactly what they're getting into. Bad news: people mess it up all the time. Here's how to do it right.",
    steps: [
      "<strong>Don't skip Section D (Additional Terms).</strong> This is where you add things like pet rules, parking specifics, utility responsibilities. Vague here = arguments later.",
      "<strong>Both parties sign every page.</strong> Sounds obvious. People skip this. Don't.",
      "<strong>Tenant gets a copy within 21 days.</strong> Ontario law requires it. Keep a signed copy for yourself too — somewhere you can actually find it.",
      "<strong>The lease can't override the RTA.</strong> Doesn't matter what you write in the lease — if it contradicts Ontario's Residential Tenancies Act, the Act wins.",
      "<strong>Month-to-month after the term ends is normal.</strong> When a 12-month lease expires, it automatically becomes month-to-month. That's not a problem — it's how it works.",
    ],
    tip: { title: "Heads up", body: "Using a lease that's NOT the Ontario standard form (for tenancies that started after April 30, 2018) gives the tenant the right to withhold one month's rent until you provide the correct form. Use the right form." },
    cta: { text: "Get a free lease review", url: `${BASE_URL}/contact` },
  },
  "lease-addendum": {
    subject: "Your Lease Addendum — what it covers and why it matters",
    headline: "The standard lease has gaps. This fills them.",
    intro: "Ontario's standard lease is a starting point — not a complete picture. Our addendum plugs the holes landlords typically get burned by. Here's what it covers and why each piece is there.",
    steps: [
      "<strong>Utilities.</strong> The addendum makes it crystal clear who pays what. 'Tenant pays hydro' in the addendum is much harder to dispute than a verbal agreement.",
      "<strong>Maintenance obligations.</strong> Tenants are responsible for minor maintenance (changing lightbulbs, keeping the unit clean). This addendum spells it out so there's no 'I didn't know.'",
      "<strong>Subletting and Airbnb.</strong> Ontario law actually gives tenants subletting rights — but you can set conditions. The addendum does this properly so you're not caught off guard.",
      "<strong>Parking and storage.</strong> If it's included, write down exactly what's included. 'One spot in the rear lot' beats 'parking included' every single time.",
      "<strong>Attach it to the standard lease.</strong> The addendum only works if it's signed at the same time as the main lease and referenced within it. Don't hand it over separately.",
    ],
    tip: { title: "Pro tip", body: "Walk through the addendum with the tenant before signing — not after. Surprises at signing kill deals and start tenancies on bad footing." },
    cta: { text: "Have questions about your lease?", url: `${BASE_URL}/contact` },
  },
  "tenant-screening-checklist": {
    subject: "Your Tenant Screening Checklist — how to use it",
    headline: "One bad tenant costs more than a year of management fees.",
    intro: "We've placed 25+ tenants. All paying rent. No LTB cases. The checklist you just downloaded is the exact process we use. Here's how to work through it.",
    steps: [
      "<strong>Pre-screen on the phone first.</strong> Before you show the unit, have a 5-minute call. Ask about move-in date, number of occupants, pets, why they're moving. You'll filter 30% of bad fits right there.",
      "<strong>Income should be 3x the rent.</strong> That's the rule of thumb. $2,000/month rent = applicant needs $6,000/month gross income. Verify with pay stubs or employment letters — not just their word.",
      "<strong>Always pull credit.</strong> Equifax and TransUnion both offer landlord credit checks. Don't skip this step. A 580 credit score with a reasonable explanation is very different from a 580 with collections.",
      "<strong>Call previous landlords — not just the most recent one.</strong> The current landlord might give a glowing reference just to get rid of a problem tenant. Call the one before.",
      "<strong>Trust your gut, but document your decision.</strong> If you're declining someone, have a documented reason based on the checklist criteria. Protects you under Ontario's Human Rights Code.",
    ],
    tip: { title: "Important", body: "You cannot decline a tenant based on age, race, family status, source of income, or any other protected ground under the Ontario Human Rights Code. Decline based on financials, references, and credit — always." },
    cta: { text: "Want us to handle screening for you?", url: `${BASE_URL}/landlords` },
  },
  "rent-increase-n1": {
    subject: "Your N1 Guide — how to raise rent without making it a whole thing",
    headline: "Rent increases in Ontario: simple when you follow the rules.",
    intro: "Ontario has strict rules around rent increases — but they're not hard to follow if you know them. Here's how to use the N1 correctly.",
    steps: [
      "<strong>90 days written notice. No exceptions.</strong> You must give the tenant the N1 form at least 90 days before the increase takes effect. Mail it, hand-deliver it, or send it through your tenant portal. Keep proof.",
      "<strong>Once per year only.</strong> You can only raise rent once every 12 months. Even if you think the market supports more.",
      "<strong>Check the guideline first.</strong> Ontario sets an annual rent increase guideline each year. You can raise rent up to that percentage without LTB approval. Going above it requires an application.",
      "<strong>Fill in the form completely.</strong> Current rent, new rent, effective date. Don't leave blanks. Incomplete N1 forms can be challenged.",
      "<strong>New tenants are exempt.</strong> The rent increase guideline only applies to sitting tenants. When a unit turns over, you can set any rent you want for the new tenancy.",
    ],
    tip: { title: "2026 guideline", body: "Ontario's 2026 rent increase guideline is 2.5%. Anything at or below that — with proper 90-day notice — is straightforward. Above that requires an Above-Guideline Increase (AGI) application to the LTB." },
    cta: { text: "Questions about your specific situation?", url: `${BASE_URL}/contact` },
  },
  "eviction-notices": {
    subject: "Your Eviction Notice Templates — N4, N5, N12 explained plainly",
    headline: "Evictions are stressful. Using the wrong form makes them worse.",
    intro: "The three forms in your download cover the most common eviction scenarios in Ontario. Here's when to use each one — and what to do after you serve it.",
    steps: [
      "<strong>N4 — Non-payment of rent.</strong> Use this when rent is late. You can serve it the day after rent was due. The tenant has 14 days to pay or move out. If they pay, the N4 is void — you cannot proceed. If they don't, file with the LTB.",
      "<strong>N5 — Interference, damage, or overcrowding.</strong> Use this for noise complaints, property damage, illegal activity, or too many people living in the unit. Tenant gets 20 days to fix the problem on the first N5. Second N5 within 6 months — no chance to fix it.",
      "<strong>N12 — Landlord or family member moving in.</strong> You need this unit for yourself, your spouse, a child, or a parent. Tenant gets 60 days notice and one month's rent compensation. This is heavily scrutinized at the LTB — be sure this is genuine.",
      "<strong>Serve it properly.</strong> Hand-deliver, registered mail, or through the tenant portal. Keep proof. A notice that can't be proven served is a wasted notice.",
      "<strong>Filing with the LTB is the next step.</strong> If the issue isn't resolved after the notice period, you file an application with the Landlord and Tenant Board. Don't skip straight to changing locks — that's illegal in Ontario.",
    ],
    tip: { title: "Heads up", body: "Changing locks, removing belongings, or shutting off utilities to force a tenant out is illegal in Ontario — regardless of how behind they are on rent. Always go through the LTB process." },
    cta: { text: "Need help with an LTB filing?", url: `${BASE_URL}/contact` },
  },
  "property-inspection-checklist": {
    subject: "Your Inspection Checklist — how to use it properly",
    headline: "No inspection = no proof. It's that simple.",
    intro: "The inspection checklist protects you when a tenant moves out and things aren't right. Here's how to use it so it actually holds up.",
    steps: [
      "<strong>Do the move-in inspection together.</strong> Walk through with the tenant on day one. Both of you sign the completed form. This establishes the baseline — anything worse at move-out is their responsibility.",
      "<strong>Take photos. Date-stamped.</strong> The form is good. Photos are better. Photos with timestamps are undeniable. Document every room, every wall, every appliance.",
      "<strong>Note existing damage in writing.</strong> Scuff on the wall? Write it down. Chipped countertop? Write it down. If it's not on the form, you can't claim it later.",
      "<strong>Repeat at move-out — same process.</strong> Walk through together again if possible. Compare against the move-in report. Any damage beyond normal wear and tear can be claimed against the last month's rent deposit (which is actually called a 'rent deposit' in Ontario — not a security deposit).",
      "<strong>Normal wear and tear is not claimable.</strong> Small scuffs, minor carpet wear, small nail holes — that's normal. Large holes, broken fixtures, deep stains — that's damage.",
    ],
    tip: { title: "Ontario rule", body: "You cannot collect a security deposit in Ontario. You can only collect first and last month's rent at the start of a tenancy. The 'last month's rent' cannot be used for damages — only for the final month of tenancy." },
    cta: { text: "Learn more about property management", url: `${BASE_URL}/landlords` },
  },
  "landlord-tax-guide": {
    subject: "Your Ontario Landlord Tax Guide — what you can actually write off",
    headline: "You're probably leaving money on the table.",
    intro: "A lot of landlords don't claim everything they're entitled to. Not because they're lazy — because nobody told them. Here's what's deductible and what isn't.",
    steps: [
      "<strong>Mortgage interest — yes. Principal — no.</strong> Only the interest portion of your mortgage payment is deductible as a rental expense. The principal paydown is not an expense — it's equity.",
      "<strong>Property management fees — 100% deductible.</strong> What you pay Prospera (or any property manager) comes right off your rental income. Keep the invoices.",
      "<strong>Repairs vs. improvements — this one trips people up.</strong> Fixing a broken furnace = repair = fully deductible this year. Replacing the furnace with a better one = capital improvement = depreciated over time. Same rule applies to roofs, windows, and flooring.",
      "<strong>Home office — if you manage yourself.</strong> If you manage your own rentals from home, a portion of your home office expenses may be deductible. Talk to an accountant about the specifics.",
      "<strong>Keep every receipt.</strong> CRA can audit rental income going back 6 years. A receipt from 2020 might matter in 2026.",
    ],
    tip: { title: "Talk to an accountant", body: "This guide is a starting point — not tax advice. An accountant who works with rental property owners can find deductions specific to your situation and make sure you're filing correctly. The cost of the accountant is also deductible." },
    cta: { text: "Questions about managing your rental?", url: `${BASE_URL}/contact` },
  },
  "maintenance-request-form": {
    subject: "Your Maintenance Request Form — how to set it up properly",
    headline: "No paper trail = no accountability. This form fixes that.",
    intro: "The maintenance request form does two things: it protects you legally, and it stops tenants from calling you at midnight for non-emergencies. Here's how to implement it.",
    steps: [
      "<strong>Give it to tenants on move-in day.</strong> Set the expectation early — non-emergency maintenance goes through the form. Emergencies (no heat in winter, flooding, gas smell) still get a phone call.",
      "<strong>Define 'emergency' in writing.</strong> Add to your lease addendum exactly what qualifies for an emergency call. Everything else — form first.",
      "<strong>Set a response time commitment and stick to it.</strong> 24 hours to acknowledge, 72 hours for non-urgent issues. When you consistently hit that, tenants stop worrying and stop calling repeatedly.",
      "<strong>Keep copies of every request and every response.</strong> If a tenant claims you ignored a maintenance issue at the LTB, your records tell a different story.",
      "<strong>Note the date each issue is resolved.</strong> Resolved date matters — it shows responsiveness and closes the loop on every request.",
    ],
    tip: { title: "Your obligation under Ontario law", body: "Ontario landlords are legally required to maintain rental units in a good state of repair. Ignoring maintenance requests isn't just bad practice — it can result in rent abatement orders from the LTB." },
    cta: { text: "Let us handle maintenance coordination", url: `${BASE_URL}/landlords` },
  },
  "rental-application": {
    subject: "Your Rental Application Template — how to use it",
    headline: "The application is your first look at who's applying. Make it count.",
    intro: "A good rental application collects everything you need to make a confident decision — without crossing any lines under Ontario's Human Rights Code. Here's how to use it.",
    steps: [
      "<strong>Send it before showing the unit if possible.</strong> Pre-qualifying applicants saves everyone time. If the income doesn't work on paper, no need to schedule a showing.",
      "<strong>Income verification is mandatory.</strong> Ask for pay stubs (last 2-3), employment letter with salary, or NOA (Notice of Assessment) for self-employed applicants. Bank statements work too.",
      "<strong>Reference checks — actually call them.</strong> Previous landlords are gold. Ask: Did they pay on time? Would you rent to them again? That second question tells you everything.",
      "<strong>Credit check consent is included in the form.</strong> Keep the signed consent form. You need it to legally pull someone's credit in Canada.",
      "<strong>Keep applications for declined candidates.</strong> If someone claims discrimination, your documented application process — and the objective criteria you used — is your defence.",
    ],
    tip: { title: "What you cannot ask", body: "You cannot ask about age, marital status, family status, religion, race, disability, or source of income (Ontario Works, ODSP, etc. are protected income sources). Stick to financials, rental history, and references." },
    cta: { text: "Want us to handle tenant placement?", url: `${BASE_URL}/landlords` },
  },
  "landlord-rights-guide": {
    subject: "Your Ontario Landlord Rights Guide — the stuff that actually matters",
    headline: "You have more rights than most landlords realize.",
    intro: "Ontario's Residential Tenancies Act gets a reputation for being tenant-friendly — and it is. But landlords have real, enforceable rights too. Here's what you should know.",
    steps: [
      "<strong>Entry with 24 hours written notice.</strong> You can enter your own property to show it, inspect it, or make repairs — with proper notice. Notice must be written and given at least 24 hours in advance.",
      "<strong>Rent must be paid on time.</strong> The day it's late, you can serve an N4. You don't have to wait. You don't have to ask nicely first. Serve the form.",
      "<strong>Tenants can't just stop paying because something's broken.</strong> Maintenance issues should be reported. If you're not fixing them, the tenant's remedy is to apply to the LTB — not to withhold rent unilaterally.",
      "<strong>You can raise rent once a year.</strong> With proper notice and within the guideline. It's your right to keep up with inflation on your investment.",
      "<strong>You can evict for legitimate reasons.</strong> Non-payment, damage, illegal activity, personal use — all valid grounds. The process takes time, but it works if you follow it correctly.",
    ],
    tip: { title: "Document everything", body: "Every notice served, every maintenance request received, every lease signed — keep copies. The LTB makes decisions based on evidence. Landlords who document well almost always come out ahead." },
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
    // Generic fallback
    const html = wrapper(bodyText(`
      <p style="margin:0 0 20px;">Hey ${name || "there"},</p>
      <p style="margin:0 0 16px;">Here's your download: <strong>${resourceTitle}</strong></p>
      ${fileUrl ? btn("Download Now", fileUrl) : ""}
      ${divider()}
      <p style="margin:0;">Questions? Just reply to this email.<br/>— Ebin, Prospera Properties</p>
    `));
    return { subject: `Your download: ${resourceTitle}`, html };
  }

  const stepsHtml = guide.steps.map((s, i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E8E4DF;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="28" valign="top" style="font-size:12px;color:#8B2030;font-weight:700;padding-top:1px;">${i + 1}.</td>
            <td style="font-size:14px;color:#2C2C2C;line-height:1.6;">${s}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  const content = bodyText(`
    <p style="margin:0 0 20px;">Hey ${name || "there"},</p>

    <p style="margin:0 0 8px;font-size:11px;color:#8B2030;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
    <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#1F2F3A;">${guide.headline}</p>

    <p style="margin:16px 0 24px;font-size:14px;color:#5A5A5A;">${guide.intro}</p>

    ${fileUrl ? btn("Download: " + resourceTitle, fileUrl) : ""}

    ${divider()}

    <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
      ${stepsHtml}
    </table>

    ${tipBox(guide.tip.title, guide.tip.body)}

    ${divider()}

    <p style="margin:0 0 16px;font-size:14px;color:#2C2C2C;">Got a question about your specific situation? We're happy to help — just reply to this email or reach out directly.</p>

    ${btn(guide.cta.text, guide.cta.url)}

    ${divider()}

    <p style="margin:0;font-size:13px;color:#9B9B9B;">— Ebin Jaison<br/>Founder, Prospera Properties<br/>(519) 697-1227</p>
  `);

  return { subject: guide.subject, html: wrapper(content) };
}
