import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createLeasingSession, setLeasingSessionCookie } from "@/lib/leasing-auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: employee, error } = await db
    .from("leasing_employees")
    .select("id, name, email, password_hash, role, active")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !employee) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if (!employee.active) {
    return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
  }

  const valid = await bcrypt.compare(password, employee.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createLeasingSession(employee.id);
  const res = NextResponse.json({
    employee: { id: employee.id, name: employee.name, email: employee.email, role: employee.role },
  });
  setLeasingSessionCookie(res, token);
  return res;
}
