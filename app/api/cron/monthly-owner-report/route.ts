import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { buildOwnerBundles, daysSince, type OwnerBundle } from "@/lib/notion";

// Runs on the 3rd of every month at 9am Eastern (13:00 UTC)
// Schedule: 0 13 3 * *

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `
You are writing a monthly property update email on behalf of Ebin Jaison at Prospera Properties.

TONE:
- Warm, friendly, and reassuring — like a trusted person who genuinely cares about their property
- Professional but not stiff
- Extremely personalized — use owner names, tenant names, specific numbers
- The owner should feel their property is in great hands
- Never generic

STRUCTURE (follow exactly):
1. Subject line: [Property Address] — [Month Year] Monthly Update from Prospera Properties
2. Greeting: address ALL owners by first name (e.g. "Hi Tina and Randy,")
3. One warm opening sentence about overall property status
4. RENT & INCOME — per unit if multi-unit, who paid, when, how much, any issues
5. FINANCIAL SNAPSHOT — this month summary table + year-to-date summary
6. MAINTENANCE — completed work (frame as wins), open items (reassure it's handled), days pending for open items. NEVER skip this section — say "No maintenance issues this month" if empty
7. TENANT & LEASE UPDATES — lease changes, upcoming renewals (flag anything within 90 days), month-to-month status
8. LEGAL & NOTICES — any N4s or legal actions (be factual, not alarming)
9. LOOKING AHEAD — anything coming next month, any decisions needed from owner
10. Warm closing, invite questions
11. Sign off as: Ebin / Prospera Properties / prosperapropertiess@gmail.com / (519) 697-1227

RULES:
- Use real names and real numbers from the data — never placeholders
- Flag lease expiring within 90 days with exact date and recommended action
- For open maintenance: always include how many days it has been pending
- For YTD: calculate and include total rent collected, total expenses, net
- Write in plain text friendly email style — no markdown headers, just clear paragraphs
- Output the subject line on the first line prefixed with "SUBJECT: "
- Then a blank line
- Then the full email body
`.trim();

function formatDollars(n: number | null | undefined): string {
  if (n == null) return "$0";
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string | null): string {
  if (!d) return "unknown date";
  return new Date(d).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
}

