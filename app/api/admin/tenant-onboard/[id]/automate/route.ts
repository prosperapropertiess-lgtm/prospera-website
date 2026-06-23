import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createTenantInNotion, createRentTrackerSeries } from "@/lib/notion";

type AutomateAction = "notion" | "portal" | "checkin" | "rent-tracker";

async function getSession(id: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("tenant_onboarding_sessions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function patchSession(id: string, updates: Record<string, unknown>) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("tenant_onboarding_sessions")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function runNotion(id: string) {
  const session = await getSession(id);
  const notionId = await createTenantInNotion({
    name:            session.tenant_name,
    email:           session.tenant_email ?? undefined,
    phone:           session.tenant_phone ?? undefined,
    unit:            session.unit ?? undefined,
    monthlyRent:     session.monthly_rent ?? undefined,
    leaseStart:      session.lease_start ?? undefined,
    leaseEnd:        session.lease_end ?? undefined,
    securityDeposit: session.security_deposit_amount ?? undefined,
    propertyId:      session.property_id ?? "",
  });
  await patchSession(id, { notion_tenant_id: notionId });
  return NextResponse.json({ notion_tenant_id: notionId });
}

async function runRentTracker(id: string) {
  const session = await getSession(id);
  if (!session.notion_tenant_id) {
    return NextResponse.json({ error: "notion_tenant_id is required — run Notion step first" }, { status: 400 });
  }
  if (!session.monthly_rent || !session.lease_start) {
    return NextResponse.json({ error: "monthly_rent and lease_start are required" }, { status: 400 });
  }
  await createRentTrackerSeries({
    tenantId:   session.notion_tenant_id,
    propertyId: session.property_id ?? "",
    amountDue:  session.monthly_rent,
    leaseStart: session.lease_start,
    leaseEnd:   session.lease_end ?? undefined,
    tenantName: session.tenant_name,
  });
  await patchSession(id, { rent_tracker_created: true });
  return NextResponse.json({ created: true });
}

async function runPortal(id: string, req: NextRequest) {
  const session = await getSession(id);
  if (!session.notion_tenant_id) {
    return NextResponse.json({ error: "notion_tenant_id is required — run Notion step first" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const adminSecret = process.env.ADMIN_API_SECRET ?? "";

  const tokensRes = await fetch(`${baseUrl}/api/admin/tenant-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminSecret}`,
    },
    body: JSON.stringify({
      notionTenantId:  session.notion_tenant_id,
      tenantName:      session.tenant_name,
      propertyId:      session.property_id ?? "",
      tenantEmail:     session.tenant_email ?? undefined,
      propertyAddress: session.property_address,
    }),
  });

  if (!tokensRes.ok) {
    const err = await tokensRes.text();
    return NextResponse.json({ error: `tenant-tokens failed: ${err}` }, { status: 500 });
  }

  const { token, portalUrl, emailSent } = await tokensRes.json();

  await patchSession(id, {
    portal_token:          token,
    welcome_email_sent_at: new Date().toISOString(),
  });

  return NextResponse.json({ portal_token: token, portalUrl, emailSent });
}

async function runCheckin(id: string) {
  const session = await getSession(id);
  const sb = getSupabaseAdmin();

  const eventDate = session.move_in_date
    ? (() => {
        const d = new Date(session.move_in_date);
        d.setDate(d.getDate() + 14);
        return d.toISOString().split("T")[0];
      })()
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d.toISOString().split("T")[0];
      })();

  const { error } = await sb.from("property_schedule").insert({
    property_id:  session.property_id ?? "",
    event_type:   "reminder",
    title:        `2-Week Check-In — ${session.tenant_name}`,
    description:  `Follow up with ${session.tenant_name} — check that move-in went smoothly.`,
    event_date:   eventDate,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await patchSession(id, { checkin_scheduled: true });
  return NextResponse.json({ scheduled: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { action?: AutomateAction };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;
  if (!action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  try {
    switch (action) {
      case "notion":       return await runNotion(id);
      case "rent-tracker": return await runRentTracker(id);
      case "portal":       return await runPortal(id, req);
      case "checkin":      return await runCheckin(id);
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
