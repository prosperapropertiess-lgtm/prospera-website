import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const { sessionId, name, location } = await req.json();
  if (!sessionId || !name?.trim()) return NextResponse.json({ error: "sessionId and name required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { count } = await db.from("move_in_appliances").select("id", { count: "exact", head: true }).eq("session_id", sessionId);
  const { data, error } = await db
    .from("move_in_appliances")
    .insert({ session_id: sessionId, name: name.trim(), location: location?.trim() || null, sort_order: count ?? 0 })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
