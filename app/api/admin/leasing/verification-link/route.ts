import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const KEY = "leasing_verification_application_link";
const DEFAULT_LINK = "https://form.jotform.com/262055545302046";

export async function GET(req: NextRequest) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  const { data } = await db.from("settings").select("value").eq("key", KEY).single();
  return NextResponse.json({ link: data?.value || DEFAULT_LINK });
}

export async function PUT(req: NextRequest) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { link } = await req.json().catch(() => ({ link: "" }));
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("settings")
    .upsert({ key: KEY, value: link ?? "", updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
