"use client";

import React, { useState, useCallback } from "react";
import { STAGES } from "./questions";
import type { AnyQuestion, Question, SliderQuestion as SliderQ, LikertQuestion as LikertQ } from "./questions";
import { computeScoreResult, Answers, ScoreResult, getScoreColor, getScoreLabel } from "./scoring";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build default answers for sliders (defaultValue) and likerts (3)
// ─────────────────────────────────────────────────────────────────────────────
function buildDefaultAnswers(): Answers {
  const defaults: Answers = {};
  for (const stage of STAGES) {
    for (const q of stage.questions) {
      if (q.type === "slider") {
        defaults[q.id] = (q as SliderQ).defaultValue;
      } else if (q.type === "likert") {
        defaults[q.id] = 3;
      }
    }
  }
  return defaults;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface SingleQuestionProps {
  question: Question;
  value: string | undefined;
  onChange: (val: string) => void;
}

function SingleQuestion({ question, value, onChange }: SingleQuestionProps) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "1rem", color: "#222222", marginBottom: "0.75rem" }}>
        {question.text}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {question.options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
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
                transition: "all 0.15s ease",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666", fontStyle: "italic", marginTop: "0.625rem", lineHeight: 1.5 }}>
        {question.why}
      </p>
    </div>
  );
}

interface SliderQuestionProps {
  question: SliderQ;
  value: number;
  onChange: (val: number) => void;
}

function SliderQuestionInput({ question, value, onChange }: SliderQuestionProps) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "1rem", color: "#222222", margin: 0 }}>
          {question.text}
        </p>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.125rem", color: "#1F2F3A", whiteSpace: "nowrap", marginLeft: "1rem" }}>
          {value} <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#666666" }}>{question.unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={question.min}
        max={question.max}
        step={question.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#8B2030", cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "#666666", marginTop: "0.25rem" }}>
        <span>{question.min} {question.unit}</span>
        <span>{question.max} {question.unit}</span>
      </div>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666", fontStyle: "italic", marginTop: "0.5rem", lineHeight: 1.5 }}>
        {question.why}
      </p>
    </div>
  );
}

interface LikertQuestionProps {
  question: LikertQ;
  value: number;
  onChange: (val: number) => void;
}

function LikertQuestionInput({ question, value, onChange }: LikertQuestionProps) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "1rem", color: "#222222", marginBottom: "0.875rem" }}>
        {question.text}
      </p>
      <div style={{ display: "flex", gap: "0.625rem", alignItems: "center", marginBottom: "0.5rem" }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: selected ? "none" : "1.5px solid #D8D2C8",
                backgroundColor: selected ? "#1F2F3A" : "#FFFFFF",
                color: selected ? "#FAF8F5" : "#666666",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: selected ? 700 : 400,
                fontSize: "0.9375rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
                flexShrink: 0,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "#666666" }}>
        <span style={{ maxWidth: "45%", lineHeight: 1.4 }}>{question.lowLabel}</span>
        <span style={{ maxWidth: "45%", textAlign: "right", lineHeight: 1.4 }}>{question.highLabel}</span>
      </div>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666", fontStyle: "italic", marginTop: "0.625rem", lineHeight: 1.5 }}>
        {question.why}
      </p>
    </div>
  );
}

