import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

async function isAuthenticated(req: NextRequest) {
  return isAdminAuthenticated(req);
}

export async function POST(req: NextRequest) {
  if (!await isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { email, full_name } = body as { email?: string; full_name?: string };

  if (!email || !full_name) {
    return NextResponse.json({ error: "email and full_name are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: "rentified://auth/set-password",
    data: {
      full_name,
      role: "landlord",
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
