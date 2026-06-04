import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { buildOwnerBundles, type OwnerBundle } from "@/lib/notion";
import {
  buildEmailHTML,
  formatDate,
  formatDollars,
  type ClaudeNarrative,
} from "@/lib/owner-report-email";

// Runs on the 3rd of every month at 9am Eastern (13:00 UTC)
// Schedule: 0 13 3 * *

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Claude system prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You write narrative content for monthly property update emails from Ebin Jaison at Prospera Properties.

Return ONLY valid JSON matching this exact structure (no markdown, no extra text):
{
  "subject": "string — e.g. 27 Horton St — June 2026 Monthly Update from Prospera Properties",
  "openingSentence": "string — 1 warm specific sentence about this month's portfolio performance",
  "lookingAhead": [
    { "title": "string", "description": "string — specific, actionable, 1-2 sentences" }
  ],
  "criticalAlert": {
    "title": "string",
    "body": "string — specific detail, max 2 sentences",
    "ctaLabel": "string — e.g. Reply to Confirm, Approve Renewal"
  },
  "closingNote": "string — 1 warm sentence",
  "joke": "string — one short punchy joke about landlords, tenants, or real estate. Must be original and actually funny."
}

Rules:
- criticalAlert: include ONLY if there is a lease expiring within 90 days or urgent/critical maintenance — otherwise use JSON null (not a string)
- lookingAhead: 2–3 items, specific to this property and month
- Use real names and details from the data — never placeholders
- openingSentence: upbeat and specific, not generic
- joke: keep it clean, relevant to real estate/landlords/tenants, max 2 sentences
`.trim();

// ── Data summary for Claude ────────────────────────────────────────────────

function bundleToDataSummary(bundle: OwnerBundle): string {
  const lines: string[] = [];
  lines.push(`REPORT MONTH: ${bundle.month} ${bundle.year}`);
  lines.push(`OWNERS: ${bundle.owners.map(o => `${o.name} (${o.email})`).join(" | ")}`);
  lines.push("");

  for (const { property, tenants, rentCurrentMonth, maintenanceOpen, maintenanceCompletedRecent, expensesCurrentMonth } of bundle.properties) {
    lines.push(`PROPERTY: ${property.address}, ${property.city} — ${property.type} — ${property.status}`);

    lines.push("TENANTS:");
    if (tenants.length === 0) {
      lines.push("  No tenants on file.");
    } else {
      for (const t of tenants) {
        const leaseEnd = t.leaseEnd;
        const daysToExpiry = leaseEnd
          ? Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5)
          : null;
        const flag = daysToExpiry !== null && daysToExpiry <= 90
          ? ` ⚠️ EXPIRES IN ${daysToExpiry} DAYS (${formatDate(leaseEnd)})`
          : "";
        lines.push(`  ${t.name} | ${formatDollars(t.monthlyRent)}/mo | Lease: ${formatDate(t.leaseStart)} → ${formatDate(t.leaseEnd)}${flag}`);
      }
    }

    lines.push("RENT THIS MONTH:");
    if (rentCurrentMonth.length === 0) {
      lines.push("  No rent entries.");
    } else {
      for (const r of rentCurrentMonth) {
        lines.push(`  ${r.entry}: ${r.paymentStatus}${r.datePaid ? ` on ${formatDate(r.datePaid)}` : ""}`);
      }
    }

    lines.push("OPEN MAINTENANCE:");
    if (maintenanceOpen.length === 0) {
      lines.push("  None.");
    } else {
      for (const m of maintenanceOpen) {
        lines.push(`  [${m.priority.toUpperCase()}] ${m.issue} — ${m.daysPending ?? "?"}d pending`);
      }
    }

    lines.push("RECENTLY COMPLETED MAINTENANCE:");
    if (maintenanceCompletedRecent.length === 0) {
      lines.push("  None.");
    } else {
      for (const m of maintenanceCompletedRecent) {
        lines.push(`  ✓ ${m.issue} (${formatDate(m.dateCompleted)})`);
      }
    }

    lines.push("EXPENSES THIS MONTH:");
    if (expensesCurrentMonth.length === 0) {
      lines.push("  No expenses.");
    } else {
      for (const e of expensesCurrentMonth) {
        lines.push(`  ${e.category}: ${formatDollars(e.amount)} — ${e.description}`);
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Report on the current month
  const now = new Date();
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  const results: Array<{ owners: string; status: string; error?: string }> = [];

  try {
    const bundles = await buildOwnerBundles(month, year);

    if (!bundles.length) {
      return NextResponse.json({ message: "No owner bundles found.", month, year });
    }

    for (const bundle of bundles) {
      const ownerNames = bundle.owners.map(o => o.name).join(" & ");

      try {
        const dataSummary = bundleToDataSummary(bundle);

        // Ask Claude for narrative JSON
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `Write the narrative JSON for the monthly owner report using this Notion data:\n\n${dataSummary}`,
          }],
        });

        const rawText = response.content[0].type === "text" ? response.content[0].text.trim() : "{}";

        // Strip markdown code fences if present
        const jsonText = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

        let narrative: ClaudeNarrative;
        try {
          narrative = JSON.parse(jsonText);
        } catch {
          // Fallback narrative if JSON parse fails
          narrative = {
            subject: `${month} ${year} — Property Update from Prospera Properties`,
            openingSentence: `Here is your ${month} ${year} property update.`,
            lookingAhead: [{ title: "Review Report", description: "Please review the details below and reach out with any questions." }],
            criticalAlert: null,
            closingNote: "As always, don't hesitate to reach out.",
            joke: "Why don't landlords ever get lost? Because they always know their way around the property!",
          };
        }

        const htmlBody = buildEmailHTML(bundle, narrative, ownerNames, false);

        const ownerEmails = [...new Set(bundle.owners.map(o => o.email).filter(Boolean))];
        await resend.emails.send({
          from: "Prospera Reports <hello@prosperaproperties.co>",
          to: ownerEmails,
          cc: ["prosperapropertiess@gmail.com"],
          subject: narrative.subject,
          html: htmlBody,
        });

        // Build financial summary for debugging
        const financials = bundle.properties.map(pr => {
          const effectivePaid = (r: { amountPaid: number | null; amountDue: number | null; paymentStatus: string }) => {
            const s = (r.paymentStatus ?? "").toLowerCase().trim();
            return r.amountPaid ?? ((s === "paid" || s === "on time" || s === "partial") ? (r.amountDue ?? 0) : 0);
          };
          const rentCollected = pr.rentCurrentMonth.reduce((s, r) => s + effectivePaid(r), 0);
          const rentDue = pr.rentCurrentMonth.reduce((s, r) => s + (r.amountDue ?? 0), 0);
          const expenses = pr.expensesCurrentMonth.reduce((s, e) => s + (e.amount ?? 0), 0);
          const ytd = pr.rentYTD.reduce((s, r) => s + effectivePaid(r), 0);
          return {
            property: pr.property.address,
            rentEntries: pr.rentCurrentMonth.length,
            rentCollected,
            rentDue,
            expenses,
            expenseEntries: pr.expensesCurrentMonth.length,
            netToOwner: rentCollected - expenses,
            ytd,
            ytdEntries: pr.rentYTD.length,
          };
        });
        results.push({ owners: ownerNames, status: `sent to ${ownerEmails.join(", ")}`, financials } as any);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ owners: ownerNames, status: "error", error: message });
      }
    }

    return NextResponse.json({ success: true, month, year, results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
