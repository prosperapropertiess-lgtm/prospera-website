"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import DocUploadSlot from "@/components/apply/DocUploadSlot";

const STEPS = ["Personal & Employment", "References", "Documents"];
const TOTAL = STEPS.length;

interface Property {
  address: string; city: string; price: number; bedrooms: number; bathrooms: number;
}

export default function ApplyPage({ params }: { params: Promise<{ agentId: string; propertyId: string }> }) {
  const { agentId, propertyId } = use(params);
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState("");

  const [form, setForm] = useState({
    tenant_name: "", tenant_email: "", tenant_phone: "", tenant_dob: "", current_address: "",
    employer_name: "", employer_position: "", monthly_income: "", employment_start: "", employment_type: "",
    landlord_ref_name: "", landlord_ref_phone: "", landlord_ref_email: "",
    employer_ref_name: "", employer_ref_phone: "", employer_ref_email: "",
  });

  const [docs, setDocs] = useState<{
    paystubs: string[]; bank_statements: string[]; employment_letter: string[]; id_doc: string[];
  }>({ paystubs: [], bank_statements: [], employment_letter: [], id_doc: [] });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStepError("");
  }

  // Validate agent + property on load
  useEffect(() => {
    async function validate() {
      const { data: prop } = await (await fetch(`/api/agents/properties`)).json().catch(() => ({ data: null }));
      // Simple approach: fetch public property info
      const res = await fetch(`/api/applications/validate-apply-link?agentId=${agentId}&propertyId=${propertyId}`);
      const json = await res.json();
      if (!res.ok || !json.property) {
        setLoadError(json.error ?? "This link is no longer valid.");
        return;
      }
      setProperty(json.property);
    }
    validate();
  }, [agentId, propertyId]);

  function validateStep(): boolean {
    if (step === 1) {
      if (!form.tenant_name.trim()) { setStepError("Full name is required."); return false; }
      if (!form.tenant_email.trim() || !form.tenant_email.includes("@")) { setStepError("Valid email is required."); return false; }
      if (!form.tenant_phone.trim()) { setStepError("Phone number is required."); return false; }
    }
    if (step === 3) {
      if (docs.paystubs.length < 4) { setStepError("Please upload all 4 pay stubs."); return false; }
      if (docs.bank_statements.length < 6) { setStepError("Please upload all 6 bank statements."); return false; }
      if (docs.id_doc.length < 1) { setStepError("Government-issued ID is required."); return false; }
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStepError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((s) => s + 1);
  }

  function back() {
    setStepError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((s) => s - 1);
  }

  async function submit() {
    if (!validateStep()) return;
    setSubmitting(true);
    setStepError("");

    const documents = [
      ...docs.paystubs.map((p) => ({ doc_type: "paystub", storage_path: p })),
      ...docs.bank_statements.map((p) => ({ doc_type: "bank_statement", storage_path: p })),
      ...docs.employment_letter.map((p) => ({ doc_type: "employment_letter", storage_path: p })),
      ...docs.id_doc.map((p) => ({ doc_type: "id", storage_path: p })),
    ];

    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, agent_id: agentId, property_id: propertyId, documents }),
      });
      const json = await res.json();
      if (!res.ok) { setStepError(json.error ?? "Submission failed."); setSubmitting(false); return; }
      router.push(`/apply/${agentId}/${propertyId}/submitted${json.application_id ? `?id=${json.application_id}` : ""}`);
    } catch {
      setStepError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 14px",
    border: "1px solid #D8D2C8", borderRadius: 8,
    fontSize: 15, color: "#1F2F3A",
    fontFamily: "var(--font-dm-sans)", outline: "none",
    backgroundColor: "#FFFFFF", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 500,
    color: "#64748B", fontFamily: "var(--font-dm-sans)",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em",
  };

  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontSize: 32, fontWeight: 400, color: "#1F2F3A", fontFamily: "var(--font-cormorant)", marginBottom: 12 }}>Link Unavailable</p>
          <p style={{ fontSize: 15, color: "#64748B", fontFamily: "var(--font-dm-sans)" }}>{loadError}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1F2F3A", padding: "24px 24px 28px", textAlign: "center" }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}>
          Rental Application
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 400, color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
          {property.address}
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
          {property.city} &nbsp;·&nbsp; {property.bedrooms}bd / {property.bathrooms}ba &nbsp;·&nbsp; <strong style={{ color: "rgba(250,248,245,0.8)" }}>${property.price.toLocaleString()}/mo</strong>
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ backgroundColor: "#1F2F3A", padding: "0 24px 20px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {STEPS.map((label, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  height: 3, borderRadius: 2,
                  backgroundColor: i < step ? "#C4374A" : "rgba(250,248,245,0.15)",
                  marginBottom: 6,
                }} />
                <p style={{
                  margin: 0, fontSize: 10, letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: i + 1 === step ? "rgba(250,248,245,0.8)" : "rgba(250,248,245,0.3)",
                  fontFamily: "var(--font-dm-sans)",
                }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Step 1 — Personal + Employment */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 400, color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>Personal & Employment</h2>

            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Personal Info</p>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} value={form.tenant_name} onChange={(e) => set("tenant_name", e.target.value)} placeholder="Jane Smith" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" value={form.tenant_email} onChange={(e) => set("tenant_email", e.target.value)} placeholder="jane@email.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input style={inputStyle} type="tel" value={form.tenant_phone} onChange={(e) => set("tenant_phone", e.target.value)} placeholder="519-555-0100" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input style={inputStyle} type="date" value={form.tenant_dob} onChange={(e) => set("tenant_dob", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Current Address</label>
                <input style={inputStyle} value={form.current_address} onChange={(e) => set("current_address", e.target.value)} placeholder="123 Main St" />
              </div>
            </div>

            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Employment</p>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Employer Name</label>
              <input style={inputStyle} value={form.employer_name} onChange={(e) => set("employer_name", e.target.value)} placeholder="Company Inc." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Position / Title</label>
                <input style={inputStyle} value={form.employer_position} onChange={(e) => set("employer_position", e.target.value)} placeholder="Sales Associate" />
              </div>
              <div>
                <label style={labelStyle}>Gross Monthly Income</label>
                <input style={inputStyle} type="number" value={form.monthly_income} onChange={(e) => set("monthly_income", e.target.value)} placeholder="4500" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Employment Start Date</label>
                <input style={inputStyle} type="date" value={form.employment_start} onChange={(e) => set("employment_start", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Employment Type</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.employment_type} onChange={(e) => set("employment_type", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="self_employed">Self-employed</option>
                  <option value="contract">Contract</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — References */}
        {step === 2 && (
          <div>
            <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 400, color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>References</h2>

            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Previous Landlord</p>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Landlord Name</label>
              <input style={inputStyle} value={form.landlord_ref_name} onChange={(e) => set("landlord_ref_name", e.target.value)} placeholder="John Doe" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} type="tel" value={form.landlord_ref_phone} onChange={(e) => set("landlord_ref_phone", e.target.value)} placeholder="519-555-0100" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={form.landlord_ref_email} onChange={(e) => set("landlord_ref_email", e.target.value)} placeholder="landlord@email.com" />
              </div>
            </div>

            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Employer Reference</p>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Contact Name</label>
              <input style={inputStyle} value={form.employer_ref_name} onChange={(e) => set("employer_ref_name", e.target.value)} placeholder="HR Manager or Supervisor" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} type="tel" value={form.employer_ref_phone} onChange={(e) => set("employer_ref_phone", e.target.value)} placeholder="519-555-0200" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={form.employer_ref_email} onChange={(e) => set("employer_ref_email", e.target.value)} placeholder="hr@company.com" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Documents */}
        {step === 3 && (
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 400, color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>Upload Documents</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748B", fontFamily: "var(--font-dm-sans)" }}>
              PDF or image files only. Maximum 5MB per file.
            </p>

            <DocUploadSlot
              label="Last 4 Pay Stubs"
              docType="paystub"
              count={4}
              onUploaded={(paths) => setDocs((d) => ({ ...d, paystubs: paths }))}
            />
            <DocUploadSlot
              label="6 Months Bank Statements"
              docType="bank_statement"
              count={6}
              onUploaded={(paths) => setDocs((d) => ({ ...d, bank_statements: paths }))}
            />
            <DocUploadSlot
              label="Employment Letter"
              docType="employment_letter"
              count={1}
              onUploaded={(paths) => setDocs((d) => ({ ...d, employment_letter: paths }))}
            />
            <DocUploadSlot
              label="Government-Issued ID"
              docType="id"
              count={1}
              onUploaded={(paths) => setDocs((d) => ({ ...d, id_doc: paths }))}
            />
          </div>
        )}

        {/* Error */}
        {stepError && (
          <div style={{
            backgroundColor: "rgba(139,32,48,0.08)",
            border: "1px solid rgba(139,32,48,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            marginTop: 16,
            fontSize: 14,
            color: "#8B2030",
            fontFamily: "var(--font-dm-sans)",
          }}>
            {stepError}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {step > 1 && (
            <button
              onClick={back}
              style={{
                flex: 1, padding: "14px",
                backgroundColor: "transparent",
                border: "1px solid #D8D2C8",
                borderRadius: 8, fontSize: 15,
                color: "#1F2F3A", fontFamily: "var(--font-dm-sans)",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          )}
          {step < TOTAL ? (
            <button
              onClick={next}
              style={{
                flex: 1, padding: "14px",
                backgroundColor: "#1F2F3A",
                border: "none", borderRadius: 8,
                fontSize: 15, color: "#FAF8F5",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 500, cursor: "pointer",
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              style={{
                flex: 1, padding: "14px",
                backgroundColor: submitting ? "#4A1020" : "#8B2030",
                border: "none", borderRadius: 8,
                fontSize: 15, color: "#FAF8F5",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 500, cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
