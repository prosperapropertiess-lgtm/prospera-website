import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 300; // cache for 5 minutes

const FIRST_NAMES = [
  "James", "Sarah", "Mike", "Karen", "David", "Linda", "Chris", "Michelle",
  "Ryan", "Jennifer", "Kevin", "Patricia", "Brian", "Lisa", "Mark", "Sandra",
  "Jason", "Donna", "Andrew", "Carol", "Steve", "Amanda", "Paul", "Melissa",
  "Dan", "Sharon", "Tom", "Nancy", "Greg", "Laura", "Jeff", "Betty",
  "Scott", "Dorothy", "Eric", "Ashley", "Matt", "Kimberly", "Adam", "Emily",
];

function randomName(): string {
  return FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
}

export async function GET() {
  const { data } = await supabaseAdmin
    .from("rent_submissions")
    .select("submitted_at, city")
    .eq("submission_type", "initial_analysis")
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return NextResponse.json({ activity: null });

  return NextResponse.json({
    activity: {
      name: randomName(),
      city: data.city,
      submitted_at: data.submitted_at,
    },
  });
}
