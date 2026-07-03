"use client";

import { Sun, Cloud, Sunset, Moon } from "lucide-react";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

const TIME_SLOTS = [
  {
    key: "morning",
    label: "Morning",
    icon: Sun,
    bg: "rgba(255,248,235,0.7)",
    iconColor: "#C98B2E",
  },
  {
    key: "afternoon",
    label: "Afternoon",
    icon: Cloud,
    bg: "rgba(235,244,255,0.7)",
    iconColor: "#4A7FA8",
  },
  {
    key: "evening",
    label: "Evening",
    icon: Sunset,
    bg: "rgba(255,240,235,0.7)",
    iconColor: "#B05A35",
  },
  {
    key: "night",
    label: "Night",
    icon: Moon,
    bg: "rgba(235,237,248,0.7)",
    iconColor: "#5A5F8C",
  },
] as const;

export default function DailyRoutine({ property }: Props) {
  const sim = property.life_simulation as Record<string, unknown> | null;
  if (!sim) return null;

  // Only show slots where the value is a non-empty string
  const available = TIME_SLOTS.filter((slot) => typeof sim[slot.key] === "string" && sim[slot.key]);
  if (!available.length) return null;

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-5xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Life Here
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            A Day in This Home
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {available.map((slot, i) => {
            const Icon = slot.icon;
            return (
              <div key={slot.key}>
                <div
                  className="rounded-xl p-8 h-full"
                  style={{
                    backgroundColor: slot.bg,
                    border: "1px solid #D8D2C8",
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={20} color={slot.iconColor} />
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {slot.label}
                    </span>
                  </div>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {sim[slot.key] as string}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
