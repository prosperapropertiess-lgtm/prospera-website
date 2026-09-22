import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const { sessionId, item_name, quantity } = await req.json();
  if (!sessionId || !item_name?.trim()) return NextResponse.json({ error: "sessionId and item_name required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("move_in_keys")
    .insert({ session_id: sessionId, item_name: item_name.trim(), quantity: quantity ?? 1 })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
