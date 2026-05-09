import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { monthlyRentTrendsEmail } from "@/lib/emails";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all published market data
  const { data: marketRows } = await supabaseAdmin
    .from("rent_market_data")
    .select("city, bedrooms, median_rent, trend_direction, market_narrative")
    .eq("is_published", true)
    .order("city")
    .order("bedrooms");

  if (!marketRows || marketRows.length === 0) {
    console.log("Monthly trends: no market data yet, skipping.");
    return NextResponse.json({ success: true, sent: 0, reason: "no_market_data" });
  }

  // Fetch opted-in landlords
  const { data: subscribers } = await supabaseAdmin
    .from("subscribers")
    .select("email, name, preferred_city")
    .eq("type", "landlord")
    .eq("rent_monthly_optin", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ success: true, sent: 0, reason: "no_subscribers" });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ success: false, error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  const now = new Date();
  const month = now.toLocaleString("en-CA", { month: "long", year: "numeric" });

  // Group market data by city
  const byCity: Record<string, typeof marketRows> = {};
  for (const row of marketRows) {
    if (!byCity[row.city]) byCity[row.city] = [];
    byCity[row.city].push(row);
  }

  // Send in batches of 50 to avoid function timeout on large lists
  const BATCH_SIZE = 50;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (sub) => {
        const city = sub.preferred_city || "London";
        const cityData = byCity[city];
        if (!cityData || cityData.length === 0) return;

        try {
          const { error } = await resend.emails.send({
            from: "Laura at Prospera <hello@prosperaproperties.co>",
            to: sub.email,
            subject: `${city} rental market — ${month}`,
            html: monthlyRentTrendsEmail({ name: sub.name, city, data: cityData, month }),
          });
          if (error) {
            console.error(`[monthly-trends] Resend error for ${sub.email}:`, error);
            failed++;
          } else {
            sent++;
          }
        } catch (err) {
          console.error(`[monthly-trends] Failed to send to ${sub.email}:`, err);
          failed++;
        }
      })
    );

    // Small pause between batches to respect Resend rate limits
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`[monthly-trends] Done — sent: ${sent}, failed: ${failed}, total: ${subscribers.length}`);
  return NextResponse.json({ success: true, sent, failed, total: subscribers.length });
}
