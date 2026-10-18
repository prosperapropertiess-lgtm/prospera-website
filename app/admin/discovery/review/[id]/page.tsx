"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { DiscoveryCall } from "@/lib/discovery-data";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const NAVY = "#1F2F3A";

const VERDICT: Record<string, { bg: string; fg: string; label: string }> = {
  good_fit: { bg: "#DCFCE7", fg: "#166534", label: "Looks like a good fit" },
  borderline: { bg: "#FEF3C7", fg: "#92400E", label: "Borderline" },
  not_a_fit: { bg: "#FEE2E2", fg: "#991B1B", label: "Probably not a fit" },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 14, color: TEXT_SEC }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: TEXT, textAlign: "right" }}>{value || "—"}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "20px 26px", marginBottom: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: "0 0 4px" }}>{title}</h2>
      {children}
    </div>
  );
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [call, setCall] = useState<DiscoveryCall | null>(null);
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState<"verdict" | "reject" | "convert" | null>(null);
  const [error, setError] = useState("");
  const [confirmNo, setConfirmNo] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/discovery/${id}`).then((r) => r.json()).then((d) => {
      setCall(d.call ?? null);
      setAddress(d.call?.property_address ?? "");
    });
  }, [id]);

  if (!call) return <div style={{ minHeight: "100vh", backgroundColor: BG, padding: 40, color: TEXT_MUT }}>Loading…</div>;

  const done = call.outcome === "converted" || call.outcome === "rejected";
  const waiting = !call.fit_submitted_at && call.source === "link";

  async function getVerdict() {
    setBusy("verdict"); setError("");
    const res = await fetch(`/api/admin/discovery/${id}/verdict`, { method: "POST" });
    const d = await res.json();
    if (res.ok) setCall(d.call); else setError(d.error ?? "Couldn't get an assessment");
    setBusy(null);
  }

  async function goodFit() {
    setBusy("convert"); setError("");
    if (address.trim() && address.trim() !== call?.property_address) {
      await fetch(`/api/admin/discovery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_address: address.trim() }),
      });
    }
    const res = await fetch(`/api/admin/discovery/${id}/convert`, { method: "POST" });
    const d = await res.json();
    if (res.ok) router.push(`/admin/onboard/${d.onboarding_token}`);
    else { setError(d.error ?? "Couldn't start onboarding"); setBusy(null); }
  }

  async function notFit() {
    setBusy("reject"); setError("");
    const res = await fetch(`/api/admin/discovery/${id}/reject`, { method: "POST" });
    const d = await res.json();
    if (res.ok) { setCall(d.call); setConfirmNo(false); } else setError(d.error ?? "Couldn't send the email");
    setBusy(null);
  }

  const v = call.ai_verdict ? VERDICT[call.ai_verdict] : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 120px" }}>
        <Link href="/admin/discovery" style={{ fontSize: 14, color: TEXT_SEC }}>← Discovery Calls</Link>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: "12px 0 4px" }}>{call.landlord_name || "Landlord"}</h1>
        <p style={{ fontSize: 14, color: TEXT_SEC, margin: "0 0 24px" }}>
          {[call.landlord_email, call.landlord_phone].filter(Boolean).join(" · ")}
        </p>

        {waiting && (
          <Card title="Waiting on the landlord">
            <p style={{ fontSize: 14, color: TEXT_SEC, margin: "6px 0 0" }}>
              Link sent. Link: <code>/fit/{call.fit_token}</code>. You&apos;ll get an email when they submit.
            </p>
          </Card>
        )}

        {!waiting && (
          <>
            <Card title="Property">
              <Row label="Area" value={call.area} />
              <Row label="Address" value={call.address_disclosed === false ? "Not shared yet" : call.property_address} />
              <Row label="Type" value={call.property_type} />
              <Row label="Beds / baths" value={call.bedrooms != null ? `${call.bedrooms} bd / ${call.bathrooms ?? "?"} ba` : null} />
              <Row label="Occupancy" value={call.occupancy_status} />
              <Row label="Properties owned" value={call.num_properties_owned} />
            </Card>
            <Card title="Condition">
              <Row label="Overall" value={call.property_condition} />
              <Row label="How it's been looked after" value={call.maintenance_level} />
              {call.condition_notes && <p style={{ fontSize: 14, color: TEXT, margin: "12px 0 0", lineHeight: 1.6 }}>{call.condition_notes}</p>}
            </Card>
            <Card title="Rent">
              <Row label="Expecting" value={call.rent_expectation} />
              <Row label="That number is" value={call.rent_basis} />
              <Row label="Flexibility" value={call.rent_flexibility} />
            </Card>
            <Card title="What they want">
              <Row label="Service" value={call.service_type} />
              <Row label="Involvement" value={call.involvement_level} />
              <Row label="Timeline" value={call.timeline} />
            </Card>

            <Card title="Fit assessment">
              {!v ? (
                <div style={{ marginTop: 12 }}>
                  <button onClick={getVerdict} disabled={busy !== null} className="px-5 py-3 rounded-xl text-sm font-medium" style={{ border: `1px solid ${BORDER}`, color: NAVY, backgroundColor: SURFACE }}>
                    {busy === "verdict" ? "Thinking…" : "Get AI fit assessment (optional)"}
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20, backgroundColor: v.bg, color: v.fg }}>{v.label}</span>
                  <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.6, margin: "12px 0 0" }}>{call.ai_reasoning}</p>
                  {(call.ai_concerns ?? []).length > 0 && (
                    <ul style={{ margin: "10px 0 0 18px", fontSize: 14, color: TEXT_SEC }}>
                      {(call.ai_concerns ?? []).map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  )}
                  <p style={{ fontSize: 12, color: TEXT_MUT, marginTop: 10 }}>A suggestion only. You decide.</p>
                </div>
              )}
            </Card>

            {done ? (
              <p style={{ fontSize: 15, fontWeight: 600, color: TEXT_SEC }}>
                {call.outcome === "converted" ? "Welcome email sent. " : "Free landlord kit sent. "}
                {call.onboarding_token && <Link href={`/admin/onboard/${call.onboarding_token}`} style={{ color: NAVY, textDecoration: "underline" }}>Open onboarding</Link>}
              </p>
            ) : (
              <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 26 }}>
                {!call.property_address && (
                  <div style={{ marginBottom: 18 }}>
                    <p style={{ fontSize: 13, color: TEXT_SEC, margin: "0 0 6px" }}>They haven&apos;t shared the address. Add it before starting onboarding.</p>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" className="w-full px-4 py-3 rounded-xl text-base outline-none" style={{ border: `1.5px solid ${BORDER}`, backgroundColor: BG, color: TEXT }} />
                  </div>
                )}
                {error && <p style={{ color: ACCENT, fontSize: 14, marginBottom: 12 }}>{error}</p>}
                <button onClick={goodFit} disabled={busy !== null || !call.landlord_email} className="w-full px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded" style={{ backgroundColor: ACCENT, color: "#FAF8F5", opacity: busy ? 0.6 : 1 }}>
                  {busy === "convert" ? "Starting…" : "Good fit: send welcome email + agreement"}
                </button>
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  {confirmNo ? (
                    <span style={{ fontSize: 14, color: TEXT_SEC }}>
                      Send a polite no plus the free landlord kit?{" "}
                      <button onClick={notFit} disabled={busy !== null} style={{ fontWeight: 700, color: ACCENT, textDecoration: "underline" }}>{busy === "reject" ? "Sending…" : "Yes, send"}</button>{" · "}
                      <button onClick={() => setConfirmNo(false)} style={{ color: TEXT_MUT }}>Cancel</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmNo(true)} className="text-xs font-medium uppercase tracking-widest" style={{ color: TEXT_SEC, borderBottom: `1px solid ${BORDER}` }}>
                      Not a fit: send free resources →
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
