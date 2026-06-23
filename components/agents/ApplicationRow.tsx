"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";

interface Application {
  id: string;
  tenant_name: string;
  tenant_email: string;
  status: string;
  ai_score: number | null;
  monthly_rent: number;
  created_at: string;
  properties: { address: string; city: string } | null;
}

export default function ApplicationRow({ application }: { application: Application }) {
  const [followUpState, setFollowUpState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const propertyAddress = application.properties
    ? `${application.properties.address}, ${application.properties.city}`
    : "—";

  const date = new Date(application.created_at).toLocaleDateString("en-CA", {
    month: "short", day: "numeric", year: "numeric",
  });

  async function sendFollowUp() {
    setFollowUpState("sending");
    try {
      const res = await fetch(`/api/agents/applications/${application.id}/followup`, {
        method: "POST",
      });
      setFollowUpState(res.ok ? "sent" : "error");
    } catch {
      setFollowUpState("error");
    }
  }

  return (
    <tr style={{ borderBottom: "1px solid rgba(250,248,245,0.06)" }}>
      <td style={{ padding: "14px 16px" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontWeight: 500 }}>
          {application.tenant_name}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>
          {application.tenant_email}
        </p>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
          {propertyAddress}
        </p>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <StatusBadge status={application.status} />
      </td>
      <td style={{ padding: "14px 16px" }}>
        {application.ai_score ? (
          <span style={{
            fontSize: 14,
            fontWeight: 600,
            color: application.ai_score >= 7 ? "#6EE7B7" : application.ai_score >= 5 ? "#FCD34D" : "#FCA5A5",
            fontFamily: "var(--font-dm-sans)",
          }}>
            {application.ai_score}/10
          </span>
        ) : (
          <span style={{ fontSize: 13, color: "rgba(250,248,245,0.25)", fontFamily: "var(--font-dm-sans)" }}>—</span>
        )}
      </td>
      <td style={{ padding: "14px 16px" }}>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}>
          {date}
        </p>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <button
          onClick={sendFollowUp}
          disabled={followUpState !== "idle"}
          style={{
            padding: "7px 14px",
            backgroundColor: followUpState === "sent"
              ? "rgba(13,110,90,0.2)"
              : followUpState === "error"
              ? "rgba(185,28,28,0.2)"
              : "rgba(196,55,74,0.15)",
            color: followUpState === "sent"
              ? "#6EE7B7"
              : followUpState === "error"
              ? "#FCA5A5"
              : "#C4374A",
            border: `1px solid ${followUpState === "sent" ? "rgba(13,110,90,0.3)" : followUpState === "error" ? "rgba(185,28,28,0.3)" : "rgba(196,55,74,0.3)"}`,
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "var(--font-dm-sans)",
            cursor: followUpState !== "idle" ? "default" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {followUpState === "idle" && "Follow Up"}
          {followUpState === "sending" && "Sending..."}
          {followUpState === "sent" && "✓ Sent"}
          {followUpState === "error" && "Failed"}
        </button>
      </td>
    </tr>
  );
}
