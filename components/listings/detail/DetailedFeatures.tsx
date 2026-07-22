"use client";

import { X } from "lucide-react";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface FeatureCheck {
  label: string;
  included: boolean;
}

const CHECKMARK = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <circle cx="7" cy="7" r="7" fill="rgba(139,32,48,0.10)" />
    <path d="M4 7l2 2 4-4" stroke="#8B2030" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function buildChecklist(property: PropertyRecord): FeatureCheck[] {
  const raw = property as Record<string, unknown>;

  const checks: { label: string; test: boolean }[] = [
    { label: "Air Conditioning", test: !!(raw.ac || raw.air_conditioning) },
    { label: "In-Unit Laundry", test: !!(raw.in_unit_laundry || raw.washer_dryer) },
    { label: "Shared Laundry", test: !!(raw.laundry_shared && !raw.in_unit_laundry && !raw.washer_dryer) },
    { label: "Parking Included", test: !!(property.parking || raw.garage) },
    { label: "Dishwasher", test: !!(raw.dishwasher) },
    { label: "Storage Unit", test: !!(raw.storage || raw.locker) },
    { label: "Heat Included", test: !!(raw.heat_included) },
    { label: "Hydro Included", test: !!(raw.hydro_included || raw.electricity_included) },
    { label: "Internet Included", test: !!(raw.internet_included) },
    { label: "Balcony / Patio", test: !!(raw.balcony || raw.patio || raw.deck) },
    { label: "Backyard", test: !!(raw.backyard) },
    { label: "Elevator", test: !!(raw.elevator) },
    { label: "Gym / Fitness Room", test: !!(raw.gym) },
    { label: "Pool", test: !!(raw.pool) },
    { label: "EV Charging", test: !!(raw.ev_charging) },
  ];

  // Only show "Not Included" for amenities a renter would reasonably expect to ask about.
  // Skip ones that are niche / rarely expected (pool, EV, gym) on the "not included" side.
  const SHOW_WHEN_MISSING = new Set([
    "Air Conditioning",
    "In-Unit Laundry",
    "Parking Included",
    "Dishwasher",
    "Heat Included",
    "Hydro Included",
    "Balcony / Patio",
    "Elevator",
  ]);

  return checks
    .filter((c) => c.test || SHOW_WHEN_MISSING.has(c.label))
    .map((c) => ({ label: c.label, included: c.test }));
}

export default function DetailedFeatures({ property }: Props) {
  const checklist = buildChecklist(property);
  const included = checklist.filter((c) => c.included);
  const notIncluded = checklist.filter((c) => !c.included);

  if (!included.length && !notIncluded.length) return null;

  return (
    <section className="py-12 md:py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
          style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
        >
          Features & Amenities
        </p>
        <h2
          className="text-4xl sm:text-5xl font-bold text-center mb-8 md:mb-14 leading-tight"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
        >
          What&apos;s Included
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Included column */}
          {included.length > 0 && (
            <div
              className="rounded-xl p-7"
              style={{
                backgroundColor: "#F7F5F2",
                border: "1px solid #D8D2C8",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
              >
                Included
              </h3>
              <ul className="space-y-3">
                {included.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    {CHECKMARK}
                    <span className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Not Included column */}
          {notIncluded.length > 0 && (
            <div
              className="rounded-xl p-7"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D8D2C8",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
              >
                Not Included
              </h3>
              <ul className="space-y-3">
                {notIncluded.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <X size={14} color="#D8D2C8" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
