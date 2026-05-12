import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agent_id");
  const propertyId = searchParams.get("property_id");

  if (!agentId || !propertyId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const [agentResult, propertyResult] = await Promise.all([
    supabaseAdmin
      .from("agents")
      .select("id, name")
      .eq("id", agentId)
      .eq("is_active", true)
      .maybeSingle(),
    supabaseAdmin
      .from("properties")
      .select("id, address, city, price, beds, baths, sqft")
      .eq("id", propertyId)
      .eq("is_managed", true)
      .eq("available", true)
      .maybeSingle(),
  ]);

  if (agentResult.error || !agentResult.data) {
    return NextResponse.json({ error: "Invalid application link" }, { status: 404 });
  }

  if (propertyResult.error || !propertyResult.data) {
    return NextResponse.json({ error: "This property is no longer available" }, { status: 404 });
  }

  return NextResponse.json({
    agent: agentResult.data,
    property: propertyResult.data,
  });
}