function renderQuestion(q: AnyQuestion, answers: Answers, setAnswer: (id: string, val: string | number) => void) {
  if (q.type === "single") {
    return (
      <SingleQuestion
        key={q.id}
        question={q as Question}
        value={answers[q.id] as string | undefined}
        onChange={(val) => setAnswer(q.id, val)}
      />
    );
  }
  if (q.type === "slider") {
    const sq = q as SliderQ;
    return (
      <SliderQuestionInput
        key={q.id}
        question={sq}
        value={(answers[q.id] as number) ?? sq.defaultValue}
        onChange={(val) => setAnswer(q.id, val)}
      />
    );
  }
  if (q.type === "likert") {
    return (
      <LikertQuestionInput
        key={q.id}
        question={q as LikertQ}
        value={(answers[q.id] as number) ?? 3}
        onChange={(val) => setAnswer(q.id, val)}
      />
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Score bar
// ─────────────────────────────────────────────────────────────────────────────

interface ScoreBarProps {
  label: string;
  score: number;
}

function ScoreBar({ label, score }: ScoreBarProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#333333", fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", fontWeight: 700, color: "#1F2F3A" }}>{score}</span>
      </div>
      <div style={{ height: "6px", backgroundColor: "#E8E3DC", borderRadius: "99px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            backgroundColor: "#8B2030",
            borderRadius: "99px",
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommendation card
// ─────────────────────────────────────────────────────────────────────────────

interface RecommendationCardProps {
  item: ScoreResult["quickWins"][0];
}

function RecommendationCard({ item }: RecommendationCardProps) {
  const difficultyColor = item.difficulty === "Easy" ? "#27AE60" : item.difficulty === "Medium" ? "#E67E22" : "#C0392B";
  const impactColor = item.impact === "High" ? "#27AE60" : item.impact === "Medium" ? "#E67E22" : "#666666";

  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: "0.875rem", padding: "1.5rem", borderLeft: "3px solid #8B2030" }}>
      <h4 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "1.1875rem", color: "#1F2F3A", margin: "0 0 0.5rem" }}>{item.title}</h4>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#333333", margin: "0 0 0.75rem", lineHeight: 1.6 }}>
        <strong>Problem:</strong> {item.problem}
      </p>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#333333", margin: "0 0 1rem", lineHeight: 1.6 }}>
        {item.whyItMatters}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", backgroundColor: "#F7F5F2", color: "#666666", borderRadius: "99px", padding: "0.25rem 0.625rem", border: "1px solid #D8D2C8" }}>
          {item.timeToImplement}
        </span>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", backgroundColor: "#F7F5F2", color: difficultyColor, borderRadius: "99px", padding: "0.25rem 0.625rem", border: "1px solid #D8D2C8", fontWeight: 600 }}>
          {item.difficulty}
        </span>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", backgroundColor: "#F7F5F2", color: impactColor, borderRadius: "99px", padding: "0.25rem 0.625rem", border: "1px solid #D8D2C8", fontWeight: 600 }}>
          {item.impact} Impact
        </span>
        {item.diyPossible && (
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", backgroundColor: "#F7F5F2", color: "#666666", borderRadius: "99px", padding: "0.25rem 0.625rem", border: "1px solid #D8D2C8" }}>
            Can DIY
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Resource card
// ─────────────────────────────────────────────────────────────────────────────

interface ResourceCardProps {
  title: string;
  description: string;
}

function ResourceCard({ title, description }: ResourceCardProps) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: "0.875rem", padding: "1.5rem", borderTop: "2px solid #1F2F3A", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <h4 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "1.125rem", color: "#1F2F3A", margin: "0 0 0.5rem" }}>{title}</h4>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#666666", lineHeight: 1.6, margin: "0 0 1.25rem" }}>{description}</p>
      </div>
      <a
        href="/contact"
        style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", fontWeight: 600, color: "#8B2030", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
      >
        Request Template →
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  value: string;
  label: string;
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: "0.875rem", padding: "1.5rem", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "2rem", color: "#1F2F3A", lineHeight: 1.1, marginBottom: "0.375rem" }}>{value}</div>
      <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666" }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Category label map
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  communication: "Communication Freedom",
  maintenance: "Maintenance Systems",
  financial: "Financial Automation",
  operational: "Operational Maturity",
  time: "Time Efficiency",
  stress: "Stress Level",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function PropertyFreedomScore() {
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState<Answers>(buildDefaultAnswers);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [visible, setVisible] = useState(true);

  const setAnswer = useCallback((id: string, val: string | number) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }, []);

  const goToStage = useCallback((n: number, dir: "forward" | "back" = "forward") => {
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => {
      setStage(n);
      setVisible(true);
    }, 200);
  }, []);

  // Check if current stage has all required single questions answered
  const currentStageAnswered = (): boolean => {
    if (stage === 0 || stage === 8 || stage === 9) return true;
    const currentStageData = STAGES[stage - 1];
    if (!currentStageData) return true;
    return currentStageData.questions
      .filter((q) => q.type === "single")
      .every((q) => answers[q.id] !== undefined && answers[q.id] !== "");
  };

  const handleLeadSubmit = () => {
    if (!leadEmail) return;
    const computed = computeScoreResult(answers);
    setResult(computed);

    // Fire and forget submit
    fetch("/api/freedom-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        answers,
        result: computed,
        traffic_source: "organic",
      }),
    }).catch((err) => console.error("Freedom score submit error:", err));

    goToStage(9, "forward");
  };

  const translateX = visible ? "translateX(0)" : animDir === "forward" ? "translateX(20px)" : "translateX(-20px)";

  const containerStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: translateX,
    transition: "opacity 0.2s ease, transform 0.2s ease",
  };

  // ── WELCOME ──────────────────────────────────────────────────────────────
  if (stage === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, color: "#666666", marginBottom: "1rem" }}>
            Property Freedom Score™
          </p>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "clamp(2.25rem, 5vw, 3.25rem)", color: "#1F2F3A", lineHeight: 1.15, marginBottom: "1.25rem" }}>
            How Free Are You From Your Rentals?
          </h1>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1.0625rem", color: "#333333", lineHeight: 1.7, maxWidth: "540px", margin: "0 auto 2.5rem" }}>
            This 3–5 minute assessment measures how dependent your rental portfolio is on your personal involvement. You'll get a personalized score, your top bottlenecks, and a free action plan.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { label: "Your Score", desc: "See exactly where you stand on the 0-100 freedom scale" },
            { label: "Top Bottlenecks", desc: "The 3 areas holding you back most right now" },
            { label: "Free Action Plan", desc: "Specific, prioritized steps to reclaim your time" },
          ].map((item) => (
            <div
              key={item.label}
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: "0.875rem", padding: "1.5rem", textAlign: "center" }}
            >
              <div style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "1.125rem", color: "#1F2F3A", marginBottom: "0.5rem" }}>{item.label}</div>
              <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => goToStage(1, "forward")}
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "1rem", padding: "0.875rem 2.5rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", transition: "opacity 0.15s ease" }}
          >
            Start Your Assessment →
          </button>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666", marginTop: "0.75rem" }}>
            Takes 3–5 minutes. No credit card required.
          </p>
        </div>
      </div>
    );
  }

  // ── STAGE 1–7 ────────────────────────────────────────────────────────────
  if (stage >= 1 && stage <= 7) {
    const currentStageData = STAGES[stage - 1];
    const progressPct = ((stage - 1) / 7) * 100;
    const canContinue = currentStageAnswered();

    return (
      <div style={containerStyle}>
        {/* Progress */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666", fontWeight: 500 }}>
              Step {stage} of 7
            </span>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "#666666" }}>
              {Math.round(progressPct)}%
            </span>
          </div>
          <div style={{ height: "4px", backgroundColor: "#E8E3DC", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: "#8B2030", borderRadius: "99px", transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Stage header */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.5rem", color: "#1F2F3A", margin: "0 0 0.375rem" }}>
            {currentStageData.title}
          </h2>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#666666", margin: 0 }}>
            {currentStageData.subtitle}
          </p>
        </div>

        {/* Questions */}
        {currentStageData.questions.map((q) =>
          renderQuestion(q, answers, setAnswer)
        )}

        {/* Insight callout */}
        {currentStageData.insight && (
          <div style={{ backgroundColor: "rgba(31,47,58,0.06)", border: "1px solid rgba(31,47,58,0.12)", borderRadius: "0.875rem", padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "0.9375rem", color: "#1F2F3A", margin: "0 0 0.375rem" }}>
              {currentStageData.insight.headline}
            </p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#333333", lineHeight: 1.6, margin: 0 }}>
              {currentStageData.insight.body}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          {stage > 1 ? (
            <button
              onClick={() => goToStage(stage - 1, "back")}
              style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 500, fontSize: "0.9375rem", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", border: "1px solid #D8D2C8", backgroundColor: "transparent", color: "#666666", cursor: "pointer" }}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={() => goToStage(stage + 1, "forward")}
            disabled={!canContinue}
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 600,
              fontSize: "0.9375rem",
              padding: "0.75rem 2rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: canContinue ? "#8B2030" : "#D8D2C8",
              color: canContinue ? "#FAF8F5" : "#999999",
              cursor: canContinue ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── LEAD CAPTURE ─────────────────────────────────────────────────────────
  if (stage === 8) {
    const canSubmit = leadEmail.trim().length > 0;
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, color: "#666666", marginBottom: "0.875rem" }}>
            Almost Done
          </p>
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "2.25rem", color: "#1F2F3A", margin: "0 0 0.75rem" }}>
            Your score is ready.
          </h2>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem", color: "#333333", margin: "0 0 0.5rem" }}>
            Where should we send your personalized action plan?
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#666666", margin: 0 }}>
            Ebin reviews every submission personally. No automated responses.
          </p>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: "0.875rem", padding: "2rem", marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", fontWeight: 600, color: "#222222", display: "block", marginBottom: "0.375rem" }}>
              Full Name <span style={{ color: "#8B2030" }}>*</span>
            </label>
            <input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="Your name"
              style={{ width: "100%", fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", padding: "0.75rem 1rem", border: "1px solid #D8D2C8", borderRadius: "0.5rem", outline: "none", backgroundColor: "#FAF8F5", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
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
              Phone <span style={{ color: "#666666", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="tel"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              placeholder="(555) 000-0000"
              style={{ width: "100%", fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", padding: "0.75rem 1rem", border: "1px solid #D8D2C8", borderRadius: "0.5rem", outline: "none", backgroundColor: "#FAF8F5", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between" }}>
          <button
            onClick={() => goToStage(7, "back")}
            style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 500, fontSize: "0.9375rem", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", border: "1px solid #D8D2C8", backgroundColor: "transparent", color: "#666666", cursor: "pointer" }}
          >
            ← Back
          </button>
          <button
            onClick={handleLeadSubmit}
            disabled={!canSubmit}
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 600,
              fontSize: "0.9375rem",
              padding: "0.75rem 2rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: canSubmit ? "#8B2030" : "#D8D2C8",
              color: canSubmit ? "#FAF8F5" : "#999999",
              cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
          >
            See My Score →
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (stage === 9 && result) {
    const workWeeks = (result.yearlyHours / 40).toFixed(1);
    const vacationDays = (result.yearlyHours / 8).toFixed(0);

    const subscopeEntries: [string, number][] = [
      ["Communication Freedom", result.subscores.communication],
      ["Maintenance Systems", result.subscores.maintenance],
      ["Financial Automation", result.subscores.financial],
      ["Operational Maturity", result.subscores.operational],
      ["Time Efficiency", result.subscores.time],
      ["Stress Level", result.subscores.stress],
    ];

    const resources = [
      { title: "Communication Checklist", description: "The 8-point checklist to set up a landlord communication system that keeps tenants informed without consuming your time." },
      { title: "Maintenance Request Template", description: "A structured form that captures all the info you need before you call a contractor — no back-and-forth required." },
      { title: "Emergency Response Protocol", description: "A one-page plan tenants follow during emergencies, so you're only called when it's truly necessary." },
      { title: "Rent Collection Workflow", description: "The step-by-step Ontario-compliant process for collecting rent, following up on late payments, and issuing N4 notices." },
      { title: "Lease Renewal Calendar Template", description: "A 90-day countdown calendar that ensures you never miss a renewal window or let a lease lapse unexpectedly." },
      { title: "Vendor Contact Tracker", description: "A ready-to-use database template for organizing contractors, trades, and service providers with rates and notes." },
    ];

    return (
      <div style={containerStyle}>
        {/* Overall score */}
        <div style={{ textAlign: "center", padding: "2.5rem 0 2rem", borderBottom: "1px solid #D8D2C8", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, color: "#666666", marginBottom: "1.5rem" }}>
            Your Property Freedom Score™
          </p>
          <div style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "clamp(5rem, 15vw, 7rem)", lineHeight: 1, color: result.color, marginBottom: "0.25rem" }}>
            {result.overall}
          </div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#666666", margin: "0 0 0.5rem" }}>/ 100 Property Freedom Score™</p>
          <div style={{ display: "inline-block", backgroundColor: result.color, color: "#FFFFFF", fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "0.9375rem", padding: "0.375rem 1.25rem", borderRadius: "99px", marginBottom: "0.5rem" }}>
            {result.label}
          </div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#333333", marginTop: "1rem" }}>
            {result.overall < 40
              ? "Your rental is running you — not the other way around. The good news: it's all fixable."
              : result.overall < 60
              ? "You have some systems in place, but significant time and freedom is still being left on the table."
              : result.overall < 75
              ? "You're doing better than most landlords. A few targeted improvements will make a real difference."
              : result.overall < 90
              ? "You have a well-run operation. Fine-tuning the remaining gaps will get you close to truly passive."
              : "You're running a genuinely efficient rental portfolio. Use this report to maintain it."}
          </p>
        </div>

        {/* Subscores */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "1.5rem", color: "#1F2F3A", marginBottom: "1.25rem" }}>
            Score Breakdown
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {subscopeEntries.map(([label, score]) => (
              <ScoreBar key={label} label={label} score={score} />
            ))}
          </div>
        </div>

        {/* Time stats */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "1.5rem", color: "#1F2F3A", marginBottom: "0.5rem" }}>
            Your Time Cost
          </h3>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#666666", marginBottom: "1.25rem" }}>
            You're spending approximately <strong style={{ color: "#1F2F3A" }}>{result.yearlyHours} hours per year</strong> managing your rentals.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <StatCard value={`${result.monthlyHours}`} label="hours per month" />
            <StatCard value={workWeeks} label="work weeks per year" />
            <StatCard value={vacationDays} label="vacation days per year" />
          </div>
        </div>

        {/* Bottlenecks */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "1.5rem", color: "#1F2F3A", marginBottom: "1.25rem" }}>
            Your Top 3 Bottlenecks
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {result.bottlenecks.map((cat) => {
              const score = result.subscores[cat as keyof typeof result.subscores];
              return (
                <div
                  key={cat}
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: "0.875rem", padding: "1.25rem 1.5rem", borderLeft: "4px solid #8B2030" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "1rem", color: "#1F2F3A" }}>
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "0.9375rem", color: getScoreColor(score) }}>
                      {score}/100
                    </span>
                  </div>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#666666", margin: "0.375rem 0 0", lineHeight: 1.5 }}>
                    {score < 25
                      ? "Critical gap — this is a major source of operational drag."
                      : score < 50
                      ? "Significant gap — improvement here will have an outsized impact."
                      : "Moderate gap — targeted improvement will compound your gains."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Wins */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "1.5rem", color: "#1F2F3A", marginBottom: "0.5rem" }}>
            Quick Wins (This Week)
          </h3>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#666666", marginBottom: "1.25rem" }}>
            These are the highest-leverage improvements you can make right now.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {result.quickWins.map((item) => (
              <RecommendationCard key={item.title} item={item} />
            ))}
          </div>
        </div>

        {/* Long-term */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "1.5rem", color: "#1F2F3A", marginBottom: "0.5rem" }}>
            Long-Term Improvements
          </h3>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#666666", marginBottom: "1.25rem" }}>
            Strategic investments that pay back many times over.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {result.longTermImprovements.map((item) => (
              <RecommendationCard key={item.title} item={item} />
            ))}
          </div>
        </div>

        {/* Free Resources */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "1.5rem", color: "#1F2F3A", marginBottom: "0.5rem" }}>
            Free Resources
          </h3>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#666666", marginBottom: "1.25rem" }}>
            Templates and checklists for every area of your operation.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {resources.map((r) => (
              <ResourceCard key={r.title} title={r.title} description={r.description} />
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{ backgroundColor: "#1F2F3A", borderRadius: "1rem", padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "2rem", color: "#FAF8F5", margin: "0 0 1rem" }}>
            Want Help Implementing This?
          </h3>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem", color: "rgba(250,248,245,0.8)", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 1.75rem" }}>
            Your action plan is clear. The question is whether you want to do it yourself or have someone do it for you. Our team implements everything in this report — and then runs your portfolio so you never have to think about it again.
          </p>
          <a
            href="/contact"
            style={{ display: "inline-block", backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "1rem", padding: "0.875rem 2.25rem", borderRadius: "0.5rem", textDecoration: "none", marginBottom: "1rem" }}
          >
            Talk to Ebin →
          </a>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "rgba(250,248,245,0.5)", margin: 0 }}>
            No contracts. 90-day guarantee.
          </p>
        </div>

        {/* Print / restart */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => window.print()}
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", fontWeight: 500, padding: "0.625rem 1.25rem", border: "1px solid #D8D2C8", borderRadius: "0.5rem", backgroundColor: "transparent", color: "#666666", cursor: "pointer" }}
          >
            Print Report
          </button>
          <button
            onClick={() => {
              setAnswers(buildDefaultAnswers());
              setLeadName("");
              setLeadEmail("");
              setLeadPhone("");
              setResult(null);
              setSubmitStatus("idle");
              goToStage(0, "back");
            }}
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", fontWeight: 500, padding: "0.625rem 1.25rem", border: "1px solid #D8D2C8", borderRadius: "0.5rem", backgroundColor: "transparent", color: "#666666", cursor: "pointer" }}
          >
            Restart Assessment
          </button>
        </div>

        <style>{`
          @media print {
            button { display: none !important; }
            body { background: white !important; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
