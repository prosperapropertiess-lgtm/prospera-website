"use client";

import { useState } from "react";

// Design tokens
const NAVY = "#0F1C28";
const NAVY_MED = "#2A3D4F";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.22)";
const BURGUNDY = "#8B2030";
const BURG_BG = "rgba(139,32,48,0.08)";
const BURG_BORDER = "rgba(139,32,48,0.20)";
const GREEN = "#0A7A52";
const GREEN_BG = "rgba(10,122,82,0.09)";
const AMBER = "#B45309";
const AMBER_BG = "rgba(180,83,9,0.09)";
const BLUE = "#1D4ED8";
const BLUE_BG = "rgba(29,78,216,0.08)";
const RED = "#B91C1C";
const RED_BG = "rgba(185,28,28,0.08)";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";

type WizardState = "category" | "describe" | "diagnosing" | "troubleshoot" | "submit" | "done";
type DoneVariant = "resolved" | "submitted";

interface CategoryOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: "Plumbing", label: "Plumbing", icon: "water_drop", color: BLUE, bg: BLUE_BG },
  { id: "Electrical", label: "Electrical", icon: "bolt", color: AMBER, bg: AMBER_BG },
  { id: "Appliances", label: "Appliances", icon: "kitchen", color: GREEN, bg: GREEN_BG },
  { id: "HVAC / Heating", label: "HVAC / Heating", icon: "thermostat", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  { id: "Pest / Rodents", label: "Pest / Rodents", icon: "pest_control", color: GREEN, bg: GREEN_BG },
  { id: "Other", label: "Other", icon: "build", color: MUTED, bg: "rgba(15,28,40,0.05)" },
];

interface Props {
  token: string;
  tenantId: string;
  propertyId: string;
}

function parseTroubleshootingSteps(text: string): string[] {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(l => /^\d+[\.\)]/.test(l))
    .map(l => l.replace(/^\d+[\.\)]\s*/, ""));
}

