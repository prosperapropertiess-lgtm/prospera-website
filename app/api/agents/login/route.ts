import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { getAgentFromRequest } from "@/lib/agent-auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const { data: agent, error } = await supabaseAdmin
      .from("agents")
      .select("id, name, email, password_hash, is_active")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error || !agent) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!agent.is_active) {
      return NextResponse.json({ error: "Account is inactive. Contact Ebin." }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, agent.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create session token
    const token = crypto.randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: sessionErr } = await supabaseAdmin
      .from("agent_sessions")
      .insert([{ agent_id: agent.id, token, expires_at }]);

    if (sessionErr) {
      console.error("Session insert error:", sessionErr);
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    const res = NextResponse.json({ success: true, name: agent.name });
    res.cookies.set("agent_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error("Agent login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("agent_session")?.value;

  if (token) {
    await supabaseAdmin.from("agent_sessions").delete().eq("token", token);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("agent_session", "", { maxAge: 0, path: "/" });
  return res;
}
