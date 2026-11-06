import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await getSupabaseAdmin().from("market_saved_views").select("*").order("created_at");
  return NextResponse.json({ views: data ?? [] });
}

// POST { name, workspace, query }
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim().slice(0, 100);
  if (!name) return NextResponse.json({ error: "Name the view." }, { status: 400 });
  const { data, error } = await getSupabaseAdmin().from("market_saved_views")
    .insert({ name, workspace: String(b.workspace ?? "listings"), query: String(b.query ?? "").slice(0, 4000) }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ view: data });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (id) await getSupabaseAdmin().from("market_saved_views").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