function bundleToDataSummary(bundle: OwnerBundle): string {
  const lines: string[] = [];

  lines.push(`REPORT MONTH: ${bundle.month} ${bundle.year}`);
  lines.push(`OWNERS: ${bundle.owners.map(o => `${o.name} (${o.email}, ${o.phone})${o.notes ? " — " + o.notes : ""}`).join(" | ")}`);
  lines.push("");

  for (const { property, tenants, rentCurrentMonth, rentPreviousMonth, rentYTD, maintenanceOpen, maintenanceCompletedRecent, expensesCurrentMonth, expensesPreviousMonth, expensesYTD } of bundle.properties) {
    lines.push(`=== PROPERTY: ${property.name} — ${property.address}, ${property.city} ===`);
    lines.push(`Type: ${property.type} | Status: ${property.status} | Bedrooms: ${property.bedrooms ?? "?"} | Bathrooms: ${property.bathrooms ?? "?"}`);
    if (property.notes) lines.push(`Property notes: ${property.notes}`);
    lines.push("");

    // Tenants
    lines.push("-- TENANTS --");
    if (tenants.length === 0) {
      lines.push("No tenants on file.");
    } else {
      for (const t of tenants) {
        const leaseEnd = t.leaseEnd;
        const daysToExpiry = leaseEnd ? Math.floor((new Date(leaseEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
        const expiryFlag = daysToExpiry !== null && daysToExpiry <= 90 && daysToExpiry > 0
          ? ` ⚠️ LEASE EXPIRES IN ${daysToExpiry} DAYS (${formatDate(leaseEnd)})`
          : daysToExpiry !== null && daysToExpiry <= 0
            ? ` ⚠️ LEASE EXPIRED ${Math.abs(daysToExpiry)} DAYS AGO`
            : "";
        lines.push(`  ${t.name} | Status: ${t.status} | Rent: ${formatDollars(t.monthlyRent)}/mo | Lease: ${formatDate(t.leaseStart)} → ${formatDate(t.leaseEnd)}${expiryFlag}`);
        if (t.email) lines.push(`    Email: ${t.email} | Phone: ${t.phone}`);
        if (t.notes) lines.push(`    Notes: ${t.notes}`);
      }
    }
    lines.push("");

    // Rent — current month
    lines.push(`-- RENT: ${bundle.month.toUpperCase()} ${bundle.year} --`);
    if (rentCurrentMonth.length === 0) {
      lines.push("No rent entries found for this month.");
    } else {
      for (const r of rentCurrentMonth) {
        lines.push(`  ${r.entry}: Due ${formatDollars(r.amountDue)} | Paid ${formatDollars(r.amountPaid)} | Status: ${r.paymentStatus}${r.datePaid ? ` | Date paid: ${formatDate(r.datePaid)}` : ""}${r.notes ? ` | Note: ${r.notes}` : ""}`);
      }
      const totalDue = rentCurrentMonth.reduce((s, r) => s + (r.amountDue ?? 0), 0);
      const totalPaid = rentCurrentMonth.reduce((s, r) => s + (r.amountPaid ?? 0), 0);
      lines.push(`  TOTAL: Due ${formatDollars(totalDue)} | Collected ${formatDollars(totalPaid)}${totalPaid < totalDue ? ` | Outstanding: ${formatDollars(totalDue - totalPaid)}` : ""}`);
    }
    lines.push("");

    // Rent — previous month
    lines.push(`-- RENT: PREVIOUS MONTH (for context) --`);
    if (rentPreviousMonth.length === 0) {
      lines.push("No previous month entries.");
    } else {
      for (const r of rentPreviousMonth) {
        lines.push(`  ${r.entry}: ${r.paymentStatus}${r.datePaid ? ` on ${formatDate(r.datePaid)}` : ""}`);
      }
    }
    lines.push("");

    // Expenses — current month
    const expCurrentTotal = expensesCurrentMonth.reduce((s, e) => s + (e.amount ?? 0), 0);
    lines.push(`-- EXPENSES: ${bundle.month.toUpperCase()} ${bundle.year} (${expensesCurrentMonth.length} items, total: ${formatDollars(expCurrentTotal)}) --`);
    if (expensesCurrentMonth.length === 0) {
      lines.push("No expenses this month.");
    } else {
      for (const e of expensesCurrentMonth) {
        lines.push(`  ${e.date ? formatDate(e.date) : "?"} | ${e.description} | ${e.category} | ${formatDollars(e.amount)}`);
      }
    }
    lines.push("");

    // YTD financials
    const ytdRentCollected = rentYTD.reduce((s, r) => s + (r.amountPaid ?? 0), 0);
    const ytdRentDue = rentYTD.reduce((s, r) => s + (r.amountDue ?? 0), 0);
    const ytdExpenses = expensesYTD.reduce((s, e) => s + (e.amount ?? 0), 0);
    const ytdNet = ytdRentCollected - ytdExpenses;
    lines.push(`-- YEAR-TO-DATE (Jan 1 – ${bundle.month} ${bundle.year}) --`);
    lines.push(`  Rent due YTD: ${formatDollars(ytdRentDue)}`);
    lines.push(`  Rent collected YTD: ${formatDollars(ytdRentCollected)}`);
    lines.push(`  Expenses YTD: ${formatDollars(ytdExpenses)}`);
    lines.push(`  Net YTD: ${formatDollars(ytdNet)}`);
    lines.push("");

    // Maintenance — open
    lines.push(`-- OPEN MAINTENANCE (${maintenanceOpen.length} items) --`);
    if (maintenanceOpen.length === 0) {
      lines.push("No open maintenance items.");
    } else {
      for (const m of maintenanceOpen) {
        lines.push(`  [${m.priority.toUpperCase()}] ${m.issue} | Category: ${m.category} | Status: ${m.status}${m.daysPending !== null ? ` | ${m.daysPending} days pending` : ""}${m.dateReported ? ` | Reported: ${formatDate(m.dateReported)}` : ""}${m.reportedBy ? ` by ${m.reportedBy}` : ""}${m.cost ? ` | Est. cost: ${formatDollars(m.cost)}` : ""}${m.notes ? ` | Notes: ${m.notes}` : ""}`);
      }
    }
    lines.push("");

    // Maintenance — recently completed
    lines.push(`-- MAINTENANCE COMPLETED (last 60 days) --`);
    if (maintenanceCompletedRecent.length === 0) {
      lines.push("No maintenance completed recently.");
    } else {
      for (const m of maintenanceCompletedRecent) {
        lines.push(`  ✓ ${m.issue} | Completed: ${formatDate(m.dateCompleted)}${m.cost ? ` | Cost: ${formatDollars(m.cost)}` : ""}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Report on the previous month
  const now = new Date();
  const reportDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const month = MONTHS[reportDate.getMonth()];
  const year = reportDate.getFullYear();

  const results: Array<{ owners: string; status: string; error?: string }> = [];

  try {
    const bundles = await buildOwnerBundles(month, year);

    if (!bundles.length) {
      return NextResponse.json({ message: "No owner bundles found.", month, year });
    }

    for (const bundle of bundles) {
      const ownerNames = bundle.owners.map(o => o.name).join(" & ");

      try {
        // Build data summary to feed to Claude
        const dataSummary = bundleToDataSummary(bundle);

        // Ask Claude to write the email
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 3000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `Write the monthly owner report email using the following Notion data:\n\n${dataSummary}`,
          }],
        });

        const rawEmail = response.content[0].type === "text" ? response.content[0].text.trim() : "";

        // Extract subject line
        const subjectMatch = rawEmail.match(/^SUBJECT:\s*(.+)/m);
        const subject = subjectMatch?.[1]?.trim() ?? `${month} ${year} — Property Update from Prospera Properties`;
        const body = rawEmail.replace(/^SUBJECT:.*\n?/m, "").trim();

        // Convert plain text to basic HTML for email
        const htmlBody = `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#222;font-size:15px;line-height:1.7;">
            <div style="background:#1F2F3A;padding:24px 32px;margin-bottom:32px;">
              <p style="color:#FAF8F5;font-size:13px;margin:0;letter-spacing:1px;">PROSPERA PROPERTIES — DRAFT FOR REVIEW</p>
              <p style="color:rgba(250,248,245,0.5);font-size:12px;margin:8px 0 0;">For: ${ownerNames} · ${month} ${year}</p>
            </div>
            <div style="padding:0 32px 32px;">
              ${body.split("\n\n").map(para =>
                para.trim() ? `<p style="margin:0 0 16px;">${para.replace(/\n/g, "<br/>")}</p>` : ""
              ).join("")}
            </div>
            <div style="background:#F5F5F5;padding:16px 32px;font-size:12px;color:#888;border-top:1px solid #E0E0E0;">
              ⚠️ DRAFT — Review and send manually to: ${bundle.owners.filter(o => o.email).map(o => `${o.name} &lt;${o.email}&gt;`).join(", ")}
            </div>
          </div>
        `;

        // Send draft to Ebin only — NOT to owners
        await resend.emails.send({
          from: "Prospera Reports <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          subject: `[DRAFT] ${subject}`,
          html: htmlBody,
        });

        results.push({ owners: ownerNames, status: "draft sent to Ebin" });
      } catch (err: any) {
        results.push({ owners: ownerNames, status: "error", error: err?.message });
      }
    }

    return NextResponse.json({ success: true, month, year, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
