import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
try {
  const env = readFileSync(envPath, "utf-8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
} catch {}

const { Resend } = await import("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = "https://www.prosperaproperties.co";
const PHOTO_URL = "https://www.prosperaproperties.co/ebin-candid.jpg";

// ── Design tokens — navy + white + burgundy only ───────────────────────────────
// #0A1628  navy
// #7B1C1C  burgundy
// #FAF8F5  cream/white
// #F5F0EB  off-white bg

function wrapper(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0EB;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FAF8F5;">

  <!-- Header -->
  <tr><td style="background-color:#0A1628;padding:32px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <p style="margin:0;font-size:22px;font-weight:300;color:#FAF8F5;letter-spacing:1px;">Prospera Properties</p>
        <p style="margin:4px 0 0;font-size:11px;color:rgba(250,248,245,0.5);letter-spacing:2px;text-transform:uppercase;">London · St. Thomas · Strathroy</p>
      </td>
      <td align="right">
        <p style="margin:0;font-size:11px;color:rgba(250,248,245,0.6);letter-spacing:2px;text-transform:uppercase;">Ontario, Canada</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- Burgundy bar -->
  <tr><td style="height:3px;background-color:#7B1C1C;"></td></tr>

  <!-- Body -->
  <tr><td style="padding:40px;">${content}</td></tr>

  <!-- Footer -->
  <tr><td style="background-color:#0A1628;padding:28px 40px;">
    <p style="margin:0 0 8px;font-size:12px;color:rgba(250,248,245,0.5);">Prospera Properties · (519) 697-1227 · <a href="mailto:hello@prosperaproperties.co" style="color:#FAF8F5;text-decoration:none;">hello@prosperaproperties.co</a></p>
    <p style="margin:0;font-size:11px;color:rgba(250,248,245,0.3);">London, St. Thomas &amp; Strathroy, Ontario · <a href="${BASE_URL}" style="color:rgba(250,248,245,0.4);text-decoration:none;">prosperaproperties.co</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function btn(text, url) {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 0;"><tr>
    <td style="background-color:#7B1C1C;padding:14px 28px;">
      <a href="${url}" style="color:#FAF8F5;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${text}</a>
    </td></tr></table>`;
}

function divider() {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td style="height:1px;background-color:#E8E4DF;"></td></tr></table>`;
}

function tip(title, body) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr>
    <td style="background-color:#F5F0EB;border-left:3px solid #7B1C1C;padding:16px 20px;">
      <p style="margin:0 0 6px;font-size:11px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${title}</p>
      <p style="margin:0;font-size:14px;color:#2C2C2C;line-height:1.6;">${body}</p>
    </td></tr></table>`;
}

function signoff(extra = "") {
  return `${divider()}
  <table cellpadding="0" cellspacing="0" width="100%"><tr>
    <td style="width:90px;padding-right:20px;vertical-align:top;">
      <img src="${PHOTO_URL}" width="90" alt="Ebin Jaison" style="display:block;height:auto;border-radius:4px;" />
    </td>
    <td style="vertical-align:middle;">
      <p style="margin:0;font-size:15px;color:#0A1628;font-weight:700;">Ebin Jaison</p>
      <p style="margin:3px 0 0;font-size:13px;color:#7B1C1C;font-weight:600;">Owner, Prospera Properties</p>
      <p style="margin:5px 0 0;font-size:12px;color:#9B9B9B;">(519) 697-1227</p>
      ${extra ? `<p style="margin:6px 0 0;font-size:13px;color:#5A5A5A;">${extra}</p>` : ""}
    </td>
  </tr></table>`;
}

// ── Template IDs from initial creation ────────────────────────────────────────
const TEMPLATE_IDS = {
  "Landlord Welcome":                      "92567770-8084-4ae2-ac05-d7cbc4b8ef3e",
  "Tenant Welcome":                        "baf60b41-f9c8-4ce5-9bed-14d1b1ca6d86",
  "Resource: Ontario Standard Lease":      "8ec6e133-6799-4e94-8724-05fefec901d0",
  "Resource: Tenant Screening Checklist":  "e1aac6f1-67f9-4b7c-875e-bf830c0542ed",
  "Resource: Eviction Notices (N4, N5, N12)": "ad97128b-2766-4523-8621-7d53e3eb0f45",
  "Resource: Property Inspection Checklist": "c43acace-d06d-4ae3-a09d-8c1122bcf040",
  "Resource: Ontario Landlord Tax Guide":  "5e913a96-9e0d-4236-ad0b-b1ce0a188c19",
  "Resource: Rental Application Template": "46061268-801c-44df-b7b8-874bcaeb59f8",
  "Resource: Landlord Rights Guide":       "f0731de7-595e-4c1d-8d0a-b5db5afd6ead",
};

const templates = [
  {
    name: "Landlord Welcome",
    subject: "Welcome — here's what Prospera does for landlords",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#2C2C2C;">Glad you're here. Seriously.</p>
      <p style="margin:0 0 16px;font-size:15px;color:#2C2C2C;">Most landlords come to us after something went wrong — a bad tenant, a missed rent payment, or just the slow realization that managing a property is basically a second job nobody signed up for.</p>
      <p style="margin:0 0 16px;font-size:15px;color:#2C2C2C;">We built Prospera for exactly that moment.</p>
      ${divider()}
      <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">What we actually do for you</p>
      <p style="margin:12px 0 8px;font-size:15px;color:#2C2C2C;">We take the whole thing off your plate. Not just rent collection — the tenant screening, the 2am maintenance calls, the lease renewals, the legal notices. Everything.</p>
      <p style="margin:0 0 16px;font-size:15px;color:#2C2C2C;">And here's the part people don't expect — we don't mark up maintenance. You pay what the contractor charges. That's it.</p>
      ${tip("Zero markup. Ever.", "We've spent two years building a network of trusted contractors across London, St. Thomas, and Strathroy. You get their rate — not their rate plus our cut.")}
      ${divider()}
      <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Here's what to do next</p>
      <p style="margin:12px 0 16px;font-size:15px;color:#2C2C2C;">If you've got a property you want us to look after, start here — free, zero obligation:</p>
      ${btn("Get a Free Quote", `${BASE_URL}/contact`)}
      <p style="margin:24px 0 16px;font-size:15px;color:#2C2C2C;">Or browse our free landlord resources — lease templates, eviction guides, inspection checklists:</p>
      ${btn("Browse Free Resources", `${BASE_URL}/resources`)}
      ${signoff("Reply to this email anytime — I read every one.")}
    `),
  },
  {
    name: "Tenant Welcome",
    subject: "You're on the list — Prospera Properties",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#2C2C2C;">You're on the list — and we'll be in touch the moment something opens up in your area.</p>
      <p style="margin:0 0 16px;font-size:15px;color:#2C2C2C;">Renting shouldn't be stressful. Maintenance that actually gets fixed. A landlord who picks up the phone. A place that's been properly looked after. That's what we're about.</p>
      ${divider()}
      <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">While you wait</p>
      <p style="margin:12px 0 16px;font-size:15px;color:#2C2C2C;">Check our listings page — we add new properties regularly:</p>
      ${btn("Browse Available Rentals", `${BASE_URL}/listings`)}
      ${divider()}
      <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Know your rights</p>
      ${tip("Your rights as an Ontario tenant", "Rent can only be increased once per year with 90 days written notice. Your landlord can only enter with 24 hours notice (except emergencies). You cannot be evicted without a proper LTB hearing.")}
      ${signoff("Questions? Just reply — a real person will get back to you.")}
    `),
  },
  {
    name: "Resource: Ontario Standard Lease",
    subject: "Your Ontario Standard Lease — plus how to fill it out correctly",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 16px;font-size:22px;font-weight:300;color:#0A1628;">The Standard Lease. Simpler than it looks.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A5A5A;">Ontario's standard lease is mandatory for most residential rentals. People mess it up all the time. Here's how to do it right.</p>
      ${btn("Download: Ontario Standard Lease", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Don't skip Section D.</strong> Add pet rules, parking, utility responsibilities. Vague here = arguments later.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Both parties sign every page.</strong> Sounds obvious. People skip this. Don't.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Tenant gets a copy within 21 days.</strong> Ontario law requires it.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. The lease can't override the RTA.</strong> If it contradicts Ontario's Residential Tenancies Act, the Act wins.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Month-to-month after term ends is normal.</strong> Not a problem — that's just how it works.</p>
      ${tip("Heads up", "Not using the Ontario standard form gives the tenant the right to withhold one month's rent until you provide the correct form. Always use the right form.")}
      ${signoff()}
    `),
  },
  {
    name: "Resource: Tenant Screening Checklist",
    subject: "Your Tenant Screening Checklist — how to use it",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 16px;font-size:22px;font-weight:300;color:#0A1628;">One bad tenant costs more than a year of management fees.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A5A5A;">We've placed 25+ tenants. All paying rent. No LTB cases. This is the exact process we use.</p>
      ${btn("Download: Tenant Screening Checklist", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Pre-screen on the phone first.</strong> A 5-minute call filters 30% of bad fits before you show the unit.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Income should be 3x the rent.</strong> $2,000/month rent = $6,000/month gross income. Verify with pay stubs.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Always pull credit.</strong> A 580 score with an explanation is different from a 580 with collections.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. Call previous landlords — not just the most recent one.</strong> The current landlord might give a glowing reference just to get rid of a problem tenant.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Document your decision.</strong> Have a reason based on financials, references, and credit — always.</p>
      ${tip("Important", "You cannot decline based on age, race, family status, or source of income under Ontario's Human Rights Code.")}
      ${signoff()}
    `),
  },
  {
    name: "Resource: Eviction Notices (N4, N5, N12)",
    subject: "Your Eviction Notice Templates — N4, N5, N12 explained plainly",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 16px;font-size:22px;font-weight:300;color:#0A1628;">Evictions are stressful. Using the wrong form makes them worse.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A5A5A;">These three forms cover the most common eviction scenarios in Ontario. Here's when to use each one.</p>
      ${btn("Download: Eviction Notice Templates", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">When to use each form</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>N4 — Non-payment.</strong> Serve it the day after rent is late. Tenant has 14 days to pay or move. If they pay, N4 is void.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>N5 — Damage or interference.</strong> Tenant gets 20 days to fix it on the first N5. Second N5 within 6 months — no second chance.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>N12 — Owner moving in.</strong> 60 days notice + one month's rent compensation. Heavily scrutinized at the LTB.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>Serve it properly.</strong> Hand-deliver or registered mail. Keep proof.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>File with the LTB if needed.</strong> Don't skip the process — changing locks is illegal in Ontario.</p>
      ${tip("Heads up", "Changing locks, removing belongings, or shutting off utilities to force a tenant out is illegal in Ontario regardless of how behind they are on rent. Always go through the LTB.")}
      ${signoff()}
    `),
  },
  {
    name: "Resource: Property Inspection Checklist",
    subject: "Your Inspection Checklist — how to use it properly",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 16px;font-size:22px;font-weight:300;color:#0A1628;">No inspection = no proof. It's that simple.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A5A5A;">This checklist protects you when a tenant moves out and things aren't right. Here's how to use it.</p>
      ${btn("Download: Property Inspection Checklist", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Walk through together on day one.</strong> Both sign the form. That's your baseline — everything else is compared to this.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Take photos. Date-stamped.</strong> The form is good. Photos with timestamps are undeniable.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Note existing damage in writing.</strong> If it's not on the form, you can't claim it later.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. Repeat at move-out.</strong> Compare against move-in. Damage beyond normal wear and tear can be claimed.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Normal wear and tear is not claimable.</strong> Small scuffs = normal. Holes in walls, broken fixtures = damage.</p>
      ${tip("Ontario rule", "You cannot collect a security deposit. Only first and last month's rent. Last month's rent cannot be used for damages — only for the final month of tenancy.")}
      ${signoff()}
    `),
  },
  {
    name: "Resource: Ontario Landlord Tax Guide",
    subject: "Your Ontario Landlord Tax Guide — what you can actually write off",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 16px;font-size:22px;font-weight:300;color:#0A1628;">You're probably leaving money on the table.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A5A5A;">Most landlords don't claim everything they're entitled to. Not because they're lazy — because nobody told them.</p>
      ${btn("Download: Ontario Landlord Tax Guide", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Key deductions to know</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Mortgage interest — yes. Principal — no.</strong> Only the interest portion is deductible.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Property management fees — 100% deductible.</strong> What you pay Prospera comes off your rental income.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Repairs vs. improvements.</strong> Fixing a broken furnace = deductible this year. New furnace = depreciated over time.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. Home office.</strong> If you manage yourself from home, a portion may be deductible.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Keep every receipt.</strong> CRA can audit rental income going back 6 years.</p>
      ${tip("Talk to an accountant", "This guide is a starting point — not tax advice. The cost of a good accountant is also deductible.")}
      ${signoff()}
    `),
  },
  {
    name: "Resource: Rental Application Template",
    subject: "Your Rental Application Template — how to use it",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 16px;font-size:22px;font-weight:300;color:#0A1628;">The application is your first look at who's applying. Make it count.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A5A5A;">A good application collects everything you need — without crossing any lines under Ontario's Human Rights Code.</p>
      ${btn("Download: Rental Application Template", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Send it before showing the unit.</strong> Pre-qualifying saves everyone time.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Verify income.</strong> Pay stubs, employment letters, or NOA for self-employed applicants.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Actually call the references.</strong> Ask: would you rent to them again? That question tells you everything.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. Credit check consent is in the form.</strong> Keep the signed copy — you need it legally.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Keep declined applications.</strong> Your documented process is your defence if someone claims discrimination.</p>
      ${tip("What you cannot ask", "Age, marital status, religion, race, disability, or source of income are all protected grounds. Stick to financials, rental history, and references.")}
      ${signoff()}
    `),
  },
  {
    name: "Resource: Landlord Rights Guide",
    subject: "Your Ontario Landlord Rights Guide — the stuff that actually matters",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 16px;font-size:22px;font-weight:300;color:#0A1628;">You have more rights than most landlords realize.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#5A5A5A;">Ontario's RTA gets a reputation for being tenant-friendly. But landlords have real, enforceable rights too.</p>
      ${btn("Download: Ontario Landlord Rights Guide", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">What you need to know</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Entry with 24 hours written notice.</strong> You can enter to show it, inspect it, or make repairs — with proper notice.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Rent must be paid on time.</strong> The day it's late, you can serve an N4. No waiting, no asking nicely first.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Tenants can't withhold rent for maintenance.</strong> Their remedy is the LTB — not stopping payment.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. You can raise rent once a year.</strong> With proper 90-day notice and within the provincial guideline.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. You can evict for legitimate reasons.</strong> It takes time. It works. Follow the process.</p>
      ${tip("Document everything", "Every notice served, every maintenance request, every lease signed — keep copies. Landlords who document well almost always come out ahead at the LTB.")}
      ${signoff()}
    `),
  },
];

// ── Update all templates ───────────────────────────────────────────────────────

console.log(`Updating ${templates.length} templates in Resend...\n`);

for (const template of templates) {
  const id = TEMPLATE_IDS[template.name];
  if (!id) { console.error(`✗ No ID for: ${template.name}`); continue; }
  try {
    const result = await resend.templates.update(id, {
      subject: template.subject,
      html: template.html,
    });
    if (result.data?.id || result.data?.object) {
      console.log(`✓ ${template.name}`);
    } else {
      console.error(`✗ ${template.name}:`, result.error?.message ?? JSON.stringify(result.error));
    }
  } catch (err) {
    console.error(`✗ ${template.name}:`, err.message ?? err);
  }
}

console.log("\nDone. Check Resend → Templates.");
