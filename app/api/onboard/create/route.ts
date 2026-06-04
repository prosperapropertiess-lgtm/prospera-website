import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const rand = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `ob-${rand}`;
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = generateToken();
  const sb = getSupabaseAdmin();

  const { error } = await sb.from("onboarding_sessions").insert({
    token,
    current_step: 2,
    status: "in_progress",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ token });
}
