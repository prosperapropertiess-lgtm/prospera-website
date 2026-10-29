import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const OPEN_REPAIRS = ["submitted", "acknowledged", "triage", "vendor_assigned", "scheduled", "work_complete"];

// GET /api/admin/home: the handful of numbers and lists the admin home page shows.
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [apps, leads, repairs, listings, moveIns] = await Promise.all([
    db.from("applications")
      .select("id, tenant_name, status, ai_summary, created_at, properties(address, title)")
      .in("status", ["pending", "processing", "reviewed"])
      .order("created_at", { ascending: false })
      .limit(5),
    db.from("leads")
      .select("id, name, email, type, created_at", { count: "exact" })
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(5),
    db.from("tenant_maintenance_requests")
      .select("id", { count: "exact", head: true })
      .in("status", OPEN_REPAIRS),
    db.from("properties").select("status"),
    db.from("move_in_sessions")
      .select("id", { count: "exact", head: true })
      .is("finished_at", null),
  ]);

  const statuses = (listings.data ?? []).map((p) => p.status);

  return NextResponse.json({
    applications: apps.data ?? [],
    applicationsWaiting: apps.data?.length ?? 0,
    leads: leads.data ?? [],
    leadsThisWeek: leads.count ?? 0,
    openRepairs: repairs.count ?? 0,
    published: statuses.filter((s) => s === "published").length,
    drafts: statuses.filter((s) => s !== "published").length,
    moveInsInProgress: moveIns.count ?? 0,
    errors: [apps, leads, repairs, listings, moveIns].map((r) => r.error?.message).filter(Boolean),
  });
}
