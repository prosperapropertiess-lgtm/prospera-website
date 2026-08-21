import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { MAINTENANCE_STATUSES, logWorkOrderEvent } from "@/lib/maintenance-data";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, note } = body as { status?: string; note?: string };

  if (!status || !MAINTENANCE_STATUSES.includes(status as typeof MAINTENANCE_STATUSES[number])) {
    return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: current, error: loadErr } = await db
    .from("tenant_maintenance_requests")
    .select("id, status")
    .eq("id", id)
    .single();
  if (loadErr || !current) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (note?.trim()) patch.admin_notes = note.trim();
  if (status === "closed" || status === "verified") patch.resolved_at = new Date().toISOString();

  const { data: updated, error } = await db
    .from("tenant_maintenance_requests")
    .update(patch)
    .eq("id", id)
    .select("*, vendors(id, name, trade, phone)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logWorkOrderEvent(id, "STATUS_CHANGED", "Admin", { from: current.status, to: status, note: note?.trim() || undefined });

  return NextResponse.json({ request: updated });
}
