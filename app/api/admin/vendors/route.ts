import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("vendors")
    .select("*")
    .order("active", { ascending: false })
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vendors: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { name, trade, phone, email, notes } = body as {
    name?: string; trade?: string; phone?: string; email?: string; notes?: string;
  };
  if (!name?.trim() || !trade?.trim()) {
    return NextResponse.json({ error: "Name and trade are required" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("vendors")
    .insert({ name: name.trim(), trade: trade.trim(), phone: phone || null, email: email || null, notes: notes || null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vendor: data });
}
