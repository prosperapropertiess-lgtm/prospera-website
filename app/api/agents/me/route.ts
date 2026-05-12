import { NextRequest, NextResponse } from "next/server";
import { getAgentFromRequest } from "@/lib/agent-auth";

export async function GET(req: NextRequest) {
  const agent = await getAgentFromRequest(req);
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    email: agent.email,
  });
}
