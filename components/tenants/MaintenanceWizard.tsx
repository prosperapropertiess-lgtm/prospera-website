"use client";

import { useState } from "react";

const CARD = "#0D1825";
const CARD_HOVER = "#111F2E";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";
const TEXT_DIM = "rgba(237,232,225,0.20)";
const GREEN = "#34d399";
const AMBER = "#fbbf24";
const BLUE = "#60a5fa";
const PURPLE = "#a78bfa";
const PINK = "#f472b6";
const CRIMSON = "#8B2030";

type WizardState = "category" | "describe" | "diagnosing" | "troubleshoot" | "submit" | "done";
type DoneVariant = "resolved" | "submitted";

interface CategoryOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: "Plumbing", label: "Plumbing", icon: "water_drop", color: BLUE },
  { id: "Electrical", label: "Electrical", icon: "bolt", color: AMBER },
  { id: "Appliances", label: "Appliances", icon: "kitchen", color: PURPLE },
  { id: "HVAC / Heating", label: "HVAC / Heating", icon: "thermostat", color: PINK },
  { id: "Pest / Rodents", label: "Pest / Rodents", icon: "pest_control", color: GREEN },
  { id: "Other", label: "Other", icon: "build", color: TEXT_SEC },
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

  async function handleDiagnose() {
    if (description.trim().length < 10) return;
    setState("diagnosing");
    setError(null);
    try {
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
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: TEXT_SEC, marginBottom: "20px" }}>
          What type of issue are you experiencing?
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setState("describe"); }}
              style={{
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = CARD_HOVER;
                (e.currentTarget as HTMLElement).style.borderColor = `${cat.color}40`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = CARD;
                (e.currentTarget as HTMLElement).style.borderColor = CARD_BORDER;
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: `${cat.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: cat.color }}>
                  {cat.icon}
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: TEXT }}>
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
            style={{ background: "none", border: "none", color: TEXT_SEC, cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-dm-sans)", padding: 0 }}
          >
            ← Back
          </button>
          <span
            style={{
              padding: "3px 12px",
              borderRadius: "100px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              fontSize: "12px",
              fontFamily: "var(--font-dm-sans)",
              color: TEXT_SEC,
            }}
          >
            {category}
          </span>
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px", padding: "8px 12px", background: "rgba(248,113,113,0.10)", borderRadius: "8px", fontFamily: "var(--font-dm-sans)" }}>
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
            fontSize: "14px",
            fontFamily: "var(--font-dm-sans)",
            color: TEXT,
            background: CARD,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: "12px",
            outline: "none",
            lineHeight: "1.6",
            boxSizing: "border-box",
            marginBottom: "16px",
          }}
        />
        <button
          onClick={handleDiagnose}
          disabled={description.trim().length < 10}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            background: description.trim().length >= 10 ? CRIMSON : "rgba(255,255,255,0.06)",
            color: description.trim().length >= 10 ? TEXT : TEXT_DIM,
            border: "none",
            cursor: description.trim().length >= 10 ? "pointer" : "not-allowed",
            fontSize: "14px",
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
                background: "#C9A84C",
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
        <p style={{ color: TEXT_SEC, fontSize: "15px", fontFamily: "var(--font-dm-sans)" }}>
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
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              fontSize: "12px",
              fontFamily: "var(--font-dm-sans)",
              color: TEXT_SEC,
            }}
          >
            {category}
          </span>
        </div>

        {/* AI diagnosis box */}
        <div
          style={{
            background: CARD,
            borderLeft: `3px solid ${BLUE}`,
            borderRadius: "12px",
            padding: "18px 20px",
            marginBottom: "24px",
          }}
        >
          <p style={{ fontSize: "12px", fontFamily: "var(--font-dm-sans)", color: BLUE, marginBottom: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Laura&apos;s Assessment
          </p>
          <p style={{ fontSize: "14px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC, lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
            {aiDiagnosis}
          </p>
        </div>

        {/* Checklist */}
        {troubleshootingSteps.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "13px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC, marginBottom: "14px", fontWeight: 600 }}>
              Steps to try before requesting dispatch:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                      background: checked ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${checked ? "rgba(52,211,153,0.20)" : CARD_BORDER}`,
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
                    <span style={{ fontSize: "14px", fontFamily: "var(--font-dm-sans)", color: checked ? TEXT_SEC : TEXT, lineHeight: "1.5", textDecoration: checked ? "line-through" : "none" }}>
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
              background: "transparent",
              border: `1px solid ${GREEN}`,
              color: GREEN,
              fontSize: "14px",
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
              background: allChecked ? CRIMSON : "rgba(255,255,255,0.06)",
              border: "none",
              color: allChecked ? TEXT : TEXT_DIM,
              fontSize: "14px",
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
          style={{ background: "none", border: "none", color: TEXT_SEC, cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-dm-sans)", padding: 0, marginBottom: "20px" }}
        >
          ← Back
        </button>

        <div
          style={{
            background: CARD,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <p style={{ fontSize: "11px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
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

        <p style={{ fontSize: "13px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC, marginBottom: "20px", lineHeight: "1.6" }}>
          By submitting, Ebin will be notified and will schedule a contractor.
        </p>

        {error && (
          <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px", padding: "8px 12px", background: "rgba(248,113,113,0.10)", borderRadius: "8px", fontFamily: "var(--font-dm-sans)" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            padding: "14px 28px",
            borderRadius: "12px",
            background: CRIMSON,
            border: "none",
            color: TEXT,
            fontSize: "14px",
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
            background: "rgba(52,211,153,0.12)",
            border: `1px solid rgba(52,211,153,0.30)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "28px", color: GREEN }}>check_circle</span>
        </div>
        <p style={{ fontFamily: "var(--font-outfit)", fontSize: "20px", fontWeight: 600, color: TEXT, marginBottom: "8px" }}>
          Great, glad that worked!
        </p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: TEXT_SEC }}>
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
          background: `${CRIMSON}20`,
          border: `1px solid ${CRIMSON}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#C9A84C" }}>task_alt</span>
      </div>
      <p style={{ fontFamily: "var(--font-outfit)", fontSize: "20px", fontWeight: 600, color: TEXT, marginBottom: "8px" }}>
        Request Submitted
      </p>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: TEXT_SEC, lineHeight: "1.6" }}>
        Ebin has been notified and will be in touch.
        {submittedId && <span style={{ display: "block", color: TEXT_DIM, fontSize: "12px", marginTop: "6px" }}>Ref: {submittedId.slice(0, 8)}</span>}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
        {label}
      </p>
      <p style={{ fontSize: "14px", fontFamily: "var(--font-dm-sans)", color: TEXT, lineHeight: "1.5" }}>
        {value}
      </p>
    </div>
  );
}
