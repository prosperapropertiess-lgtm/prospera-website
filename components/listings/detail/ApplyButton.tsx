"use client";

import type { PropertyRecord } from "./ListingPage";

// Prospera currently operates as a single-agent shop — every live listing is
// managed by this agent. If a property record ever carries its own agent_id
// (multi-agent support down the line), that takes priority; this is just the
// safe fallback so the Apply button always resolves to a real, working link.
const DEFAULT_AGENT_ID = "08e1618d-562a-4227-a6d7-fb5c981f52bb";

interface Props {
  property: PropertyRecord;
  variant?: "primary" | "outline" | "outline-light";
  className?: string;
  label?: string;
}

export default function ApplyButton({ property, variant = "primary", className = "", label = "Apply Now" }: Props) {
  const agentId = (property.agent_id as string | null) || DEFAULT_AGENT_ID;
  const href = `/apply/${agentId}/${property.id}`;

  const styles: React.CSSProperties =
    variant === "primary"
      ? { backgroundColor: "#8B2030", color: "#FAF8F5" }
      : variant === "outline"
      ? { border: "1px solid #1F2F3A", color: "#1F2F3A" }
      : { border: "1px solid rgba(250,248,245,0.35)", color: "#FAF8F5" };

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center px-7 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 ${className}`}
      style={styles}
    >
      {label}
    </a>
  );
}
