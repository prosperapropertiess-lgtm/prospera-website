import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You assist a property manager during a live discovery call with a prospective landlord. You classify and summarize; you do not make the final decision — a human always reviews your assessment before anything is sent.

Use only the supplied fit criteria and call answers. Never invent facts about the landlord or property.

Return valid JSON only, no markdown fences, matching this shape:
{
  "verdict": "good_fit" | "not_a_fit" | "borderline",
  "reasoning": "2-3 plain-English sentences explaining the call, written for the property manager to read back later",
  "concerns": ["short phrase", "short phrase"]
}

"concerns" should be empty if verdict is "good_fit" with no caveats. Be direct and specific — reference what was actually said, not generic advice.`;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getSupabaseAdmin();

  const [{ data: call, error: callErr }, { data: criteriaRow }] = await Promise.all([
    db.from("discovery_calls").select("*").eq("id", id).single(),
    db.from("settings").select("value").eq("key", "discovery_fit_criteria").single(),
  ]);

  if (callErr || !call) return NextResponse.json({ error: "Call not found" }, { status: 404 });

  const criteria = criteriaRow?.value ?? "(no fit criteria configured yet)";

  const summary = `FIT CRITERIA:
${criteria}

CALL ANSWERS:
- Landlord owns ${call.num_properties_owned ?? "unknown"} propert(y/ies) total
- Property: ${call.property_address ?? "?"}, ${call.property_city ?? "?"} — ${call.property_type ?? "unknown type"}, ${call.bedrooms ?? "?"}bd/${call.bathrooms ?? "?"}ba
- Occupancy: ${call.occupancy_status ?? "not stated"}
- Approx rent: ${call.approx_monthly_rent ? `$${call.approx_monthly_rent}/mo` : "not stated"}
- Condition: ${call.property_condition ?? "not stated"}${call.condition_notes ? ` — ${call.condition_notes}` : ""}
- Why they're calling now: ${call.reason_for_call ?? "not stated"}
- Looking for: ${call.service_type ?? "not stated"}
- How hands-on they want to stay: ${call.involvement_level ?? "not stated"}
- Timeline: ${call.timeline ?? "not stated"}`;

  let verdict: { verdict: string; reasoning: string; concerns: string[] };
  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: `${SYSTEM}\n\n${summary}` }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "{}";
    const cleaned = text.trim().replace(/^```json\s*|```$/g, "");
    verdict = JSON.parse(cleaned);
  } catch (err) {
    console.error("[discovery/verdict] AI call failed:", err);
    return NextResponse.json({ error: "Couldn't get an assessment — try again" }, { status: 502 });
  }

  const { data: updated, error } = await db
    .from("discovery_calls")
    .update({
      ai_verdict: verdict.verdict,
      ai_reasoning: verdict.reasoning,
      ai_concerns: verdict.concerns ?? [],
      outcome: "pending_decision",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ call: updated });
}
