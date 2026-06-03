import { NextRequest, NextResponse } from "next/server";
import { buildOwnerReports } from "@/lib/notion";
import { ownerMonthlyReportEmail } from "@/lib/emails";
import { Resend } from "resend";

// Runs on the 4th of every month at 9am Eastern
// Schedule: 0 13 4 * *  (13:00 UTC = 9:00 AM EST)

export async function GET(req: NextRequest) {
  // Verify this is coming from Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Determine which month to report on — the previous month
  const now = new Date();
  const reportDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month = reportDate.toLocaleString("en-CA", { month: "long" });
  const year = reportDate.getFullYear();

  const results: Array<{ owner: string; email: string; status: string; error?: string }> = [];

  try {
    const reports = await buildOwnerReports(month, year);

    if (!reports.length) {
      return NextResponse.json({ message: "No owners with email addresses found.", month, year });
    }

    for (const report of reports) {
      try {
        const { subject, html } = ownerMonthlyReportEmail(report);

        await resend.emails.send({
          from: "Ebin at Prospera <hello@prosperaproperties.co>",
          to: report.owner.email,
          bcc: "prosperapropertiess@gmail.com", // Ebin gets a copy of every report sent
          subject,
          html,
        });

        results.push({ owner: report.owner.name, email: report.owner.email, status: "sent" });
      } catch (err: any) {
        results.push({ owner: report.owner.name, email: report.owner.email, status: "error", error: err?.message });
      }
    }

    return NextResponse.json({ success: true, month, year, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
