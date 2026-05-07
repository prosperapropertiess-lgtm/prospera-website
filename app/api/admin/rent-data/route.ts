import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { city, unit_type, bedrooms, rent_amount, is_asking_rent, source_note } = await req.json();

  if (!city || !bedrooms || !rent_amount) {
    return NextResponse.json({ error: "city, bedrooms, and rent_amount are required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("rent_submissions").insert([{
    submission_type: "manual_entry",
    city,
    unit_type: unit_type || null,
    bedrooms: Number(bedrooms),
    rent_amount: Number(rent_amount),
    is_asking_rent: is_asking_rent ?? true,
    source_note: source_note || null,
  }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return updated counts
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [{ count: weekCount }, { count: totalCount }] = await Promise.all([
    supabase.from("rent_submissions").select("*", { count: "exact", head: true }).eq("submission_type", "manual_entry").gte("submitted_at", weekAgo).then(r => r),
    supabase.from("rent_submissions").select("*", { count: "exact", head: true }).eq("submission_type", "manual_entry").then(r => r),
  ]);

  return NextResponse.json({ success: true, week_count: weekCount ?? 0, total_count: totalCount ?? 0 });
}
