import { NextRequest, NextResponse } from "next/server";
import { getAgentFromRequest } from "@/lib/agent-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const agent = await getAgentFromRequest(req);
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("applications")
    .select(`
      id, tenant_name, tenant_email, tenant_phone,
      status, ai_score, monthly_rent, created_at,
      properties(address, city)
    `)
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Agent applications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }

  return NextResponse.json({ applications: data ?? [] });
}
