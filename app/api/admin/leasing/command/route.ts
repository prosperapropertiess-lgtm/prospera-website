/**
 * GET /api/admin/leasing/command
 * Aggregated command center data — all active campaigns with metrics and diagnostics.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();

  const [
    { data: campaigns },
    { data: allLeads },
    { data: allShowings },
    { data: allTasks },
    { data: allApplications },
    { data: employees },
  ] = await Promise.all([
    db.from("leasing_properties")
      .select("*, property:properties(id, title, address, city, bedrooms, bathrooms, images)")
      .not("stage", "in", '("CLOSED","LEASE_SIGNED","MOVE_IN")')
      .order("created_at", { ascending: false }),
    db.from("leasing_leads").select("leasing_property_id, pipeline_stage, first_response_at, created_at, lost_reason"),
    db.from("leasing_showings").select("leasing_property_id, status, interested"),
    db.from("leasing_tasks").select("leasing_property_id, priority, due_date, completed").eq("completed", false),
    db.from("leasing_applications").select("campaign_id, stage"),
    db.from("leasing_employees").select("id, name, role").eq("active", true),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = (campaigns ?? []).map((c) => {
    const leads = (allLeads ?? []).filter((l) => l.leasing_property_id === c.id);
    const showings = (allShowings ?? []).filter((s) => s.leasing_property_id === c.id);
    const tasks = (allTasks ?? []).filter((t) => t.leasing_property_id === c.id);
    const applications = (allApplications ?? []).filter((a) => a.campaign_id === c.id);

    // Economics
    const vacantSince = c.vacant_since ? new Date(c.vacant_since) : new Date(c.created_at);
    const daysVacant = Math.floor((Date.now() - vacantSince.getTime()) / 86400000);
    const dailyCost = Number(c.asking_rent ?? 0) * 12 / 365;
    const vacancyLoss = Math.round(dailyCost * daysVacant);

    // Speed-to-lead
    const uncontacted = leads.filter((l) => {
      if (l.first_response_at) return false;
      return (Date.now() - new Date(l.created_at).getTime()) > 30 * 60 * 1000;
    }).length;

    // Tasks due today
    const tasksDueToday = tasks.filter((t) => {
      if (!t.due_date) return false;
      return new Date(t.due_date) <= today;
    }).length;

    // Diagnostics
    const daysActive = c.campaign_start_date
      ? Math.floor((Date.now() - new Date(c.campaign_start_date).getTime()) / 86400000)
      : daysVacant;

    const diagnostics: string[] = [];
    if (daysActive >= 7 && leads.length === 0) diagnostics.push("No leads after 7+ days");
    if (leads.length >= 5 && showings.length === 0) diagnostics.push("Leads not converting to showings");
    if (showings.filter((s) => s.status === "completed").length >= 3 && applications.filter((a) => a.stage !== "LINK_SENT").length === 0) {
      diagnostics.push("Showings not generating applications");
    }
    if (uncontacted > 0) diagnostics.push(`${uncontacted} lead${uncontacted > 1 ? "s" : ""} waiting for response`);

    const risk: "high" | "medium" | "low" =
      diagnostics.length >= 2 ? "high"
      : diagnostics.length === 1 ? "medium"
      : "low";

    return {
      ...c,
      metrics: {
        days_vacant: daysVacant,
        vacancy_loss: vacancyLoss,
        leads_count: leads.length,
        showings_count: showings.length,
        applications_count: applications.filter((a) => a.stage !== "LINK_SENT").length,
        uncontacted_leads: uncontacted,
        tasks_due_today: tasksDueToday,
      },
      diagnostics,
      risk,
    };
  });

  // Aggregate totals
  const totalVacancyLoss = result.reduce((s, c) => s + (c.metrics.vacancy_loss ?? 0), 0);
  const totalUncontacted = result.reduce((s, c) => s + c.metrics.uncontacted_leads, 0);
  const totalTasksToday = result.reduce((s, c) => s + c.metrics.tasks_due_today, 0);

  return NextResponse.json({
    campaigns: result,
    totals: {
      active_campaigns: result.length,
      total_vacancy_loss: totalVacancyLoss,
      total_uncontacted: totalUncontacted,
      total_tasks_today: totalTasksToday,
    },
    employees: employees ?? [],
  });
}
