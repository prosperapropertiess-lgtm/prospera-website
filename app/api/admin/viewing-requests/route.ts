import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { reviewViewingRequests } from "@/lib/viewing-review";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// GET: every viewing request, newest first, plus the homes taking requests (for the share links).
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  const [{ data: requests }, { data: homes }] = await Promise.all([
    sb.from("viewing_requests").select("*").order("created_at", { ascending: false }).limit(300),
    sb.from("properties").select("id, address, city, price").eq("status", "published").eq("is_managed", true).eq("available", true).order("price"),
  ]);
  return NextResponse.json({ requests: requests ?? [], homes: homes ?? [] });
}

// POST { action: "review" }: run the sort now instead of waiting for the morning.
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action } = await req.json().catch(() => ({}));
  if (action !== "review") return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, ...(await reviewViewingRequests({ email: false })) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
