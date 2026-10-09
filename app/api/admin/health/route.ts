import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// Single aggregated view of "is everything actually okay" — the thing I
// kept manually curl-testing my way to an answer for, all session. Same
// checks the listings-integrity cron runs, plus a live snapshot of every
// listing and every application that still needs a decision.
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const [listingsRes, pendingAppsRes, activeAgentsRes, unexpectedDraftsRes] = await Promise.all([
    supabase
      .from("properties")
      .select("id, address, city, status, is_managed, available, published_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id, tenant_name, status, created_at, property_id")
      .in("status", ["pending", "processing", "reviewed"])
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("agents").select("id, name, is_active").eq("is_active", true),
    supabase.from("properties").select("id, address, city, published_at").eq("status", "draft").not("published_at", "is", null),
  ]);

  const issues: string[] = [];
  if (!activeAgentsRes.data?.length) {
    issues.push("No active agent — every apply link on the site is currently broken.");
  }
  if (unexpectedDraftsRes.data?.length) {
    for (const p of unexpectedDraftsRes.data) {
      issues.push(`"${p.address}, ${p.city}" was published before but is now back in draft.`);
    }
  }

  const propertyLabel = new Map((listingsRes.data ?? []).map((p) => [p.id, `${p.address}, ${p.city}`]));
  const pendingApplications = (pendingAppsRes.data ?? []).map((a) => ({
    ...a,
    property_label: propertyLabel.get(a.property_id) ?? "Unknown property",
  }));

  return NextResponse.json({
    checked_at: new Date().toISOString(),
    issues,
    agent: activeAgentsRes.data?.[0] ?? null,
    listings: listingsRes.data ?? [],
    pending_applications: pendingApplications,
  });
}
