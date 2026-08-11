/**
 * GET  /api/admin/leasing/employees  — list all employees
 * POST /api/admin/leasing/employees  — create employee (admin only)
 * PATCH /api/admin/leasing/employees — update employee (admin only)
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_employees")
    .select("id, name, email, role, active, created_at")
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized — admin only" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ error: "name, email, password required" }, { status: 400 });
  }
  const password_hash = await bcrypt.hash(body.password, 12);
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_employees")
    .insert({ name: body.name, email: body.email.toLowerCase().trim(), password_hash, role: body.role ?? "coordinator" })
    .select("id, name, email, role, active, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized — admin only" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = getSupabaseAdmin();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name) updates.name = body.name;
  if (body.role) updates.role = body.role;
  if (body.active !== undefined) updates.active = body.active;
  if (body.password) updates.password_hash = await bcrypt.hash(body.password, 12);
  const { data, error } = await db
    .from("leasing_employees")
    .update(updates)
    .eq("id", body.id)
    .select("id, name, email, role, active")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
