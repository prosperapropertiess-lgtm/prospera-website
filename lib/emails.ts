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
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0EB;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FAF8F5;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0A1628;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:22px;font-weight:300;color:#FAF8F5;letter-spacing:1px;">Prospera Properties</p>
                    <p style="margin:4px 0 0;font-size:11px;color:rgba(250,248,245,0.5);letter-spacing:2px;text-transform:uppercase;">London · St. Thomas · Strathroy</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;">Ontario, Canada</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold bar -->
          <tr><td style="height:3px;background-color:#C5A55A;"></td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0A1628;padding:28px 40px;">
              <p style="margin:0 0 8px;font-size:12px;color:rgba(250,248,245,0.5);">Prospera Properties · (519) 697-1227 · <a href="mailto:hello@prosperaproperties.co" style="color:#C5A55A;text-decoration:none;">hello@prosperaproperties.co</a></p>
              <p style="margin:0;font-size:11px;color:rgba(250,248,245,0.3);">London, St. Thomas &amp; Strathroy, Ontario · <a href="${BASE_URL}" style="color:rgba(250,248,245,0.4);text-decoration:none;">prosperaproperties.co</a></p>
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
      <td style="background-color:#0A1628;padding:14px 28px;">
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
      <td style="background-color:#F5F0EB;border-left:3px solid #C5A55A;padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${title}</p>
        <p style="margin:0;font-size:14px;color:#2C2C2C;line-height:1.6;">${body}</p>
      </td>
    </tr>
  </table>`;
}

// ─── LANDLORD WELCOME ────────────────────────────────────────

export function landlordWelcomeEmail(name: string): string {
  const content = bodyText(`
    <p style="margin:0 0 20px;">Hey ${name || "there"},</p>

    <p style="margin:0 0 16px;">Glad you're here. Seriously.</p>

    <p style="margin:0 0 16px;">Most landlords come to us after something went wrong — a bad tenant, a missed rent payment, or just the slow realization that managing a property is basically a second job nobody signed up for.</p>

    <p style="margin:0 0 16px;">We built Prospera for exactly that moment.</p>

    ${divider()}

    <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">What we actually do for you</p>

    <p style="margin:12px 0 8px;">We take the whole thing off your plate. Not just rent collection — the tenant screening, the 2am maintenance calls, the lease renewals, the legal notices. Everything.</p>

    <p style="margin:0 0 16px;">And here's the part people don't expect — we don't mark up maintenance. You pay what the contractor charges. That's it.</p>

    ${tipBox("Zero markup. Ever.", "We've spent two years building a network of trusted contractors across London, St. Thomas, and Strathroy. You get their rate — not their rate plus our cut.")}

    ${divider()}

    <p style="margin:0 0 8px;font-size:13px;color:#7B1C1C;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Here's what to do next</p>

    <p style="margin:12px 0 16px;">If you've got a property you want us to look after, start here — it's free and there's zero obligation:</p>

    ${btn("Get a Free Quote", `${BASE_URL}/contact`)}

    <p style="margin:24px 0 16px;">Or if you're just browsing, check out our free landlord resources — lease templates, eviction guides, inspection checklists, all of it:</p>

    ${btn("Browse Free Resources", `${BASE_URL}/resources`)}

    ${divider()}

    <p style="margin:0 0 8px;">One last thing — I'm Ebin, and I actually run this company myself. If you have a question, you can reply to this email. I read every one.</p>

    <p style="margin:0;">— Ebin<br/><span style="font-size:13px;color:#9B9B9B;">Founder, Prospera Properties</span></p>
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
            <td width="28" valign="top" style="font-size:12px;color:#C5A55A;font-weight:700;padding-top:1px;">${i + 1}.</td>
            <td style="font-size:14px;color:#2C2C2C;line-height:1.6;">${s}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  const content = bodyText(`
    <p style="margin:0 0 20px;">Hey ${name || "there"},</p>

    <p style="margin:0 0 8px;font-size:11px;color:#C5A55A;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Download Is Ready</p>
    <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#0A1628;">${guide.headline}</p>

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
