import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// PATCH — autosave for session-level fields (inspector name, move-in date,
// meter readings). Body: { sessionId, ...fields }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const body = await req.json();
  const { sessionId, ...fields } = body;
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const allowed = ["inspector_name", "move_in_date", "meter_readings"];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (k in fields) patch[k] = fields[k];
  patch.updated_at = new Date().toISOString();

  const db = getSupabaseAdmin();
  const { data, error } = await db.from("move_in_sessions").update(patch).eq("id", sessionId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
