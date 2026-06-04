import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("onboarding_sessions")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
