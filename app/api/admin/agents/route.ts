import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { isAdminAuthenticated } from "@/lib/admin-auth";



async function isAuthenticated(req: NextRequest) {
  return isAdminAuthenticated(req);
}

export async function GET(req: NextRequest) {
  if (!await isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: agents, error } = await supabaseAdmin
    .from("agents")
    .select("id, name, email, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load agents" }, { status: 500 });
  }

  // Attach application stats per agent
  const { data: appStats } = await supabaseAdmin
    .from("applications")
    .select("agent_id, status");

  const statsMap: Record<string, { total: number; approved: number }> = {};
  for (const row of appStats ?? []) {
    if (!statsMap[row.agent_id]) statsMap[row.agent_id] = { total: 0, approved: 0 };
    statsMap[row.agent_id].total++;
    if (row.status === "approved") statsMap[row.agent_id].approved++;
  }

  const result = (agents ?? []).map((a) => ({
    ...a,
    total_applications: statsMap[a.id]?.total ?? 0,
    approved_applications: statsMap[a.id]?.approved ?? 0,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!await isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: string; email: string; password: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, password } = body;

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("agents")
    .insert([{
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      is_active: true,
    }])
    .select("id, name, email, is_active, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "An agent with this email already exists" }, { status: 409 });
    }
    console.error("Agent create error:", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
