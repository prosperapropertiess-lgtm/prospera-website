"use client";

import type { MaintenanceItem } from "@/lib/notion";

interface Props {
  open: MaintenanceItem[];
  completed: MaintenanceItem[];
}

const PRIORITY_STYLE: Record<
  string,
  { color: string; bg: string; border: string; leftBorder: string }
> = {
  critical: {
    color: "#B91C1C",
    bg: "rgba(185,28,28,0.08)",
    border: "rgba(185,28,28,0.18)",
    leftBorder: "#B91C1C",
  },
  high: {
    color: "#B45309",
    bg: "rgba(180,83,9,0.09)",
    border: "rgba(180,83,9,0.18)",
    leftBorder: "#B45309",
  },
  medium: {
    color: "#B45309",
    bg: "rgba(180,83,9,0.06)",
    border: "rgba(180,83,9,0.12)",
    leftBorder: "#B45309",
  },
  low: {
    color: "rgba(15,28,40,0.45)",
    bg: "rgba(15,28,40,0.04)",
    border: "rgba(15,28,40,0.07)",
    leftBorder: "rgba(15,28,40,0.14)",
  },
};

export function MaintenanceList({ open, completed }: Props) {
  if (open.length === 0 && completed.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          background: "rgba(10,122,82,0.05)",
          border: "1px solid rgba(10,122,82,0.12)",
          borderRadius: "14px",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "28px", color: "#0A7A52", display: "block", marginBottom: "6px" }}
        >
          check_circle
        </span>
        <p
          style={{
            color: "#0A7A52",
            fontSize: "16px",
            fontWeight: 500,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          No open maintenance issues
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {open.map((item) => {
        const p =
          PRIORITY_STYLE[(item.priority ?? "low").toLowerCase()] ?? PRIORITY_STYLE.low;
        return (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "14px 16px",
              background: p.bg,
              border: `1px solid ${p.border}`,
              borderLeft: `4px solid ${p.leftBorder}`,
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.70)",
                border: `1px solid ${p.border}`,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: p.color,
                  fontSize: "16px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {item.priority}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: "#0F1C28",
                  fontSize: "16px",
                  fontWeight: 500,
                  marginBottom: "2px",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {item.issue}
              </p>
              <p
                style={{
                  color: "rgba(15,28,40,0.45)",
                  fontSize: "14px",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {item.category}
                {item.daysPending != null && ` · ${item.daysPending}d pending`}
              </p>
            </div>
          </div>
        );
      })}

      {completed.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 14px",
            background: "rgba(10,122,82,0.05)",
            borderRadius: "12px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "19px", color: "#0A7A52", flexShrink: 0 }}
          >
            check_circle
          </span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: "rgba(15,28,40,0.45)",
                fontSize: "16px",
                textDecoration: "line-through",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {item.issue}
            </p>
          </div>
          <span
            style={{
              color: "#0A7A52",
              fontSize: "14px",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 600,
            }}
          >
            {item.dateCompleted
              ? new Date(item.dateCompleted).toLocaleDateString("en-CA", {
                  month: "short",
                  day: "numeric",
                })
              : "Done"}
          </span>
        </div>
      ))}
    </div>
  );
}
