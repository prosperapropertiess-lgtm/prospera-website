"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, TOTAL, AnyQuestion, SingleQuestion, SliderQuestion } from "./questions";
import { computeScoreResult, Answers, ScoreResult } from "./scoring";

// ─── Progress copy — changes with momentum ─────────────────────────────────

function progressCopy(pct: number): string {
  if (pct === 0) return "Let's find out how free you really are.";
  if (pct < 25) return "Good start. Keep going.";
  if (pct < 50) return "You're building a clear picture.";
  if (pct < 65) return "Halfway. Your score is taking shape.";
  if (pct < 80) return "Almost there — just a few left.";
  if (pct < 100) return "Last questions. Your report is nearly ready.";
  return "Done! Calculating your score…";
}

// ─── KPI tracking ───────────────────────────────────────────────────────────

function trackFreedom(event: string, metadata?: Record<string, unknown>) {
  fetch("/api/analytics/popup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, page: "/freedom-score", metadata }),
  }).catch(() => {});
  // Also fire Meta Pixel if available
  if (typeof window !== "undefined" && (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq) {
    (window as unknown as { fbq: (...a: unknown[]) => void }).fbq("trackCustom", event, metadata);
  }
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function PropertyFreedomScore() {
  const router = useRouter();
  const [phase, setPhase] = useState<"welcome" | "quiz" | "calculating" | "lead" | "results">("welcome");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [milestone, setMilestone] = useState<string | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [visible, setVisible] = useState(true);
  const milestoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  const pct = Math.round((qIndex / TOTAL) * 100);
  const currentQ = QUESTIONS[qIndex] as AnyQuestion | undefined;

  function transition(fn: () => void) {
    setVisible(false);
    setTimeout(() => { fn(); setVisible(true); }, 180);
  }

  function showMilestone(text: string) {
    setMilestone(text);
    if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
    milestoneTimer.current = setTimeout(() => setMilestone(null), 1800);
  }

  function advanceQ(q: AnyQuestion) {
    const isLast = qIndex === TOTAL - 1;
    if ("milestone" in q && q.milestone) showMilestone(q.milestone);
    if (isLast) {
      transition(() => setPhase("calculating"));
    } else {
      transition(() => setQIndex((i) => i + 1));
    }
  }

  // Auto-advance to lead after fake calculate
  useEffect(() => {
    if (phase !== "calculating") return;
    const t = setTimeout(() => {
      const r = computeScoreResult(answers);
      setResult(r);
      trackFreedom("freedom_test_completed", { score: r.overall, category: r.label });
      setPhase("lead");
    }, 1800);
    return () => clearTimeout(t);
  }, [phase, answers]);

  function handleSingleAnswer(q: SingleQuestion, value: string, score: number) {
    const updated = { ...answers, [q.id]: value };
    setAnswers(updated);
    // Track first answer as "started"
    if (!startedRef.current) {
      startedRef.current = true;
      trackFreedom("freedom_test_started");
    }
    setTimeout(() => advanceQ(q), 220);
  }

  function handleSliderNext(q: SliderQuestion) {
    if (answers[q.id] === undefined) setAnswers((a) => ({ ...a, [q.id]: q.defaultValue }));
    if (!startedRef.current) {
      startedRef.current = true;
      trackFreedom("freedom_test_started");
    }
    advanceQ(q);
  }

  function handleLeadSubmit() {
    if (!leadEmail.trim()) return;
    fetch("/api/freedom-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: leadName, email: leadEmail, phone: leadPhone, answers, result }),
    }).catch(() => {});
    // Track completion with score
    trackFreedom("freedom_test_completed");
    if (result) {
      trackFreedom("freedom_test_result", {
        score: result.overall,
        category: result.label,
        email: leadEmail,
      });
    }
    // Save to sessionStorage and redirect to trackable results URL
    try {
      sessionStorage.setItem("freedom_score_result", JSON.stringify(result));
      sessionStorage.setItem("freedom_score_name", leadName);
    } catch {}
    router.push("/freedom-score/results");
  }

  const containerStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : "translateX(14px)",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  };

  // ── WELCOME ──────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, color: "#666666", marginBottom: "1rem" }}>
            Property Freedom Score™
          </p>
          <h1 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "clamp(1.75rem, 5vw, 2.75rem)", color: "#1F2F3A", lineHeight: 1.2, marginBottom: "1rem" }}>
            How free are you from your rentals?
          </h1>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem", color: "#555555", lineHeight: 1.7, maxWidth: "500px", margin: "0 auto 2rem" }}>
            12 quick questions. 2 minutes. You&apos;ll get a personalized score, your top bottlenecks, and a free action plan.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", marginBottom: "2.5rem" }}>
          {[
            { n: "12", label: "questions" },
            { n: "90 sec", label: "to complete" },
            { n: "Free", label: "action plan" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8", borderRadius: "0.875rem", padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.25rem", color: "#1F2F3A" }}>{s.n}</div>
              <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => transition(() => setPhase("quiz"))}
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "1rem", padding: "0.875rem 2.5rem", borderRadius: "0.5rem", border: "none", cursor: "pointer" }}
          >
            Start My Assessment →
          </button>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#999999", marginTop: "0.625rem" }}>
            No credit card. No spam. Just your score.
          </p>
        </div>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (phase === "quiz" && currentQ) {
    const sliderVal = (answers[currentQ.id] as number) ?? (currentQ.type === "slider" ? currentQ.defaultValue : undefined);

    return (
      <div>
        {/* Progress bar */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666" }}>
              {qIndex + 1} of {TOTAL}
            </span>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666" }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: "6px", backgroundColor: "#E8E3DC", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "#8B2030", borderRadius: "99px", transition: "width 0.4s ease" }} />
          </div>
          {/* Milestone flash */}
          <div style={{ minHeight: "1.25rem", marginTop: "0.375rem" }}>
            {milestone ? (
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "#27AE60", fontWeight: 600 }}>
                {milestone}
              </span>
            ) : (
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "#999999" }}>
                {progressCopy(pct)}
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <div style={containerStyle}>
          <h2 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "clamp(1.125rem, 3vw, 1.5rem)", color: "#1F2F3A", marginBottom: "1.5rem", lineHeight: 1.3 }}>
            {currentQ.text}
          </h2>

          {/* Single choice — tap to advance */}
          {currentQ.type === "single" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {(currentQ as SingleQuestion).options.map((opt) => {
                const selected = answers[currentQ.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSingleAnswer(currentQ as SingleQuestion, opt.value, opt.score)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.875rem 1.125rem",
                      borderRadius: "0.75rem",
                      border: selected ? "none" : "1px solid #D8D2C8",
                      backgroundColor: selected ? "#1F2F3A" : "#FFFFFF",
                      color: selected ? "#FAF8F5" : "#222222",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "0.9375rem",
                      cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Slider */}
          {currentQ.type === "slider" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#222222", fontWeight: 600 }}>Hours per month</span>
                <span style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.5rem", color: "#1F2F3A" }}>
                  {sliderVal} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#666666" }}>hrs</span>
                </span>
              </div>
              <input
                type="range"
                min={(currentQ as SliderQuestion).min}
                max={(currentQ as SliderQuestion).max}
                step={(currentQ as SliderQuestion).step}
                value={sliderVal ?? (currentQ as SliderQuestion).defaultValue}
                onChange={(e) => setAnswers((a) => ({ ...a, [currentQ.id]: Number(e.target.value) }))}
                style={{ width: "100%", accentColor: "#8B2030", cursor: "pointer", margin: "0.5rem 0 0.25rem" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "#999999", marginBottom: "1.5rem" }}>
                <span>0 hrs</span>
                <span>60 hrs</span>
              </div>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666", marginBottom: "1.5rem", fontStyle: "italic" }}>
                {sliderVal === 0
                  ? "Lucky you — or maybe not tracking it yet."
                  : sliderVal <= 8
                  ? "That's well-managed. Most landlords are above this."
                  : sliderVal <= 20
                  ? "This is the average range. Room to improve."
                  : "That's significant time. This is exactly what we help reduce."}
              </p>
              <button
                onClick={() => handleSliderNext(currentQ as SliderQuestion)}
                style={{ width: "100%", backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "1rem", padding: "0.875rem", borderRadius: "0.5rem", border: "none", cursor: "pointer" }}
              >
                Continue →
              </button>
            </div>
          )}
        </div>

        {/* Back button */}
        {qIndex > 0 && (
          <button
            onClick={() => transition(() => setQIndex((i) => i - 1))}
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#999999", background: "none", border: "none", cursor: "pointer", marginTop: "1.5rem", display: "block" }}
          >
            ← Back
          </button>
        )}
      </div>
    );
  }

  // ── CALCULATING ───────────────────────────────────────────────────────────
  if (phase === "calculating") {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1.25rem" }}>
          {["⚡", "📊", "🔍"][Math.floor(Date.now() / 100) % 3] || "📊"}
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.25rem", color: "#1F2F3A", marginBottom: "0.5rem" }}>
          Calculating your score…
        </p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#666666" }}>
          Analysing your answers across 6 categories.
        </p>
        {/* Animated bar */}
        <div style={{ maxWidth: "280px", margin: "2rem auto 0", height: "6px", backgroundColor: "#E8E3DC", borderRadius: "99px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              backgroundColor: "#8B2030",
              borderRadius: "99px",
              animation: "calcProgress 1.8s ease-in-out forwards",
            }}
          />
        </div>
        <style>{`@keyframes calcProgress { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }

  // ── LEAD CAPTURE ──────────────────────────────────────────────────────────
  if (phase === "lead") {
    const preview = result ? result.overall : 0;
    const previewColor = result ? result.color : "#E67E22";

    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          {/* Score teaser */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8", borderRadius: "2rem", padding: "0.625rem 1.25rem", marginBottom: "1.25rem" }}>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.5rem", color: previewColor }}>{preview}</span>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#666666" }}>/ 100 — your score is ready</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.75rem", color: "#1F2F3A", margin: "0 0 0.625rem" }}>
            Where should we send your report?
          </h2>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#555555", margin: 0 }}>
            Ebin reviews every submission personally. You&apos;ll also get the full breakdown with your action plan.
          </p>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: "0.875rem", padding: "1.75rem", marginBottom: "1.25rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", fontWeight: 600, color: "#222222", display: "block", marginBottom: "0.375rem" }}>Full Name</label>
            <input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="Your name"
              style={{ width: "100%", fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", padding: "0.75rem 1rem", border: "1px solid #D8D2C8", borderRadius: "0.5rem", outline: "none", backgroundColor: "#FAF8F5", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", fontWeight: 600, color: "#222222", display: "block", marginBottom: "0.375rem" }}>
              Email Address <span style={{ color: "#8B2030" }}>*</span>
            </label>
            <input
              type="email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ width: "100%", fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", padding: "0.75rem 1rem", border: "1px solid #D8D2C8", borderRadius: "0.5rem", outline: "none", backgroundColor: "#FAF8F5", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", fontWeight: 600, color: "#222222", display: "block", marginBottom: "0.375rem" }}>
              Phone <span style={{ fontWeight: 400, color: "#999999" }}>(optional)</span>
            </label>
            <input
              type="tel"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              placeholder="(519) 000-0000"
              style={{ width: "100%", fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", padding: "0.75rem 1rem", border: "1px solid #D8D2C8", borderRadius: "0.5rem", outline: "none", backgroundColor: "#FAF8F5", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <button
          onClick={handleLeadSubmit}
          disabled={!leadEmail.trim()}
          style={{
            width: "100%",
            backgroundColor: leadEmail.trim() ? "#8B2030" : "#D8D2C8",
            color: leadEmail.trim() ? "#FAF8F5" : "#999999",
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 600,
            fontSize: "1rem",
            padding: "0.9375rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: leadEmail.trim() ? "pointer" : "not-allowed",
            transition: "all 0.15s ease",
          }}
        >
          See My Full Report →
        </button>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#BBBBBB", textAlign: "center", marginTop: "0.75rem" }}>
          No spam. No automated replies.
        </p>
      </div>
    );
  }

  return null;
}
