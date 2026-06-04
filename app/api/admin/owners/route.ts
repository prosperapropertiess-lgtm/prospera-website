import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function randomToken(length = 24): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// GET /api/admin/owners — list all owner access records
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("owner_access")
    .select("id, token, owner_names, notion_owner_ids, created_at, last_accessed")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data });
}

// POST /api/admin/owners — create a new owner access record
// Body: { token?: string, owner_names: string, notion_owner_ids: string[] }
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token: customToken, owner_names, notion_owner_ids } = await req.json();

  if (!owner_names || !notion_owner_ids?.length) {
    return NextResponse.json(
      { error: "Required: owner_names, notion_owner_ids" },
      { status: 400 }
    );
  }

  const token = customToken || randomToken();

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("owner_access")
    .insert({ token, owner_names, notion_owner_ids })
    .select("token, owner_names")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    ok: true,
    record: data,
    dashboardUrl: `https://www.prosperaproperties.co/owners/${token}`,
  });
}
