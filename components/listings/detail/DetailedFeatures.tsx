"use client";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface FeatureCheck {
  label: string;
  included: boolean;
}

function buildChecklist(property: PropertyRecord): FeatureCheck[] {
  const raw = property as Record<string, unknown>;
  // utilities_detail is the canonical source: { heat: { included: bool }, hydro: { included: bool }, ... }
  const ud = (raw.utilities_detail as Record<string, { included?: boolean }> | null) ?? {};

  const checks: { label: string; test: boolean; alwaysShow: boolean }[] = [
    // Utilities — always show (tenants always want to know)
    { label: "Heat",              test: !!(ud.heat?.included   || raw.heat_included),                  alwaysShow: true  },
    { label: "Hydro",             test: !!(ud.hydro?.included  || raw.hydro_included || raw.electricity_included), alwaysShow: true  },
    { label: "Water",             test: !!(ud.water?.included  || raw.water_included),                 alwaysShow: true  },
    { label: "Internet",          test: !!(ud.internet?.included || raw.internet_included),            alwaysShow: false },
    // Key amenities — only show "Not Included" for things renters expect
    { label: "Air Conditioning",  test: !!(raw.ac || raw.air_conditioning),                            alwaysShow: true  },
    { label: "In-Unit Laundry",   test: !!(raw.in_unit_laundry || raw.washer_dryer),                  alwaysShow: true  },
    { label: "Shared Laundry",    test: !!(raw.laundry_shared && !raw.in_unit_laundry && !raw.washer_dryer), alwaysShow: false },
    { label: "Parking",           test: !!(property.parking || raw.garage),                            alwaysShow: true  },
    { label: "Dishwasher",        test: !!(raw.dishwasher),                                            alwaysShow: true  },
    { label: "Storage Unit",      test: !!(raw.storage || raw.locker),                                 alwaysShow: false },
    { label: "Balcony / Patio",   test: !!(raw.balcony || raw.patio || raw.deck),                     alwaysShow: false },
    { label: "Backyard",          test: !!(raw.backyard),                                              alwaysShow: false },
    { label: "Elevator",          test: !!(raw.elevator),                                              alwaysShow: false },
    { label: "Gym / Fitness Room",test: !!(raw.gym),                                                   alwaysShow: false },
    { label: "Pool",              test: !!(raw.pool),                                                   alwaysShow: false },
  ];

  return checks
    .filter((c) => c.test || c.alwaysShow)
    .map((c) => ({ label: c.label, included: c.test }));
}

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="7.5" fill="rgba(45,122,79,0.12)" />
    <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#2D7A4F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const X_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="7.5" fill="rgba(180,63,63,0.08)" />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#B43F3F" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default function DetailedFeatures({ property }: Props) {
  const checklist = buildChecklist(property);
  const included  = checklist.filter((c) => c.included);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">

          {/* Included — green */}
          {included.length > 0 && (
            <div
              className="rounded-2xl p-7"
              style={{
                backgroundColor: "rgba(45,122,79,0.05)",
                border: "1px solid rgba(45,122,79,0.18)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(45,122,79,0.15)" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5 5-5" stroke="#2D7A4F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2D7A4F", fontFamily: "var(--font-dm-sans)" }}>
                  Included
                </h3>
              </div>
              <ul className="space-y-3">
                {included.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    {CHECK_ICON}
                    <span className="text-sm font-medium" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Not Included — red */}
          {notIncluded.length > 0 && (
            <div
              className="rounded-2xl p-7"
              style={{
                backgroundColor: "rgba(180,63,63,0.04)",
                border: "1px solid rgba(180,63,63,0.14)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(180,63,63,0.10)" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="#B43F3F" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#B43F3F", fontFamily: "var(--font-dm-sans)" }}>
                  Not Included
                </h3>
              </div>
              <ul className="space-y-3">
                {notIncluded.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    {X_ICON}
                    <span className="text-sm" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
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
