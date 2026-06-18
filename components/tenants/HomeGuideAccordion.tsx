"use client";

import { useState } from "react";
import type { HomeGuideSection } from "@/lib/tenant-data";

const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY = "#0F1C28";
const NAVY_MED = "#2A3D4F";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.22)";

interface Props {
  sections: HomeGuideSection[];
}

const DEFAULT_SECTIONS = [
  { title: "Breaker Panel", icon: "electric_bolt", iconColor: "#B45309", iconBg: "rgba(180,83,9,0.09)" },
  { title: "Water Shutoff", icon: "water_drop", iconColor: "#1D4ED8", iconBg: "rgba(29,78,216,0.08)" },
  { title: "HVAC & Furnace", icon: "thermostat", iconColor: "#7C3AED", iconBg: "rgba(124,58,237,0.08)" },
  { title: "Appliances", icon: "kitchen", iconColor: "#0A7A52", iconBg: "rgba(10,122,82,0.09)" },
  { title: "Parking", icon: "local_parking", iconColor: "#B8922A", iconBg: "rgba(184,146,42,0.09)" },
  { title: "Emergency Contacts", icon: "emergency", iconColor: "#B91C1C", iconBg: "rgba(185,28,28,0.08)" },
];

function getSectionMeta(title: string): { icon: string; iconColor: string; iconBg: string } {
  const found = DEFAULT_SECTIONS.find(s => s.title.toLowerCase() === title.toLowerCase());
  return found ?? { icon: "info", iconColor: MUTED, iconBg: "rgba(15,28,40,0.05)" };
}

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
      : DEFAULT_SECTIONS.map((s, i) => ({
          id: `default-${i}`,
          title: s.title,
          content: "",
        }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {displaySections.map((section) => {
        const isOpen = openIds.has(section.id);
        const hasContent = section.content && section.content.trim().length > 0;
        const meta = getSectionMeta(section.title);

        return (
          <div
            key={section.id}
            style={{
              background: "#FFFFFF",
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: "20px",
              boxShadow: CARD_SHADOW,
              overflow: "hidden",
              transition: "box-shadow 0.2s",
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
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: meta.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "21px", color: meta.iconColor }}
                  >
                    {meta.icon}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "19px",
                    fontWeight: 700,
                    color: NAVY,
                  }}
                >
                  {section.title}
                </span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "23px",
                  color: SUBTLE,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
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
              <div style={{ padding: "0 20px 20px 20px" }}>
                <div style={{ height: "1px", background: CARD_BORDER, marginBottom: "16px" }} />
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "18px",
                    color: hasContent ? NAVY_MED : MUTED,
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
