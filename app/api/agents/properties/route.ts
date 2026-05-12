import { NextRequest, NextResponse } from "next/server";
import { getAgentFromRequest } from "@/lib/agent-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const agent = await getAgentFromRequest(req);
  if (!agent) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: properties, error } = await supabaseAdmin
    .from("properties")
    .select("id, title, address, city, price, bedrooms, bathrooms, sqft, description, images, available, pet_friendly, utilities_included, parking")
    .eq("is_managed", true)
    .eq("available", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Agent properties fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }

  // Get application counts per property for this agent
  const propertyIds = (properties ?? []).map((p) => p.id);
  let applicationCounts: Record<string, number> = {};

  if (propertyIds.length > 0) {
    const { data: appCounts } = await supabaseAdmin
      .from("applications")
      .select("property_id, status")
      .eq("agent_id", agent.id)
      .in("property_id", propertyIds);

    for (const row of appCounts ?? []) {
      applicationCounts[row.property_id] = (applicationCounts[row.property_id] ?? 0) + 1;
    }
  }

  const result = (properties ?? []).map((p) => ({
    ...p,
    application_count: applicationCounts[p.id] ?? 0,
    apply_link: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co"}/apply/${agent.id}/${p.id}`,
  }));

  return NextResponse.json({ properties: result });
}
