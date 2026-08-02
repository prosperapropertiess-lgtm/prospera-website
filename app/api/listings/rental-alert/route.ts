import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, city, bedrooms, property_type, price_max } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    // Upsert into subscribers table — same table used for blog/market alerts
    await db.from("subscribers").upsert(
      {
        email: email.toLowerCase().trim(),
        rental_alert: true,
        rental_alert_city: city || null,
        rental_alert_bedrooms: bedrooms || null,
        rental_alert_type: property_type || null,
        rental_alert_price_max: price_max || null,
        rental_alert_at: new Date().toISOString(),
      },
      { onConflict: "email", ignoreDuplicates: false }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[rental-alert]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
