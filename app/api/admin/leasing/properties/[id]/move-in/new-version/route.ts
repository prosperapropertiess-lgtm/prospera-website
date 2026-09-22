/**
 * Explicit "start a revision" action — used when a completed/signed
 * move-in needs a content change afterward. Bumps report_version and
 * resets status to draft; existing signatures stay on record tied to
 * their original (now superseded) version, untouched.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data: session } = await db.from("move_in_sessions").select("report_version").eq("id", sessionId).single();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const { data, error } = await db
    .from("move_in_sessions")
    .update({ report_version: session.report_version + 1, status: "draft", finished_at: null })
    .eq("id", sessionId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
