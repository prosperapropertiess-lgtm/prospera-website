import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Platform knowledge injected into every CTO prompt ──────────────────────
const PLATFORM_CONTEXT = `
You are the CTO of Prospera Properties — a property management company in London, St. Thomas, and Strathroy, Ontario, Canada. Founded by Ebin Jaison — sole operator, personal brand.

TECH STACK: Next.js 16 (App Router), Tailwind CSS v4, Framer Motion, Supabase (postgres + storage + auth), Resend (email), Anthropic Claude API, Zoho CRM, Meta Ads API, Vercel (hosting + crons).

PAGES LIVE:
- / (homepage with stats, how-it-works, testimonials, CTA)
- /landlords (pain points, process stepper, rent estimator, pricing table, FAQ)
- /tenants (features, process, listings preview, FAQ)
- /listings (grid with filters), /listings/[id] (detail + commute)
- /pricing (comparison table)
- /about (Ebin's story)
- /blog (SEO engine, markdown posts), /blog/[slug]
- /areas/london, /areas/st-thomas, /areas/strathroy (+ neighbourhood sub-pages)
- /contact (landlord + tenant forms)
- /faq
- /resources (PDF downloads with email gate)
- /rent-analysis/[token] (AI rent intelligence for landlords)
- /admin (login, dashboard with Zoho + Meta + outreach, property management)

KEY FEATURES ALREADY BUILT:
- AI chat widget (Laura) — Claude Haiku, hot lead detection, Resend alerts
- Rent intelligence engine — landlords fill detailed form, Claude Sonnet writes personal analysis, emailed instantly
- AI rent market data — nightly cron computes percentiles, Haiku writes narratives
- Newsletter popup (landlord + tenant variants) → Supabase subscribers
- Zoho CRM sync on every subscriber/lead
- Meta Ads dashboard in admin
- Outreach logging in admin
- Social post draft → email approval → auto-post to Facebook
- Tech proposal system — CTO agent proposes features weekly, Ebin approves/denies via email
- N4 notice PDF generator (free tool for landlords)
- Free resources page (PDF gate, Supabase storage)
- SEO: sitemap, robots.txt, JSON-LD, blog with 40+ posts, city landing pages
- Monthly rent trends email to opted-in landlords

DESIGN SYSTEM (always follow):
- Navy #1F2F3A — navbar, footer, dark sections
- Burgundy #8B2030 — primary CTA buttons ONLY, one accent per section max
- Background #F7F5F2 warm cream
- White #FFFFFF for cards
- Border #D8D2C8
- Text: #222222 primary, #444444 secondary, #999999 muted
- Fonts: var(--font-cormorant) headings, var(--font-dm-sans) body
- Spacing: py-24 standard, max-w-5xl wide, max-w-4xl standard
- Animations: Framer Motion FadeIn on scroll, under 0.4s

WHAT NOT TO DO:
- No gold/teal/other accent colors — only the palette above
- No burgundy on labels, dots, or decorative elements
- No two full buttons side by side
- No abstract icons
- No new paid services unless critical
`;

// ── Pull real business metrics from Supabase ────────────────────────────────
async function getBusinessMetrics() {
  const supabase = getSupabaseAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const metrics = await getBusinessMetrics();

    const recentProposalsList = metrics.recentProposals
      .map((p) => `- "${p.title}" (${p.status}, week of ${p.week_of})`)
      .join("\n") || "None yet — this is the first week.";

    // ── Ask Claude to propose the week's feature ──────────────────────────
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: PLATFORM_CONTEXT,
      messages: [
        {
          role: "user",
          content: `Today is ${new Date().toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

BUSINESS DATA THIS WEEK:
- New leads (contact form): ${metrics.newLeads} (${metrics.totalLeads} total)
- New email subscribers: ${metrics.newSubscribers} (${metrics.totalSubscribers} total)
- Rent analysis requests: ${metrics.rentRequests}
- Outreach logged by Ebin: ${metrics.outreachThisWeek}
- Features shipped to date: ${metrics.implementedTotal}

RECENTLY PROPOSED (do not repeat these):
${recentProposalsList}

TASK:
Propose exactly ONE feature to build this week. It must be:
1. Something NOT in the recently proposed list above
2. Buildable in a single Claude Code session (1-3 hours max)
3. Directly improving leads, conversion, tenant/landlord experience, OR Ebin's efficiency
4. Technically sound for our stack (Next.js 16, Tailwind v4, Supabase, Framer Motion)
5. Small scope — one new component, one new API route, or one enhancement to an existing page

Think like a startup CTO who ships weekly. Pick the highest-impact small thing.

Respond ONLY with valid JSON matching this exact structure:
{
  "title": "Short feature name (max 8 words)",
  "description": "What it does — 2-3 sentences, plain language",
  "why": "Why it matters for the business right now — 2-3 sentences connecting to this week's data",
  "target_users": "founder | landlords | tenants | all",
  "effort": "low | medium | high",
  "risks": "One sentence on the main risk",
  "mitigation": "One sentence on how to mitigate it",
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "performance_notes": "Any caching, DB index, or efficiency notes. Or null."
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

    const { data, error } = await supabase
      .from("tech_proposals")
      .insert([{
        title: proposal.title,
        description: proposal.description,
        why: proposal.why,
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
          <p style="color:#8B2030;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 8px;font-weight:600;">Prospera CTO Agent · Week of ${weekStr}</p>
          <h1 style="color:#FAF8F5;font-size:26px;font-weight:300;margin:0;line-height:1.3;">This week's feature proposal</h1>
        </div>

        <div style="padding:36px;background:white;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">

          <div style="margin-bottom:28px;">
            <h2 style="font-size:22px;color:#1F2F3A;font-weight:600;margin:0 0 6px;">${proposal.title}</h2>
            <div style="display:flex;gap:12px;margin-bottom:16px;">
              <span style="font-size:11px;background:#F7F5F2;border:1px solid #D8D2C8;padding:3px 10px;border-radius:20px;color:#444;">For: ${proposal.target_users}</span>
              <span style="font-size:11px;border:1px solid ${effortColor};padding:3px 10px;border-radius:20px;color:${effortColor};">Effort: ${proposal.effort}</span>
            </div>
            <p style="font-size:14px;color:#2C2C2C;line-height:1.7;margin:0;">${proposal.description}</p>
          </div>

          <div style="margin-bottom:24px;">
            <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#8B2030;font-weight:600;margin:0 0 8px;">Why this week</p>
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
            <p style="font-size:12px;color:#999;margin:0 0 16px;">Approve to build it this week. Deny to skip and propose something different next week.</p>
            <div>
              <a href="${approveUrl}" style="display:inline-block;padding:16px 36px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-right:12px;">
                ✓ Approve — Build it
              </a>
              <a href="${denyUrl}" style="display:inline-block;padding:16px 28px;border:1px solid #8B2030;color:#8B2030;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
                ✕ Deny — Skip
              </a>
            </div>
          </div>
        </div>

        <div style="padding:20px 36px;border:1px solid #E8E4DF;border-top:none;">
          <p style="font-size:11px;color:#B0B0B0;margin:0;">
            Prospera Properties · CTO Agent · Auto-generated every Monday<br/>
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
        subject: `[CTO] This week's feature: ${proposal.title}`,
        html,
      });
    }

    console.log("[cto-weekly] Proposal sent:", proposal.title);
    return NextResponse.json({ success: true, proposal: proposal.title, id: data.id });

  } catch (err) {
    console.error("[cto-weekly] Error:", err);
    return NextResponse.json({ error: "Failed", detail: String(err) }, { status: 500 });
  }
}
