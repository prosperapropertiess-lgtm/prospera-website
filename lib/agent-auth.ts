import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export interface Agent {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export async function getAgentFromRequest(req: NextRequest): Promise<Agent | null> {
  const token = req.cookies.get("agent_session")?.value;
  if (!token) return null;

  const { data, error } = await supabaseAdmin
    .from("agent_sessions")
    .select("agent_id, expires_at, agents(id, name, email, is_active, created_at)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;

  const agent = (data as unknown as { agents: Agent }).agents;
  if (!agent || !agent.is_active) return null;

  return agent;
}
