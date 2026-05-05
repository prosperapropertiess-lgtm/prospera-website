import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = readFileSync(envPath, "utf-8");
for (const line of env.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const { Resend } = await import("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Shared styles ──────────────────────────────────────────────────────────────

const BASE_URL = "https://www.prosperaproperties.co";

function wrapper(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0EB;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FAF8F5;">
  <tr><td style="background-color:#0A1628;padding:32px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><p style="margin:0;font-size:22px;font-weight:300;color:#FAF8F5;letter-spacing:1px;">Prospera Properties</p>
          <p style="margin:4px 0 0;font-size:11px;color:rgba(250,248,245,0.5);letter-spacing:2px;text-transform:uppercase;">London · St. Thomas · Strathroy</p></td>
      <td align="right"><p style="margin:0;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;">Ontario, Canada</p></td>
    </tr></table>
  </td></tr>
  <tr><td style="height:3px;background-color:#C5A55A;"></td></tr>
  <tr><td style="padding:40px;">${content}</td></tr>
  <tr><td style="background-color:#0A1628;padding:28px 40px;">
    <p style="margin:0 0 8px;font-size:12px;color:rgba(250,248,245,0.5);">Prospera Properties · (519) 697-1227 · <a href="mailto:hello@prosperaproperties.co" style="color:#C5A55A;text-decoration:none;">hello@prosperaproperties.co</a></p>
    <p style="margin:0;font-size:11px;color:rgba(250,248,245,0.3);">London, St. Thomas &amp; Strathroy, Ontario · <a href="${BASE_URL}" style="color:rgba(250,248,245,0.4);text-decoration:none;">prosperaproperties.co</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function btn(text, url) {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 0;"><tr>
    <td style="background-color:#0A1628;padding:14px 28px;">
      <a href="${url}" style="color:#FAF8F5;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${text}</a>
    </td></tr></table>`;
}

function divider() {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td style="height:1px;background-color:#E8E4DF;"></td></tr></table>`;
}

function tip(title, body) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr>
    <td style="background-color:#F5F0EB;border-left:3px solid #C5A55A;padding:16px 20px;">
      <p style="margin:0 0 6px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${title}</p>
      <p style="margin:0;font-size:14px;color:#2C2C2C;line-height:1.6;">${body}</p>
    </td></tr></table>`;
}

// ── Templates ──────────────────────────────────────────────────────────────────

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
      ${divider()}
      <p style="margin:0 0 8px;font-size:14px;color:#2C2C2C;">I'm Ebin, and I actually run this company myself. If you have a question, reply to this email. I read every one.</p>
      <p style="margin:0;font-size:14px;color:#2C2C2C;">— Ebin<br/><span style="font-size:13px;color:#9B9B9B;">Founder, Prospera Properties</span></p>
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
      ${divider()}
      <p style="margin:0;font-size:14px;color:#2C2C2C;">Questions? Just reply to this email — a real person will get back to you.</p>
      <p style="margin:8px 0 0;font-size:14px;color:#2C2C2C;">— Ebin &amp; the Prospera team<br/><span style="font-size:13px;color:#9B9B9B;">(519) 697-1227</span></p>
    `),
  },
  {
    name: "Resource: Ontario Standard Lease",
    subject: "Your Ontario Standard Lease — plus how to fill it out correctly",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#0A1628;">The Standard Lease. It's simpler than it looks.</p>
      <p style="margin:16px 0 24px;font-size:14px;color:#5A5A5A;">Ontario's standard lease form is mandatory for most residential rentals. Bad news: people mess it up all the time. Here's how to do it right.</p>
      ${btn("Download: Ontario Standard Lease", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Don't skip Section D.</strong> This is where you add pet rules, parking, utility responsibilities. Vague here = arguments later.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Both parties sign every page.</strong> Sounds obvious. People skip this. Don't.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Tenant gets a copy within 21 days.</strong> Ontario law requires it. Keep a signed copy for yourself too.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. The lease can't override the RTA.</strong> If it contradicts Ontario's Residential Tenancies Act, the Act wins.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Month-to-month after term ends is normal.</strong> When a 12-month lease expires, it automatically becomes month-to-month.</p>
      ${tip("Heads up", "Not using the Ontario standard form (for tenancies after April 30, 2018) gives the tenant the right to withhold one month's rent until you provide the correct form.")}
      ${divider()}
      ${btn("Get a free lease review", `${BASE_URL}/contact`)}
      <p style="margin:24px 0 0;font-size:13px;color:#9B9B9B;">— Ebin Jaison, Prospera Properties · (519) 697-1227</p>
    `),
  },
  {
    name: "Resource: Tenant Screening Checklist",
    subject: "Your Tenant Screening Checklist — how to use it",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#0A1628;">One bad tenant costs more than a year of management fees.</p>
      <p style="margin:16px 0 24px;font-size:14px;color:#5A5A5A;">We've placed 25+ tenants. All paying rent. No LTB cases. This checklist is the exact process we use.</p>
      ${btn("Download: Tenant Screening Checklist", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Pre-screen on the phone first.</strong> A 5-minute call filters 30% of bad fits before you even show the unit.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Income should be 3x the rent.</strong> $2,000/month rent = $6,000/month gross income minimum. Verify with pay stubs.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Always pull credit.</strong> A 580 score with an explanation is different from a 580 with collections.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. Call previous landlords — not just the most recent one.</strong> The current landlord might give a glowing reference just to get rid of a problem tenant.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Document your decision.</strong> If you're declining someone, have a reason based on the checklist criteria.</p>
      ${tip("Important", "You cannot decline based on age, race, family status, or source of income. Decline based on financials, references, and credit — always.")}
      ${divider()}
      ${btn("Want us to handle screening for you?", `${BASE_URL}/landlords`)}
      <p style="margin:24px 0 0;font-size:13px;color:#9B9B9B;">— Ebin Jaison, Prospera Properties · (519) 697-1227</p>
    `),
  },
  {
    name: "Resource: Eviction Notices (N4, N5, N12)",
    subject: "Your Eviction Notice Templates — N4, N5, N12 explained plainly",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#0A1628;">Evictions are stressful. Using the wrong form makes them worse.</p>
      <p style="margin:16px 0 24px;font-size:14px;color:#5A5A5A;">These three forms cover the most common eviction scenarios in Ontario. Here's when to use each one.</p>
      ${btn("Download: Eviction Notice Templates", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. N4 — Non-payment of rent.</strong> Serve it the day after rent was due. Tenant has 14 days to pay or move out. If they pay, the N4 is void.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. N5 — Interference, damage, overcrowding.</strong> Tenant gets 20 days to fix the problem on the first N5. Second N5 within 6 months — no chance to fix.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. N12 — Landlord moving in.</strong> 60 days notice + one month's rent compensation. Heavily scrutinized at the LTB — be sure it's genuine.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. Serve it properly.</strong> Hand-deliver, registered mail, or tenant portal. Keep proof.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Filing with the LTB is the next step.</strong> If not resolved after the notice period, file with the Landlord and Tenant Board.</p>
      ${tip("Heads up", "Changing locks, removing belongings, or shutting off utilities to force a tenant out is illegal in Ontario — regardless of how behind they are on rent. Always go through the LTB process.")}
      ${divider()}
      ${btn("Need help with an LTB filing?", `${BASE_URL}/contact`)}
      <p style="margin:24px 0 0;font-size:13px;color:#9B9B9B;">— Ebin Jaison, Prospera Properties · (519) 697-1227</p>
    `),
  },
  {
    name: "Resource: Property Inspection Checklist",
    subject: "Your Inspection Checklist — how to use it properly",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#0A1628;">No inspection = no proof. It's that simple.</p>
      <p style="margin:16px 0 24px;font-size:14px;color:#5A5A5A;">The inspection checklist protects you when a tenant moves out and things aren't right. Here's how to use it so it holds up.</p>
      ${btn("Download: Property Inspection Checklist", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Do the move-in inspection together.</strong> Walk through with the tenant on day one. Both sign the form. This is your baseline.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Take photos. Date-stamped.</strong> The form is good. Photos are better. Photos with timestamps are undeniable.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Note existing damage in writing.</strong> Scuff on the wall? Write it down. If it's not on the form, you can't claim it later.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. Repeat at move-out — same process.</strong> Compare against the move-in report. Damage beyond normal wear and tear can be claimed.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Normal wear and tear is not claimable.</strong> Small scuffs, minor carpet wear, small nail holes — normal. Large holes, broken fixtures, deep stains — damage.</p>
      ${tip("Ontario rule", "You cannot collect a security deposit in Ontario. Only first and last month's rent. The last month's rent cannot be used for damages — only for the final month.")}
      ${divider()}
      ${btn("Learn more about property management", `${BASE_URL}/landlords`)}
      <p style="margin:24px 0 0;font-size:13px;color:#9B9B9B;">— Ebin Jaison, Prospera Properties · (519) 697-1227</p>
    `),
  },
  {
    name: "Resource: Ontario Landlord Tax Guide",
    subject: "Your Ontario Landlord Tax Guide — what you can actually write off",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#0A1628;">You're probably leaving money on the table.</p>
      <p style="margin:16px 0 24px;font-size:14px;color:#5A5A5A;">A lot of landlords don't claim everything they're entitled to. Not because they're lazy — because nobody told them.</p>
      ${btn("Download: Ontario Landlord Tax Guide", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Key deductions to know</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Mortgage interest — yes. Principal — no.</strong> Only the interest portion is deductible. The principal is equity.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Property management fees — 100% deductible.</strong> What you pay Prospera comes right off your rental income.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Repairs vs. improvements.</strong> Fixing a broken furnace = repair = deductible this year. New furnace = capital improvement = depreciated over time.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. Home office — if you manage yourself.</strong> A portion of home office expenses may be deductible. Talk to an accountant.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Keep every receipt.</strong> CRA can audit rental income going back 6 years.</p>
      ${tip("Talk to an accountant", "This guide is a starting point — not tax advice. An accountant who works with rental property owners can find deductions specific to your situation. The cost of the accountant is also deductible.")}
      ${divider()}
      ${btn("Questions about managing your rental?", `${BASE_URL}/contact`)}
      <p style="margin:24px 0 0;font-size:13px;color:#9B9B9B;">— Ebin Jaison, Prospera Properties · (519) 697-1227</p>
    `),
  },
  {
    name: "Resource: Rental Application Template",
    subject: "Your Rental Application Template — how to use it",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#0A1628;">The application is your first look at who's applying. Make it count.</p>
      <p style="margin:16px 0 24px;font-size:14px;color:#5A5A5A;">A good rental application collects everything you need to make a confident decision — without crossing any lines under Ontario's Human Rights Code.</p>
      ${btn("Download: Rental Application Template", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">How to use this</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Send it before showing the unit.</strong> Pre-qualifying saves everyone time.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Income verification is mandatory.</strong> Pay stubs, employment letters, or NOA for self-employed applicants.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Reference checks — actually call them.</strong> Ask: Did they pay on time? Would you rent to them again?</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. Credit check consent is in the form.</strong> Keep the signed consent. You need it to legally pull credit in Canada.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. Keep declined applications.</strong> Your documented process is your defence if someone claims discrimination.</p>
      ${tip("What you cannot ask", "You cannot ask about age, marital status, religion, race, disability, or source of income. Stick to financials, rental history, and references.")}
      ${divider()}
      ${btn("Want us to handle tenant placement?", `${BASE_URL}/landlords`)}
      <p style="margin:24px 0 0;font-size:13px;color:#9B9B9B;">— Ebin Jaison, Prospera Properties · (519) 697-1227</p>
    `),
  },
  {
    name: "Resource: Landlord Rights Guide",
    subject: "Your Ontario Landlord Rights Guide — the stuff that actually matters",
    html: wrapper(`
      <p style="margin:0 0 20px;font-size:15px;color:#2C2C2C;">Hey {{{name}}},</p>
      <p style="margin:0 0 4px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
      <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#0A1628;">You have more rights than most landlords realize.</p>
      <p style="margin:16px 0 24px;font-size:14px;color:#5A5A5A;">Ontario's RTA gets a reputation for being tenant-friendly. It is. But landlords have real, enforceable rights too.</p>
      ${btn("Download: Ontario Landlord Rights Guide", "{{{file_url}}}")}
      ${divider()}
      <p style="margin:0 0 16px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">What you need to know</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>1. Entry with 24 hours written notice.</strong> You can enter to show it, inspect it, or make repairs — with proper notice.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>2. Rent must be paid on time.</strong> The day it's late, you can serve an N4. You don't have to wait or ask nicely first.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>3. Tenants can't withhold rent for maintenance.</strong> Their remedy is to apply to the LTB — not stop paying.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>4. You can raise rent once a year.</strong> With proper notice and within the guideline.</p>
      <p style="margin:0 0 10px;font-size:14px;color:#2C2C2C;"><strong>5. You can evict for legitimate reasons.</strong> The process takes time, but it works if you follow it correctly.</p>
      ${tip("Document everything", "Every notice served, every maintenance request, every lease signed — keep copies. The LTB makes decisions based on evidence. Landlords who document well almost always come out ahead.")}
      ${divider()}
      ${btn("Talk to us about your property", `${BASE_URL}/contact`)}
      <p style="margin:24px 0 0;font-size:13px;color:#9B9B9B;">— Ebin Jaison, Prospera Properties · (519) 697-1227</p>
    `),
  },
];

// ── Create templates ───────────────────────────────────────────────────────────

const nameVar = { key: "name", type: "string", fallbackValue: "there" };
const fileVar = { key: "file_url", type: "string", fallbackValue: "#" };

const variableMap = {
  "Landlord Welcome": [nameVar],
  "Tenant Welcome": [nameVar],
  "Resource: Ontario Standard Lease": [nameVar, fileVar],
  "Resource: Tenant Screening Checklist": [nameVar, fileVar],
  "Resource: Eviction Notices (N4, N5, N12)": [nameVar, fileVar],
  "Resource: Property Inspection Checklist": [nameVar, fileVar],
  "Resource: Ontario Landlord Tax Guide": [nameVar, fileVar],
  "Resource: Rental Application Template": [nameVar, fileVar],
  "Resource: Landlord Rights Guide": [nameVar, fileVar],
};

console.log(`Creating ${templates.length} templates in Resend...\n`);

for (const template of templates) {
  try {
    const result = await resend.templates.create({
      name: template.name,
      subject: template.subject,
      html: template.html,
      variables: variableMap[template.name] ?? [nameVar],
    });
    if (result.data?.id) {
      console.log(`✓ ${template.name} — id: ${result.data.id}`);
    } else {
      console.error(`✗ ${template.name}:`, result.error?.message ?? JSON.stringify(result));
    }
  } catch (err) {
    console.error(`✗ ${template.name}:`, err.message ?? err);
  }
}

console.log("\nDone. Check your Resend dashboard → Templates.");
