import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { renderStatement, sendStatement } from "@/lib/owner-statement-store";
import type { OwnerStatement } from "@/lib/owner-statement";

export const dynamic = "force-dynamic";

// GET ?correction=1: the exact email the owner would get.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data: row } = await getSupabaseAdmin().from("owner_statements").select("data").eq("id", id).single();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const correction = req.nextUrl.searchParams.get("correction") === "1";
  return NextResponse.json(await renderStatement(row.data as OwnerStatement, correction));
}

// POST { action: "send", correction } | { action: "skip" } | { action: "unskip" }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { action, correction } = await req.json().catch(() => ({}));
  const sb = getSupabaseAdmin();
  try {
    if (action === "send") await sendStatement(id, !!correction);
    else if (action === "skip") await sb.from("owner_statements").update({ status: "skipped" }).eq("id", id).neq("status", "sent");
    else if (action === "unskip") await sb.from("owner_statements").update({ status: "draft" }).eq("id", id).eq("status", "skipped");
    else return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
  }
}
