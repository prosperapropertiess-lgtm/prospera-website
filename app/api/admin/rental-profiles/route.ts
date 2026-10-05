import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "all"; // all | completed | partial
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "200"), 500);

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("rental_profiles")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (status === "completed") query = query.eq("completed", true);
  if (status === "partial") query = query.eq("completed", false);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const profiles = data ?? [];
  const completed = profiles.filter((p) => p.completed).length;
  const partial = profiles.length - completed;
  const hot = profiles.filter((p) => p.lead_score === "hot").length;

  return NextResponse.json({
    total: count ?? profiles.length,
    completed,
    partial,
    hot,
    profiles,
  });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("rental_profiles").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
