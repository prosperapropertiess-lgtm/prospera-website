import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  const { data } = await supabaseAdmin
    .from("rent_submissions")
    .select("submitted_at, city, token")
    .eq("submission_type", "initial_analysis")
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return NextResponse.json({ activity: null });

  // Get first name from token row
  let firstName: string | null = null;
  if (data.token) {
    const { data: tokenRow } = await supabaseAdmin
      .from("rent_analysis_tokens")
      .select("name")
      .eq("token", data.token)
      .maybeSingle();
    firstName = tokenRow?.name?.split(" ")[0] ?? null;
  }

  return NextResponse.json({
    activity: {
      name: firstName ?? "A landlord",
      city: data.city,
      submitted_at: data.submitted_at,
    },
  });
}
