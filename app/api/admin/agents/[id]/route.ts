import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isAuthenticated(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === "authenticated";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { is_active: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.is_active !== "boolean") {
    return NextResponse.json({ error: "is_active must be a boolean" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("agents")
    .update({ is_active: body.is_active })
    .eq("id", id)
    .select("id, name, email, is_active, created_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // If deactivating, invalidate all their sessions
  if (!body.is_active) {
    await supabaseAdmin
      .from("agent_sessions")
      .delete()
      .eq("agent_id", id);
  }

  return NextResponse.json(data);
}
