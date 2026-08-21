import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logWorkOrderEvent } from "@/lib/maintenance-data";
import { fetchAllProperties, fetchAllTenants } from "@/lib/notion";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data: job, error } = await db
    .from("tenant_maintenance_requests")
    .select("id, category, description, status, tenant_id, property_id, scheduled_at, created_at, vendors(id, name, trade)")
    .eq("vendor_token", token)
    .single();
  if (error || !job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const [properties, tenants] = await Promise.all([
    fetchAllProperties().catch(() => []),
    fetchAllTenants().catch(() => []),
  ]);
  const property = properties.find((p) => p.id === job.property_id);
  const tenant = tenants.find((t) => t.id === job.tenant_id);

  return NextResponse.json({
    job: {
      id: job.id,
      category: job.category,
      description: job.description,
      status: job.status,
      scheduledAt: job.scheduled_at,
      createdAt: job.created_at,
      vendor: job.vendors,
      propertyAddress: property?.address ?? "Address unavailable",
      propertyCity: property?.city ?? "",
      contactName: tenant?.name ?? null,
      contactPhone: tenant?.phone ?? null,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { token, action } = body as { token?: string; action?: string };
  if (!token || !action) return NextResponse.json({ error: "Missing token or action" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data: job, error: loadErr } = await db
    .from("tenant_maintenance_requests")
    .select("id, status")
    .eq("vendor_token", token)
    .single();
  if (loadErr || !job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  if (action === "accept") {
    const { data, error } = await db
      .from("tenant_maintenance_requests")
      .update({ status: "scheduled", updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .select("id, status")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logWorkOrderEvent(job.id, "VENDOR_ACCEPTED", "Vendor");
    return NextResponse.json({ job: data });
  }

  if (action === "decline") {
    const { data, error } = await db
      .from("tenant_maintenance_requests")
      .update({ status: "triage", vendor_id: null, vendor_token: null, updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .select("id, status")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logWorkOrderEvent(job.id, "VENDOR_DECLINED", "Vendor");
    return NextResponse.json({ job: data });
  }

  if (action === "complete") {
    const { data, error } = await db
      .from("tenant_maintenance_requests")
      .update({ status: "work_complete", updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .select("id, status")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logWorkOrderEvent(job.id, "VENDOR_MARKED_COMPLETE", "Vendor");
    return NextResponse.json({ job: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
