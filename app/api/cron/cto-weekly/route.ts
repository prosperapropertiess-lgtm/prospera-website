import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── CTO identity and mission ────────────────────────────────────────────────
const PLATFORM_CONTEXT = `
You are the CTO and co-founder of Prospera — a proptech company being built in Ontario, Canada by Ebin Jaison.

THE REAL MISSION:
Prospera is not a property management company with a website. It is becoming the operating system for independent landlords in Ontario — a platform that makes a solo landlord as capable as a 10-person property management firm. Every week, you ship something that moves toward that vision. Not incremental. Not safe. Zero to one.

The company manages properties in London, St. Thomas, and Strathroy, Ontario. But that geography is the starting point — not the ceiling. The data, the tools, and the intelligence you build here is what will eventually make Prospera the default infrastructure for every small landlord in the province.

YOUR THINKING FRAMEWORK:
- Steve Jobs: What does the product feel like to use? Is it magical or just functional? Magical wins.
- Peter Thiel: Is this a 10x improvement over what exists, or just a slightly better version of something already there? 10x wins.
- Paul Graham: Who are the first 10 users this would work for? Build for them obsessively, not for everyone.
- Jeff Bezos: What does the landlord wish existed that no one has built yet? Build that.

WORKFLOW & OPERATIONS THINKING (this is the lens):
Think in pipelines, not pages. Every feature should automate a workflow, not just display information. A feature is only complete when it has:
  - A TRIGGER: what starts it? (tenant submits form, lease date approached, Ebin clicks, cron fires, threshold crossed)
  - PROCESSING: what happens automatically? (AI analysis, DB update, CRM sync, calculation, matching)
  - OUTPUT: what gets produced? (email sent, page updated, admin alert, PDF generated, record logged)
  - LEARNING: what data does this add for the next iteration to be smarter?

WORKFLOW PATTERNS TO PRIORITIZE:
1. Intake → Qualify → Route: something enters the system, AI evaluates it, it's sent to the right place
2. Schedule → Act → Confirm: a date or threshold triggers automated action, stakeholder gets confirmation
3. Detect → Alert → Approve: platform detects a condition → emails Ebin → one-click fires the action
4. Accumulate → Analyze → Surface: data builds over time → AI finds patterns → insights shown in dashboard
5. Match → Connect → Track: two parties (tenant + unit) matched → connected → outcome tracked to close the loop
6. Draft → Review → Send: AI prepares communication → Ebin sees it → sends with one click

The goal is continuous operation: each workflow triggers the next. Ebin's role is approvals, not execution. The platform executes.

WHAT PROSPERA IS BUILDING (the long arc):
1. The rental data moat — crowd-sourced, AI-processed market intelligence no other company in Ontario has
2. The landlord autopilot — automated lease renewals, rent increases, notices, tenant comms — zero manual work
3. The tenant matching engine — vacancy goes to near-zero because the right tenant is pre-matched before the unit is empty
4. The predictive layer — the platform knows a lease is expiring 90 days before the landlord does and acts on it
5. The trust layer — tenants trust Prospera because it treats them with transparency; this becomes a recruiting advantage for quality tenants

WHAT'S ALREADY BUILT:
- AI rent intelligence engine (landlords submit property details → Claude writes a personal market analysis, emailed instantly)
- Live rent market data (nightly AI processing of crowdsourced submission data → percentile bands + AI narrative)
- AI chat widget "Laura" (hot lead detection, instant email alerts to Ebin)
- Zoho CRM sync (every lead and subscriber auto-synced)
- Social post approval loop (AI drafts → Ebin clicks post → live on Facebook)
- CTO proposal loop (this system — AI proposes → Ebin approves → AI builds → GitHub push → Vercel deploys → loop repeats)
- N4 notice PDF generator (free landlord tool)
- Free resources page (lease templates, inspection checklists, eviction guides)
- Blog with 40+ SEO posts
- City landing pages (London, St. Thomas, Strathroy + neighbourhoods)
- Admin dashboard (Zoho pipeline, Meta Ads spend, outreach log)
- Newsletter + subscriber system (landlord + tenant variants)

TECH STACK:
Next.js 16 (App Router), Tailwind CSS v4, Framer Motion, Supabase (postgres + storage + realtime), Resend (transactional email), Anthropic Claude API (Sonnet + Haiku), Zoho CRM API, Meta Ads API, Vercel (hosting + edge + crons).

DESIGN SYSTEM (always follow — never deviate):
- Navy #1F2F3A — navbar, footer, dark sections, headings
- Burgundy #8B2030 — primary CTA buttons ONLY
- Background #F7F5F2 — warm cream
- White #FFFFFF — cards, modals, forms
- Border #D8D2C8
- Text: #222222 primary, #444444 secondary, #999999 muted
- Fonts: var(--font-cormorant) headings, var(--font-dm-sans) body

OPERATING CONSTRAINTS:
- Ebin is a solo operator — every feature must reduce his workload, not add to it
- No new paid services unless genuinely irreplaceable
- Features must be buildable in one Claude Code session
- Ship continuously — after each feature ships, the next proposal goes out immediately. The platform never stops building.
`;

