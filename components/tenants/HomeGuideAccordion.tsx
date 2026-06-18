"use client";

import { useState } from "react";
import type { HomeGuideSection } from "@/lib/tenant-data";

const CARD = "#0D1825";
const CARD_HOVER = "#111F2E";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";
const TEXT_DIM = "rgba(237,232,225,0.20)";

interface Props {
  sections: HomeGuideSection[];
}

const DEFAULT_SECTIONS = [
  "Breaker Panel",
  "Water Shutoff",
  "HVAC & Furnace",
  "Appliances",
  "Parking",
  "Emergency Contacts",
];

export default function HomeGuideAccordion({ sections }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const displaySections: Array<{ id: string; title: string; content: string }> =
    sections.length > 0
      ? sections.map(s => ({ id: s.id, title: s.title, content: s.content }))
      : DEFAULT_SECTIONS.map((title, i) => ({
          id: `default-${i}`,
          title,
          content: "",
        }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {displaySections.map((section) => {
        const isOpen = openIds.has(section.id);
        const hasContent = section.content && section.content.trim().length > 0;

        return (
          <div
            key={section.id}
            style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => toggle(section.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                background: isOpen ? CARD_HOVER : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: TEXT,
                }}
              >
                {section.title}
              </span>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "20px",
                  color: TEXT_DIM,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                }}
              >
                expand_more
              </span>
            </button>

            <div
              style={{
                maxHeight: isOpen ? "800px" : "0",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <div style={{ padding: "0 20px 20px" }}>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "16px" }} />
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "15px",
                    color: hasContent ? TEXT_SEC : TEXT_DIM,
                    lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                    fontStyle: hasContent ? "normal" : "italic",
                  }}
                >
                  {hasContent ? section.content : "Ebin will add details for this section soon."}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