export default function MaintenanceWizard({ token, tenantId, propertyId }: Props) {
  const [state, setState] = useState<WizardState>("category");
  const [doneVariant, setDoneVariant] = useState<DoneVariant>("submitted");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [aiDiagnosis, setAiDiagnosis] = useState("");
  const [troubleshootingSteps, setTroubleshootingSteps] = useState<string[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos(prev => [...prev, ...files].slice(0, 3));
    e.target.value = "";
  }

  function handlePhotoRemove(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos(): Promise<string[]> {
    if (photos.length === 0) return [];
    const fd = new FormData();
    fd.append("token", token);
    photos.forEach(f => fd.append("photo", f));
    const res = await fetch("/api/tenants/maintenance/photos", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Photo upload failed");
    return json.urls as string[];
  }

  async function handleDiagnose() {
    if (description.trim().length < 10) return;
    setState("diagnosing");
    setError(null);
    try {
      setUploadingPhotos(true);
      const urls = await uploadPhotos();
      setPhotoUrls(urls);
      setUploadingPhotos(false);

      const res = await fetch("/api/tenants/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "diagnose", token, category, description }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to get diagnosis");
      setAiDiagnosis(json.diagnosis ?? "");
      setTroubleshootingSteps(parseTroubleshootingSteps(json.diagnosis ?? ""));
      setState("troubleshoot");
    } catch (err) {
      setUploadingPhotos(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("describe");
    }
  }

  async function handleSubmit() {
    setError(null);
    try {
      const res = await fetch("/api/tenants/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          token,
          tenantId,
          propertyId,
          category,
          description,
          troubleshootingSteps: aiDiagnosis,
          aiDiagnosis,
          photoUrls,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit");
      setSubmittedId(json.id ?? null);
      setDoneVariant("submitted");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function handleResolved() {
    setDoneVariant("resolved");
    setState("done");
  }

  const allChecked = troubleshootingSteps.length === 0 || checkedSteps.size === troubleshootingSteps.length;

  if (state === "category") {
    return (
      <div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "17px", color: MUTED, marginBottom: "20px" }}>
          What type of issue are you experiencing?
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setState("describe"); }}
              style={{
                background: "#FFFFFF",
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: "16px",
                boxShadow: CARD_SHADOW,
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "10px",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = BURG_BORDER;
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(15,28,40,0.08), 0 16px 40px rgba(15,28,40,0.10)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = CARD_BORDER;
                (e.currentTarget as HTMLElement).style.boxShadow = CARD_SHADOW;
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: cat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "21px", color: cat.color }}>
                  {cat.icon}
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "17px", fontWeight: 700, color: NAVY }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state === "describe") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <button
            onClick={() => setState("category")}
            style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "16px", fontFamily: "var(--font-dm-sans)", padding: 0 }}
          >
            ← Back
          </button>
          <span
            style={{
              padding: "3px 12px",
              borderRadius: "100px",
              background: BURG_BG,
              border: `1px solid ${BURG_BORDER}`,
              fontSize: "15px",
              fontFamily: "var(--font-dm-sans)",
              color: BURGUNDY,
              fontWeight: 600,
            }}
          >
            {category}
          </span>
        </div>

        {error && (
          <p style={{ color: RED, fontSize: "16px", marginBottom: "12px", padding: "10px 14px", background: RED_BG, borderRadius: "10px", fontFamily: "var(--font-dm-sans)" }}>
            {error}
          </p>
        )}

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the issue in detail — when did it start, what have you noticed, any prior attempts to fix it…"
          rows={5}
          style={{
            width: "100%",
            resize: "vertical",
            padding: "14px 16px",
            fontSize: "17px",
            fontFamily: "var(--font-dm-sans)",
            color: NAVY,
            background: "#FAFAF9",
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: "12px",
            outline: "none",
            lineHeight: "1.6",
            boxSizing: "border-box",
            marginBottom: "16px",
          }}
        />
        {/* Photo upload section */}
        <div style={{ marginBottom: "16px" }}>
          {photos.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
              {photos.map((file, i) => (
                <div key={i} style={{ position: "relative", width: "60px", height: "60px" }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", border: `1px solid ${CARD_BORDER}` }}
                  />
                  <button
                    onClick={() => handlePhotoRemove(i)}
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: NAVY,
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length < 3 && (
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "10px",
                border: `1.5px dashed ${CARD_BORDER}`,
                cursor: "pointer",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "15px",
                color: MUTED,
                background: "transparent",
              }}
            >
              <span>Add photos (optional)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handlePhotoAdd}
              />
            </label>
          )}
        </div>

        {uploadingPhotos && (
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", color: MUTED, marginBottom: "12px" }}>
            Uploading photos…
          </p>
        )}

        <button
          onClick={handleDiagnose}
          disabled={description.trim().length < 10}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            background: description.trim().length >= 10 ? BURGUNDY : "rgba(15,28,40,0.07)",
            color: description.trim().length >= 10 ? "#FFFFFF" : SUBTLE,
            border: "none",
            cursor: description.trim().length >= 10 ? "pointer" : "not-allowed",
            fontSize: "17px",
            fontWeight: 600,
            fontFamily: "var(--font-dm-sans)",
            transition: "background 0.15s",
          }}
        >
          Get Troubleshooting Tips →
        </button>
      </div>
    );
  }

  if (state === "diagnosing") {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "24px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: BURGUNDY,
                animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes pulse-dot {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <p style={{ color: MUTED, fontSize: "18px", fontFamily: "var(--font-dm-sans)" }}>
          Laura is reviewing your issue…
        </p>
      </div>
    );
  }

  if (state === "troubleshoot") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <span
            style={{
              padding: "3px 12px",
              borderRadius: "100px",
              background: BURG_BG,
              border: `1px solid ${BURG_BORDER}`,
              fontSize: "15px",
              fontFamily: "var(--font-dm-sans)",
              color: BURGUNDY,
              fontWeight: 600,
            }}
          >
            {category}
          </span>
        </div>

        {/* AI diagnosis box */}
        <div
          style={{
            background: BLUE_BG,
            border: `1px solid rgba(29,78,216,0.15)`,
            borderRadius: "14px",
            padding: "18px 20px",
            marginBottom: "24px",
            display: "flex",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(29,78,216,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "2px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "19px", color: BLUE }}>psychology</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "15px", fontFamily: "var(--font-dm-sans)", color: BLUE, marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Laura&apos;s Assessment
            </p>
            <p style={{ fontSize: "17px", fontFamily: "var(--font-dm-sans)", color: NAVY_MED, lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
              {aiDiagnosis}
            </p>
          </div>
        </div>

        {/* Checklist */}
        {troubleshootingSteps.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "16px", fontFamily: "var(--font-dm-sans)", color: MUTED, marginBottom: "12px", fontWeight: 600 }}>
              Steps to try before requesting dispatch:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {troubleshootingSteps.map((step, i) => {
                const checked = checkedSteps.has(i);
                return (
                  <label
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: checked ? GREEN_BG : "rgba(15,28,40,0.03)",
                      border: `1px solid ${checked ? "rgba(10,122,82,0.20)" : CARD_BORDER}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setCheckedSteps(prev => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i); else next.add(i);
                          return next;
                        });
                      }}
                      style={{ marginTop: "2px", accentColor: GREEN, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "17px", fontFamily: "var(--font-dm-sans)", color: checked ? MUTED : NAVY, lineHeight: "1.5", textDecoration: checked ? "line-through" : "none" }}>
                      {step}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleResolved}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              background: GREEN_BG,
              border: `1px solid rgba(10,122,82,0.25)`,
              color: GREEN,
              fontSize: "17px",
              fontWeight: 600,
              fontFamily: "var(--font-dm-sans)",
              cursor: "pointer",
            }}
          >
            Issue is resolved ✓
          </button>
          <button
            onClick={() => setState("submit")}
            disabled={!allChecked}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              background: allChecked ? BURGUNDY : "rgba(15,28,40,0.07)",
              border: "none",
              color: allChecked ? "#FFFFFF" : SUBTLE,
              fontSize: "17px",
              fontWeight: 600,
              fontFamily: "var(--font-dm-sans)",
              cursor: allChecked ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            Still need help — Request Dispatch
          </button>
        </div>
      </div>
    );
  }

  if (state === "submit") {
    return (
      <div>
        <button
          onClick={() => setState("troubleshoot")}
          style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "16px", fontFamily: "var(--font-dm-sans)", padding: 0, marginBottom: "20px" }}
        >
          ← Back
        </button>

        <div
          style={{
            background: "#FAFAF9",
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <p style={{ fontSize: "14px", fontFamily: "var(--font-dm-sans)", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px", fontWeight: 600 }}>
            Request Summary
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <SummaryRow label="Category" value={category} />
            <SummaryRow label="Description" value={description} />
            <SummaryRow
              label="Troubleshooting attempted"
              value={`${checkedSteps.size} of ${troubleshootingSteps.length} steps`}
            />
          </div>
        </div>

        <p style={{ fontSize: "16px", fontFamily: "var(--font-dm-sans)", color: MUTED, marginBottom: "20px", lineHeight: "1.6" }}>
          By submitting, Ebin will be notified and will schedule a contractor.
        </p>

        {error && (
          <p style={{ color: RED, fontSize: "16px", marginBottom: "12px", padding: "10px 14px", background: RED_BG, borderRadius: "10px", fontFamily: "var(--font-dm-sans)" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            padding: "14px 28px",
            borderRadius: "12px",
            background: BURGUNDY,
            border: "none",
            color: "#FFFFFF",
            fontSize: "17px",
            fontWeight: 600,
            fontFamily: "var(--font-dm-sans)",
            cursor: "pointer",
          }}
        >
          Submit Maintenance Request
        </button>
      </div>
    );
  }

  // Done state
  if (doneVariant === "resolved") {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: GREEN_BG,
            border: `1px solid rgba(10,122,82,0.25)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "28px", color: GREEN }}>check_circle</span>
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "23px", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>
          Great, glad that worked!
        </p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "17px", color: MUTED }}>
          No further action needed.
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: BURG_BG,
          border: `1px solid ${BURG_BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: BURGUNDY }}>task_alt</span>
      </div>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "23px", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>
        Request Submitted
      </p>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "17px", color: MUTED, lineHeight: "1.6" }}>
        Ebin has been notified and will be in touch.
        {submittedId && <span style={{ display: "block", color: SUBTLE, fontSize: "15px", marginTop: "6px" }}>Ref: {submittedId.slice(0, 8)}</span>}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "14px", fontFamily: "var(--font-dm-sans)", color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px", fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ fontSize: "17px", fontFamily: "var(--font-dm-sans)", color: NAVY, lineHeight: "1.5" }}>
        {value}
      </p>
    </div>
  );
}
