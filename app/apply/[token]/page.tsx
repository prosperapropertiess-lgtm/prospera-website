"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────
interface CampaignInfo {
  property: { title: string; address: string; city: string; bedrooms: number; bathrooms: number };
  asking_rent: number;
  incentive_description: string | null;
  available_date: string | null;
}

interface AppData {
  token: string;
  stage: string;
  already_submitted: boolean;
  prefill: { legal_name: string | null; email: string | null; phone: string | null };
  campaign: CampaignInfo;
}

const EMPLOYMENT_OPTIONS = [
  { value: "employed_fulltime", label: "Employed — full-time" },
  { value: "employed_parttime", label: "Employed — part-time" },
  { value: "self_employed", label: "Self-employed / business owner" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" },
];

export default function QuickApplyPage() {
  const { token } = useParams<{ token: string }>();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    legal_name: "",
    phone: "",
    email: "",
    desired_move_date: "",
    num_occupants: "1",
    employment_status: "",
    employer_name: "",
    approx_monthly_income: "",
    has_pets: false,
    pet_details: "",
    num_vehicles: "0",
    reason_for_moving: "",
    additional_notes: "",
  });

  const load = useCallback(async () => {
    const res = await fetch(`/api/apply/${token}`);
    if (!res.ok) { setNotFound(true); setLoading(false); return; }
    const data: AppData = await res.json();
    setAppData(data);
    if (data.already_submitted) setSubmitted(true);
    if (data.prefill) {
      setForm((f) => ({
        ...f,
        legal_name: data.prefill.legal_name ?? "",
        email: data.prefill.email ?? "",
        phone: data.prefill.phone ?? "",
      }));
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/apply/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          num_occupants: parseInt(form.num_occupants),
          num_vehicles: parseInt(form.num_vehicles),
          approx_monthly_income: form.approx_monthly_income ? parseFloat(form.approx_monthly_income) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); return; }
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#8B2030]";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
      <div className="w-8 h-8 border-2 border-[#8B2030] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2] px-5">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-[#E5E1DC]">
        <p className="text-4xl mb-4">🔗</p>
        <h1 className="text-xl font-bold text-[#1F2F3A] mb-2">Link not found</h1>
        <p className="text-gray-500 text-sm">This application link may have expired or been removed. Contact us directly for help.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2] px-5">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-[#E5E1DC]">
        <p className="text-5xl mb-4">✓</p>
        <h1 className="text-2xl font-bold text-[#1F2F3A] mb-3">Application received</h1>
        <p className="text-gray-600 mb-2">We have your information and will be in touch shortly.</p>
        <p className="text-sm text-gray-400">If you have questions, reply to the email we sent you or call us directly.</p>
      </div>
    </div>
  );

  const property = appData?.campaign?.property;

  return (
    <div className="min-h-screen bg-[#F7F5F2] py-10 px-5">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Prospera Properties</p>
          <h1 className="text-2xl font-bold text-[#1F2F3A] leading-snug mb-1">
            {property?.title ?? property?.address}
          </h1>
          {property && (
            <p className="text-sm text-gray-500">
              {property.bedrooms} bed · {property.bathrooms} bath · {property.city}
              {appData?.campaign?.asking_rent ? ` · $${Number(appData.campaign.asking_rent).toLocaleString()}/mo` : ""}
            </p>
          )}
          {appData?.campaign?.incentive_description && (
            <p className="mt-2 text-sm text-[#2D7A4F] font-medium">🎁 {appData.campaign.incentive_description}</p>
          )}
        </div>

        {/* Time badge */}
        <div className="bg-[#1F2F3A] text-white rounded-xl px-5 py-4 mb-6 text-center">
          <p className="font-bold text-lg">Apply in about 2 minutes</p>
          <p className="text-sm text-white/70 mt-0.5">No documents required at this stage</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Personal info */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E1DC] space-y-4">
            <h2 className="font-bold text-[#1F2F3A]">Your information</h2>
            <div>
              <label className={labelCls}>Full legal name *</label>
              <input required className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.legal_name}
                onChange={(e) => set("legal_name", e.target.value)} placeholder="As it appears on your ID" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone *</label>
                <input required type="tel" className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.phone}
                  onChange={(e) => set("phone", e.target.value)} placeholder="519-xxx-xxxx" />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input required type="email" className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.email}
                  onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
              </div>
            </div>
          </div>

          {/* Move-in info */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E1DC] space-y-4">
            <h2 className="font-bold text-[#1F2F3A]">Move-in details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Desired move-in date</label>
                <input type="date" className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.desired_move_date}
                  onChange={(e) => set("desired_move_date", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Number of occupants *</label>
                <select required className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.num_occupants}
                  onChange={(e) => set("num_occupants", e.target.value)}>
                  {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Vehicles</label>
                <select className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.num_vehicles}
                  onChange={(e) => set("num_vehicles", e.target.value)}>
                  {[0,1,2,3].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 accent-[#8B2030]" checked={form.has_pets}
                    onChange={(e) => set("has_pets", e.target.checked)} />
                  <span className="text-sm font-semibold text-gray-700">I have pet(s)</span>
                </label>
              </div>
            </div>
            {form.has_pets && (
              <div>
                <label className={labelCls}>Pet details</label>
                <input className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.pet_details}
                  onChange={(e) => set("pet_details", e.target.value)} placeholder="e.g. 1 small dog, 8kg" />
              </div>
            )}
          </div>

          {/* Employment */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E1DC] space-y-4">
            <h2 className="font-bold text-[#1F2F3A]">Employment & income</h2>
            <div>
              <label className={labelCls}>Employment status *</label>
              <select required className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.employment_status}
                onChange={(e) => set("employment_status", e.target.value)}>
                <option value="">Select...</option>
                {EMPLOYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {form.employment_status && form.employment_status !== "retired" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    {form.employment_status === "student" ? "School / institution" : "Employer name"}
                  </label>
                  <input className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.employer_name}
                    onChange={(e) => set("employer_name", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Approx. monthly income</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input type="number" className={inputCls + " pl-7"} style={{ borderColor: "#D8D2C8" }}
                      value={form.approx_monthly_income} onChange={(e) => set("approx_monthly_income", e.target.value)}
                      placeholder="0" min="0" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* About you */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E1DC] space-y-4">
            <h2 className="font-bold text-[#1F2F3A]">A bit more</h2>
            <div>
              <label className={labelCls}>Why are you moving?</label>
              <input className={inputCls} style={{ borderColor: "#D8D2C8" }} value={form.reason_for_moving}
                onChange={(e) => set("reason_for_moving", e.target.value)}
                placeholder="e.g. lease ending, relocating for work" />
            </div>
            <div>
              <label className={labelCls}>Anything else we should know?</label>
              <textarea rows={3} className={inputCls + " resize-none"} style={{ borderColor: "#D8D2C8" }}
                value={form.additional_notes} onChange={(e) => set("additional_notes", e.target.value)}
                placeholder="Optional — any questions or context" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-xl font-bold text-white text-base transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#8B2030" }}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>

          <p className="text-center text-xs text-gray-400 pb-6">
            No documents required at this stage. We'll follow up within 1 business day.
          </p>
        </form>
      </div>
    </div>
  );
}
