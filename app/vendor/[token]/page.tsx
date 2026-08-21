"use client";
import { useState, useEffect, use } from "react";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const NAVY = "#1F2F3A";

const STATUS_LABELS: Record<string, string> = {
  vendor_assigned: "Awaiting your response",
  scheduled: "Accepted — scheduled",
  work_complete: "Marked complete — pending verification",
  verified: "Verified by Prospera",
  closed: "Closed",
};

interface Job {
  id: string;
  category: string;
  description: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  vendor: { id: string; name: string; trade: string } | null;
  propertyAddress: string;
  propertyCity: string;
  contactName: string | null;
  contactPhone: string | null;
}

export default function VendorJobPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    fetch(`/api/vendor/jobs?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.job) setJob(data.job);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  async function act(action: "accept" | "decline" | "complete") {
    setBusy(true);
    const res = await fetch("/api/vendor/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action }),
    });
    if (res.ok) {
      const data = await res.json();
      if (action === "decline") {
        setDeclined(true);
      } else if (job) {
        setJob({ ...job, status: data.job.status });
      }
    }
    setBusy(false);
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", backgroundColor: BG }} />;
  }

  if (declined) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "var(--font-dm-sans, sans-serif)" }}>
        <p style={{ fontSize: 15, color: TEXT_SEC, textAlign: "center" }}>You've declined this job. Prospera has been notified.</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "var(--font-dm-sans, sans-serif)" }}>
        <p style={{ fontSize: 15, color: TEXT_SEC, textAlign: "center" }}>This job link isn't valid or has expired.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "var(--font-dm-sans, sans-serif)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px 60px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUT, marginBottom: 8 }}>Prospera Properties</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: "0 0 4px" }}>{job.category}</h1>
        <p style={{ fontSize: 14, color: TEXT_SEC, marginBottom: 24 }}>{STATUS_LABELS[job.status] ?? job.status}</p>

        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_MUT, marginBottom: 6 }}>Property</p>
          <p style={{ fontSize: 15, color: TEXT, marginBottom: 18 }}>{job.propertyAddress}{job.propertyCity ? `, ${job.propertyCity}` : ""}</p>

          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_MUT, marginBottom: 6 }}>Issue</p>
          <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.6, marginBottom: 18 }}>{job.description}</p>

          {job.contactName && (
            <>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_MUT, marginBottom: 6 }}>Contact for access</p>
              <p style={{ fontSize: 15, color: TEXT }}>
                {job.contactName}{job.contactPhone ? ` · ${job.contactPhone}` : ""}
              </p>
            </>
          )}
        </div>

        {job.status === "vendor_assigned" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => act("decline")}
              disabled={busy}
              style={{ flex: 1, padding: "16px", borderRadius: 12, border: `1px solid ${BORDER}`, backgroundColor: "transparent", color: TEXT_SEC, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            >
              Decline
            </button>
            <button
              onClick={() => act("accept")}
              disabled={busy}
              style={{ flex: 1, padding: "16px", borderRadius: 12, border: "none", backgroundColor: ACCENT, color: "#FAF8F5", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            >
              Accept job
            </button>
          </div>
        )}

        {job.status === "scheduled" && (
          <button
            onClick={() => act("complete")}
            disabled={busy}
            style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", backgroundColor: NAVY, color: "#FAF8F5", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Mark job complete
          </button>
        )}

        {(job.status === "work_complete" || job.status === "verified" || job.status === "closed") && (
          <p style={{ fontSize: 13, color: TEXT_MUT, textAlign: "center" }}>
            {job.status === "work_complete" ? "Waiting on Prospera to verify the work." : "This job is finished — thanks for the work."}
          </p>
        )}
      </div>
    </div>
  );
}