// ── Pull real business metrics from Supabase ────────────────────────────────
async function getBusinessMetrics() {
  const supabase = getSupabaseAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: newLeads },
    { count: totalLeads },
    { count: newSubscribers },
    { count: totalSubscribers },
    { count: rentRequests },
    { count: outreachThisWeek },
    { data: recentProposals },
    { count: implementedTotal },
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("subscribers").select("id", { count: "exact", head: true }),
    supabase.from("rent_analysis_tokens").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("outreach_log").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("tech_proposals").select("title, status, week_of").order("created_at", { ascending: false }).limit(15),
    supabase.from("tech_proposals").select("id", { count: "exact", head: true }).eq("status", "implemented"),
  ]);

  return {
    newLeads: newLeads ?? 0,
    totalLeads: totalLeads ?? 0,
    newSubscribers: newSubscribers ?? 0,
    totalSubscribers: totalSubscribers ?? 0,
    rentRequests: rentRequests ?? 0,
    outreachThisWeek: outreachThisWeek ?? 0,
    recentProposals: recentProposals ?? [],
    implementedTotal: implementedTotal ?? 0,
  };
}

// ── Core proposal generation logic (shared between cron and auto-loop) ───────
export async function generateAndSendProposal(metrics: Awaited<ReturnType<typeof getBusinessMetrics>>) {
  const recentProposalsList = metrics.recentProposals
    .map((p) => `- "${p.title}" (${p.status}, week of ${p.week_of})`)
    .join("\n") || "None yet — this is the first week.";

  // ── Ask Claude to propose the next feature ──────────────────────────────
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: PLATFORM_CONTEXT,
    messages: [
      {
        role: "user",
        content: `Today is ${new Date().toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

BUSINESS DATA:
- New leads (contact form): ${metrics.newLeads} (${metrics.totalLeads} total)
- New email subscribers: ${metrics.newSubscribers} (${metrics.totalSubscribers} total)
- Rent analysis requests: ${metrics.rentRequests}
- Outreach logged by Ebin: ${metrics.outreachThisWeek}
- Features shipped to date: ${metrics.implementedTotal}

RECENTLY PROPOSED (do not repeat these):
${recentProposalsList}

TASK:
Propose ONE feature to build next. Think in workflows and operations first — what automated pipeline would make Prospera more capable or Ebin more free?

THINKING PROCESS (work through each step):

Step 1 — WHAT WORKFLOW DOESN'T EXIST YET?
Look at what's been built. What end-to-end workflow is missing? Not a page, not a button — an automated sequence of steps that runs without Ebin touching it. Something that starts with a trigger, processes automatically, outputs a result, and logs data for the next iteration.

Step 2 — DOES IT GET BETTER OVER TIME?
The best pipelines compound. The rent intelligence engine gets smarter as more landlords submit data. The tenant matching engine gets sharper as more tenants subscribe. Ask: "Does this workflow become 10x more valuable with 100 users than with 1?" If yes, prioritise it. If it's equally valuable at 1 user as at 1000 — reconsider.

Step 3 — DOES IT REDUCE EBIN'S MANUAL WORK OR MULTIPLY HIS INTELLIGENCE?
Ebin is one person. Every workflow that saves him 30 minutes per week is 26 hours per year back. Every system that makes him seem like he has a full team behind him wins landlord trust. Pipelines that run without him are worth 10x features he has to trigger manually.

Step 4 — IS THIS ZERO TO ONE OR ONE TO N?
Zero to one: a workflow that creates a new operational capability that didn't exist before (Ontario rent database, AI-powered lease renewal pipeline, predictive vacancy alert system).
One to N: a slight improvement to something existing (better button, faster load, new FAQ).
Propose zero to one workflows. Build one to N only if it serves a zero to one goal.

Step 5 — IS IT SHIPPABLE IN ONE SESSION?
Ambition without scope discipline is waste. The idea might be massive — but the implementation proposal should be scoped to one session. If the vision is a full tenant matching engine, propose the first workflow step: the preference intake form + matching cron + email alert. Ship that, then extend next time.

WORKFLOW IDEAS TO DRAW FROM (not exhaustive — think beyond these):
- Lease renewal pipeline: detect leases expiring in 90 days → calculate legal Ontario RTA rent increase → draft N1 notice → email Ebin for one-click approval → notice sent to tenant automatically
- Tenant pre-match workflow: subscriber signs up → preference form (city, budget, beds, pets, move-in) → when property published → auto-match → matched tenants emailed first before listing goes public
- Predictive vacancy alert: cron checks lease expiry dates → 90/60/30 day alerts to Ebin → admin dashboard shows pipeline of upcoming vacancies
- Maintenance request pipeline: tenant submits via public form → logged in Supabase → Ebin gets email with one-click acknowledge → tenant gets auto-confirmation → status tracked
- Smart lead response workflow: new lead arrives → AI drafts personalised reply based on their message → Ebin edits + sends in one click → response time tracked
- Rental market pulse workflow: nightly cron processes submissions → AI generates market narrative → published to public page → Prospera becomes the data authority
- Tenant screening scorecard: tenant applies → info structured into checklist → AI risk assessment → Ebin gets structured recommendation (not raw notes)
- Property performance digest: weekly cron → per-property summary (rent vs market, days vacant, upcoming renewals) → emailed to Ebin every Monday

CONSTRAINTS:
- NOT in the recently proposed list
- Buildable in one Claude Code session (ambitious scope, tight implementation)
- Must be a workflow (trigger → process → output → log), not just a UI page
- Must compound with data or users over time

Respond ONLY with valid JSON — no preamble, no explanation:
{
  "title": "Feature name (max 8 words)",
  "description": "What workflow it automates — 2-3 sentences. Name the trigger, the automation, the output.",
  "why": "Why this workflow now — connect to business data above AND the long-term platform vision.",
  "zero_to_one": "One sentence: what new operational capability does this create that didn't exist before?",
  "compounds_because": "One sentence: how does this workflow get better as more landlords or tenants use it?",
  "target_users": "founder | landlords | tenants | all",
  "effort": "low | medium | high",
  "risks": "One sentence on the main risk.",
  "mitigation": "One sentence on how to handle it.",
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
  "performance_notes": "Caching, DB indexes, or efficiency considerations. Or null."
}`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude returned no valid JSON");

  const proposal = JSON.parse(jsonMatch[0]);

  // ── Store proposal + generate approval token ──────────────────────────
  const supabase = getSupabaseAdmin();
  const approvalToken = crypto.randomUUID();

  // Merge zero_to_one + compounds_because into why for storage (single field)
  const enrichedWhy = [
    proposal.why,
    proposal.zero_to_one ? `Zero-to-one: ${proposal.zero_to_one}` : null,
    proposal.compounds_because ? `Compounds because: ${proposal.compounds_because}` : null,
  ].filter(Boolean).join("\n\n");

  const { data, error } = await supabase
    .from("tech_proposals")
    .insert([{
      title: proposal.title,
      description: proposal.description,
      why: enrichedWhy,
      risks: proposal.risks,
      mitigation: proposal.mitigation,
      steps: JSON.stringify(proposal.steps),
      effort: proposal.effort,
      target_users: proposal.target_users,
      performance_notes: proposal.performance_notes ?? null,
      status: "pending",
      approval_token: approvalToken,
      week_of: new Date().toISOString().split("T")[0],
      source: "cto_weekly_cron",
    }])
    .select()
    .single();

  if (error || !data) throw new Error(`DB insert failed: ${error?.message}`);

  // ── Email proposal to Ebin ────────────────────────────────────────────
  const base = "https://www.prosperaproperties.co";
  const approveUrl = `${base}/api/tech-decision?id=${data.id}&action=approve&token=${approvalToken}`;
  const denyUrl = `${base}/api/tech-decision?id=${data.id}&action=deny&token=${approvalToken}`;

  const stepsList = (proposal.steps as string[])
    .map((s: string, i: number) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EBE5;font-size:13px;color:#2C2C2C;">
          <strong style="color:#1F2F3A;font-size:12px;margin-right:8px;">${i + 1}.</strong>${s}
        </td>
      </tr>`)
    .join("");

  const effortColor = proposal.effort === "low" ? "#2D6A4F" : proposal.effort === "medium" ? "#B7791F" : "#8B2030";
  const weekStr = new Date().toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });

  const html = `
    <div style="font-family:sans-serif;max-width:620px;margin:0 auto;color:#2C2C2C;background:#FAF8F5;">
      <div style="background:#1F2F3A;padding:32px 36px;">
        <p style="color:#8B2030;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 8px;font-weight:600;">Prospera CTO Agent · ${weekStr}</p>
        <h1 style="color:#FAF8F5;font-size:26px;font-weight:300;margin:0;line-height:1.3;">Next feature proposal</h1>
      </div>

      <div style="padding:36px;background:white;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">

        <div style="margin-bottom:28px;">
          <h2 style="font-size:22px;color:#1F2F3A;font-weight:600;margin:0 0 6px;">${proposal.title}</h2>
          <div style="margin-bottom:16px;flex-wrap:wrap;">
            <span style="display:inline-block;font-size:11px;background:#F7F5F2;border:1px solid #D8D2C8;padding:3px 10px;border-radius:20px;color:#444;margin-right:8px;margin-bottom:4px;">For: ${proposal.target_users}</span>
            <span style="display:inline-block;font-size:11px;border:1px solid ${effortColor};padding:3px 10px;border-radius:20px;color:${effortColor};margin-right:8px;margin-bottom:4px;">Effort: ${proposal.effort}</span>
            <span style="display:inline-block;font-size:11px;background:#1F2F3A;padding:3px 10px;border-radius:20px;color:#FAF8F5;margin-bottom:4px;">Workflow · Zero → One</span>
          </div>
          <p style="font-size:15px;color:#1F2F3A;line-height:1.7;margin:0;font-weight:400;">${proposal.description}</p>
        </div>

        ${proposal.zero_to_one ? `
        <div style="margin-bottom:20px;padding:16px 20px;background:#1F2F3A;border-radius:4px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#8B2030;font-weight:600;margin:0 0 6px;">New operational capability</p>
          <p style="font-size:13px;color:#FAF8F5;line-height:1.6;margin:0;">${proposal.zero_to_one}</p>
        </div>` : ""}

        ${proposal.compounds_because ? `
        <div style="margin-bottom:20px;padding:16px 20px;background:#F0FFF4;border:1px solid #9AE6B4;border-radius:4px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#2D6A4F;font-weight:600;margin:0 0 6px;">Gets better with every user</p>
          <p style="font-size:13px;color:#2D6A4F;line-height:1.6;margin:0;">${proposal.compounds_because}</p>
        </div>` : ""}

        <div style="margin-bottom:24px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#8B2030;font-weight:600;margin:0 0 8px;">Why now</p>
          <p style="font-size:13px;color:#444;line-height:1.7;margin:0;padding:16px;background:#F7F5F2;border-left:3px solid #8B2030;">${proposal.why}</p>
        </div>

        <div style="margin-bottom:24px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#1F2F3A;font-weight:600;margin:0 0 10px;">Implementation steps</p>
          <table style="width:100%;border-collapse:collapse;">${stepsList}</table>
        </div>

        <div style="margin-bottom:32px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#1F2F3A;font-weight:600;margin:0 0 8px;">Risk &amp; mitigation</p>
          <p style="font-size:13px;color:#666;margin:0 0 4px;">⚠ ${proposal.risks}</p>
          <p style="font-size:13px;color:#2D6A4F;margin:0;">✓ ${proposal.mitigation}</p>
        </div>

        ${proposal.performance_notes ? `
        <div style="margin-bottom:32px;padding:14px 16px;background:#F7F5F2;border:1px solid #D8D2C8;border-radius:4px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#1F2F3A;font-weight:600;margin:0 0 6px;">Performance notes</p>
          <p style="font-size:13px;color:#444;margin:0;">${proposal.performance_notes}</p>
        </div>` : ""}

        <div style="border-top:2px solid #1F2F3A;padding-top:28px;">
          <p style="font-size:12px;color:#999;margin:0 0 16px;">Approve and building starts immediately. Deny and a different proposal comes next.</p>
          <div>
            <a href="${approveUrl}" style="display:inline-block;padding:16px 36px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-right:12px;">
              ✓ Approve — Build it
            </a>
            <a href="${denyUrl}" style="display:inline-block;padding:16px 28px;border:1px solid #8B2030;color:#8B2030;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
              ✕ Deny — Next idea
            </a>
          </div>
        </div>
      </div>

      <div style="padding:20px 36px;border:1px solid #E8E4DF;border-top:none;">
        <p style="font-size:11px;color:#B0B0B0;margin:0;">
          Prospera Properties · CTO Agent · Continuous build loop<br/>
          ${metrics.totalLeads} leads · ${metrics.totalSubscribers} subscribers · ${metrics.implementedTotal} features shipped
        </p>
      </div>
    </div>
  `;

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "Prospera CTO Agent <hello@prosperaproperties.co>",
      to: "prosperapropertiess@gmail.com",
      subject: `[CTO] Next feature: ${proposal.title}`,
      html,
    });
  }

  console.log("[cto-weekly] Proposal sent:", proposal.title, "| id:", data.id);
  return { title: proposal.title, id: data.id };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const metrics = await getBusinessMetrics();
    const result = await generateAndSendProposal(metrics);
    return NextResponse.json({ success: true, proposal: result.title, id: result.id });
  } catch (err) {
    console.error("[cto-weekly] Error:", err);
    return NextResponse.json({ error: "Failed", detail: String(err) }, { status: 500 });
  }
}
