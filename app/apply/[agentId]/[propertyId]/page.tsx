import ApplicationForm from "@/components/apply/ApplicationForm";
import { Shell, heading, MUTED } from "@/components/flow/FlowUI";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// The general application link (from listings and /apply). Personal links from the
// after-viewing email use /apply/i/<token> and skip what we already know.
export default async function ApplyPage({ params }: { params: Promise<{ agentId: string; propertyId: string }> }) {
  const { agentId, propertyId } = await params;
  const db = getSupabaseAdmin();
  const [{ data: agent }, { data: property }] = await Promise.all([
    db.from("agents").select("id").eq("id", agentId).eq("is_active", true).maybeSingle(),
    db.from("properties").select("id, address, city, price, bedrooms, bathrooms, utilities_included, available_date, images")
      .eq("id", propertyId).eq("is_managed", true).eq("available", true).maybeSingle(),
  ]);

  if (!agent || !property) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold mb-3" style={heading}>This link isn&apos;t working</h1>
        <p className="text-base mb-2" style={{ color: "#333" }}>{!property ? "This home isn't taking applications right now." : "The link may be out of date."}</p>
        <p className="text-sm" style={{ color: MUTED }}>Call or text us at (519) 697-1227 and we&apos;ll send you a new one.</p>
      </Shell>
    );
  }
  return <ApplicationForm property={property} agentId={agentId} />;
}
