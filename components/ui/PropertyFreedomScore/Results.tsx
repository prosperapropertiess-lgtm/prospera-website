"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreResult, CATEGORY_LABELS } from "./scoring";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BORDER = "#D8D2C8";
const MUTED = "#666666";

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#333333", fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", fontWeight: 700, color: NAVY }}>{score}</span>
      </div>
      <div style={{ height: "6px", backgroundColor: "#E8E3DC", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, backgroundColor: BURGUNDY, borderRadius: "99px", transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

function RecommendationCard({ item }: { item: ScoreResult["quickWins"][0] }) {
  const diffColor = item.difficulty === "Easy" ? "#27AE60" : item.difficulty === "Medium" ? "#E67E22" : "#C0392B";
  const impactColor = item.impact === "High" ? "#27AE60" : item.impact === "Medium" ? "#E67E22" : MUTED;
  return (
    <div style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: "0.875rem", padding: "1.5rem", borderLeft: `3px solid ${BURGUNDY}` }}>
      <h4 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1rem", color: NAVY, margin: "0 0 0.375rem" }}>{item.title}</h4>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "#333333", margin: "0 0 0.75rem", lineHeight: 1.6 }}>{item.whyItMatters}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", backgroundColor: "#F7F5F2", color: MUTED, borderRadius: "99px", padding: "0.2rem 0.6rem", border: `1px solid ${BORDER}` }}>{item.timeToImplement}</span>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", backgroundColor: "#F7F5F2", color: diffColor, borderRadius: "99px", padding: "0.2rem 0.6rem", border: `1px solid ${BORDER}`, fontWeight: 600 }}>{item.difficulty}</span>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", backgroundColor: "#F7F5F2", color: impactColor, borderRadius: "99px", padding: "0.2rem 0.6rem", border: `1px solid ${BORDER}`, fontWeight: 600 }}>{item.impact} Impact</span>
      </div>
    </div>
  );
}

export default function FreedomScoreResults() {
  const router = useRouter();
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("freedom_score_result");
      const savedName = sessionStorage.getItem("freedom_score_name");
      if (!raw) { router.replace("/freedom-score"); return; }
      setResult(JSON.parse(raw));
      if (savedName) setName(savedName);
    } catch {
      router.replace("/freedom-score");
    }
  }, [router]);

  if (!result) return null;

  const workWeeks = (result.yearlyHours / 40).toFixed(1);
  const subscoreEntries: [string, number][] = Object.entries(result.subscores).map(
    ([k, v]) => [CATEGORY_LABELS[k] ?? k, v as number]
  );

  return (
    <div>
      {/* Score */}
      <div style={{ textAlign: "center", padding: "2rem 0", borderBottom: `1px solid ${BORDER}`, marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, color: MUTED, marginBottom: "1rem" }}>
          Your Property Freedom Score™
        </p>
        {name && (
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem", color: MUTED, marginBottom: "0.5rem" }}>
            Here&apos;s your results, {name.split(" ")[0]}.
          </p>
        )}
        <div style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "clamp(5rem, 18vw, 7rem)", lineHeight: 1, color: result.color, marginBottom: "0.125rem" }}>
          {result.overall}
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: MUTED, margin: "0 0 0.625rem" }}>/ 100 Property Freedom Score™</p>
        <div style={{ display: "inline-block", backgroundColor: result.color, color: "#FFFFFF", fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "0.875rem", padding: "0.3rem 1rem", borderRadius: "99px", marginBottom: "0.75rem" }}>
          {result.label}
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#333333", maxWidth: "420px", margin: "0 auto" }}>
          {result.overall < 40
            ? "Your rental is running you, not the other way around. The good news: it's all fixable."
            : result.overall < 60
            ? "You have some systems, but significant time is still being left on the table."
            : result.overall < 75
            ? "You're doing better than most landlords. A few targeted fixes will make a real difference."
            : "You're running a well-organized operation. Fine-tune the remaining gaps."}
        </p>
      </div>

      {/* Subscores */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.25rem", color: NAVY, marginBottom: "1rem" }}>Score Breakdown</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {subscoreEntries.map(([label, score]) => (
            <ScoreBar key={label} label={label} score={score} />
          ))}
        </div>
      </div>

      {/* Time cost */}
      <div style={{ backgroundColor: "#F7F5F2", border: `1px solid ${BORDER}`, borderRadius: "0.875rem", padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1rem", color: NAVY, margin: "0 0 0.375rem" }}>
          Your time cost
        </p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "#555555", margin: 0 }}>
          You&apos;re spending roughly <strong style={{ color: NAVY }}>{result.yearlyHours} hours per year</strong>, that&apos;s {workWeeks} work weeks, managing your rentals.
        </p>
      </div>

      {/* Quick wins */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.25rem", color: NAVY, marginBottom: "0.375rem" }}>Your Top 3 Quick Wins</h3>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: MUTED, marginBottom: "1rem" }}>Based on your lowest-scoring areas.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {result.quickWins.map((item) => <RecommendationCard key={item.title} item={item} />)}
        </div>
      </div>

      {/* CTA */}
      <div style={{ backgroundColor: NAVY, borderRadius: "1rem", padding: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 700, fontSize: "1.5rem", color: "#FAF8F5", margin: "0 0 0.75rem" }}>
          Want help implementing this?
        </h3>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9375rem", color: "rgba(250,248,245,0.75)", lineHeight: 1.7, margin: "0 auto 1.5rem", maxWidth: "420px" }}>
          Your action plan is clear. The question is whether you want to do it yourself, or have someone do it for you.
        </p>
        <a
          href="/contact"
          style={{ display: "inline-block", backgroundColor: BURGUNDY, color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "0.9375rem", padding: "0.875rem 2rem", borderRadius: "0.5rem", textDecoration: "none" }}
        >
          Talk to Ebin →
        </a>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8125rem", color: "rgba(250,248,245,0.4)", margin: "0.75rem 0 0" }}>
          No contracts. 90-day guarantee.
        </p>
      </div>

      {/* Retake */}
      <div style={{ textAlign: "center" }}>
        <a
          href="/freedom-score"
          style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: MUTED, textDecoration: "none" }}
        >
          Retake assessment
        </a>
      </div>
    </div>
  );
}
