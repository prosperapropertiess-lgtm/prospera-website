import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";
import { applicationIdFromOwnerToken } from "@/lib/application-pipeline";
import { Shell, heading, NAVY, BORDER, MUTED } from "@/components/flow/FlowUI";
import OwnerDecision from "./OwnerDecision";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Tenant report | Prospera Properties" }, robots: { index: false } };

const STATUS: Record<string, { label: string; color: string }> = {
  verified: { label: "Confirmed", color: "#2D6A4F" },
  claimed_only: { label: "Stated", color: MUTED },
  concern: { label: "To check", color: "#8B2030" },
  missing: { label: "Not provided", color: MUTED },
};

// The owner's view of an applicant: the summary they need for a conditional approval.
// No contact details, birth date or documents.
export default async function OwnerReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const id = applicationIdFromOwnerToken(token);
  const { data: a } = id
    ? await getSupabaseAdmin().from("applications").select("*, properties(address, city, price)").eq("id", id).maybeSingle()
    : { data: null };
  if (!a) {
    return <Shell><h1 className="text-3xl font-bold" style={heading}>This link isn&apos;t valid</h1></Shell>;
  }
  const s = a.ai_summary as null | { owner_summary?: string; headline: string; checks: { topic: string; status: string; detail: string }[]; verified_monthly_income: number | null; rent_share_of_income_pct: number | null };
  const income = s?.verified_monthly_income ?? (a.monthly_income != null ? Number(a.monthly_income) : null);
  const rent = Number(a.monthly_rent);
  const rows: [string, string][] = [
    ["Applicant", a.tenant_name],
    ["Others on the lease", (a.co_applicants ?? []).map((c: { name: string }) => c.name).join(", ") || "None"],
    ["People living there", a.occupants ? String(a.occupants) : "—"],
    ["Wants to move in", a.move_in_date ? new Date(`${a.move_in_date}T12:00:00Z`).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—"],
    ["Income (monthly, before tax)", income ? `$${Math.round(income).toLocaleString()}${s?.verified_monthly_income ? " (confirmed by documents)" : " (stated)"}` : "—"],
    ["Rent", `$${rent.toLocaleString()} a month${income ? `, about ${Math.round((rent / income) * 100)}% of income` : ""}`],
    ["Work", [a.employer_position, a.employer_name].filter(Boolean).join(" at ") || a.income_source || "—"],
    ["Current landlord reference", a.landlord_ref_name ? "Given" : a.current_rent != null ? "Not given" : "Doesn't rent now"],
    ["Pets", a.pets || "None"],
    ["Smoking", a.smokes ? "Yes" : "No"],
  ];

  return (
    <Shell>
      <p className="text-sm mb-1" style={{ color: MUTED }}>Tenant report · prepared by Prospera Properties</p>
      <h1 className="text-3xl font-bold mb-2 leading-tight" style={heading}>{a.tenant_name}</h1>
      <p className="text-base mb-6" style={{ color: "#333" }}>Applied for {a.properties?.address}, {a.properties?.city}</p>

      {s && (
        <div className="rounded-xl border-2 bg-white p-5 mb-6" style={{ borderColor: NAVY }}>
          <p className="text-sm font-semibold mb-2" style={{ color: NAVY }}>Our summary</p>
          <p className="text-base leading-relaxed" style={{ color: "#222" }}>{s.owner_summary || s.headline}</p>
        </div>
      )}

      <dl className="rounded-xl border bg-white mb-6" style={{ borderColor: BORDER }}>
        {rows.map(([k, v], i) => (
          <div key={k} className={`flex gap-4 px-4 py-3 ${i ? "border-t" : ""}`} style={{ borderColor: BORDER }}>
            <dt className="w-44 shrink-0 text-sm" style={{ color: MUTED }}>{k}</dt>
            <dd className="text-sm font-medium" style={{ color: "#222" }}>{v}</dd>
          </div>
        ))}
      </dl>

      {s?.checks?.length ? (
        <div className="mb-8">
          <p className="text-sm font-semibold mb-2" style={{ color: NAVY }}>What we checked</p>
          <div className="rounded-xl border bg-white" style={{ borderColor: BORDER }}>
            {s.checks.map((c, i) => (
              <div key={i} className={`px-4 py-3 ${i ? "border-t" : ""}`} style={{ borderColor: BORDER }}>
                <div className="flex justify-between gap-3 text-sm"><b style={{ color: "#222" }}>{c.topic}</b><span style={{ color: STATUS[c.status]?.color }}>{STATUS[c.status]?.label}</span></div>
                <p className="text-sm mt-1" style={{ color: "#333" }}>{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <OwnerDecision token={token} stage={a.stage} />
      <p className="text-xs mt-8" style={{ color: MUTED }}>
        A conditional approval lets us collect the first month&apos;s rent and run a SingleKey credit and background screening. Nothing is signed until that&apos;s back. Software helps organize the file; people make every decision. Questions? Call or text Ebin at (519) 697-1227.
      </p>
    </Shell>
  );
}
