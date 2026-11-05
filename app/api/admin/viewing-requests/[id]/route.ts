import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "contacted", "viewing_booked", "not_a_fit", "closed"];

// PATCH { status?, staff_note? }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Unknown status" }, { status: 400 });
    patch.status = body.status;
  }
  if (body.staff_note !== undefined) patch.staff_note = String(body.staff_note).slice(0, 2000) || null;
  const { error } = await getSupabaseAdmin().from("viewing_requests").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
