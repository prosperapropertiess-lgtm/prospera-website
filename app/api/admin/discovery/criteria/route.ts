import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const KEY = "discovery_fit_criteria";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  const { data } = await db.from("settings").select("value").eq("key", KEY).single();
  return NextResponse.json({ criteria: data?.value ?? "" });
}

export async function PUT(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { criteria } = await req.json().catch(() => ({ criteria: "" }));
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("settings")
    .upsert({ key: KEY, value: criteria ?? "", updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
