import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET;
const BASE_URL = "https://prosperaproperties.co";

function makeToken(tenantName: string): string {
  const initials = tenantName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return `${initials}-${crypto.randomUUID()}`;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("tenant_access")
    .select("id, token, tenant_name, property_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tokens: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { notionTenantId?: string; tenantName?: string; propertyId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { notionTenantId, tenantName, propertyId } = body;
  if (!notionTenantId || !tenantName || !propertyId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const token = makeToken(tenantName);
  const sb = getSupabaseAdmin();

  const { error } = await sb.from("tenant_access").insert({
    token,
    notion_tenant_id: notionTenantId,
    tenant_name: tenantName,
    property_id: propertyId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    token,
    portalUrl: `${BASE_URL}/tenants/${token}`,
  });
}
