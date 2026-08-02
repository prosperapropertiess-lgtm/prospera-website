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
  const ud = (raw.utilities_detail as Record<string, { included?: boolean }> | null) ?? {};
  const utilsList = (raw.utilities_list as string[] | null) ?? [];
  const appliances = (raw.appliances as string[] | null) ?? [];
  const laundryType = raw.laundry_type as string | null;
  const outdoorSpace = (raw.outdoor_space as string | null)?.toLowerCase() ?? "";

  const hasUtil = (key: string, aliases: string[]) =>
    !!(ud[key]?.included ?? aliases.some(a => utilsList.map(u => u.toLowerCase()).includes(a)));

  const checks: { label: string; test: boolean; alwaysShow: boolean }[] = [
    { label: "Heat",             test: hasUtil("heat", ["heat", "gas", "heating"]),                      alwaysShow: true  },
    { label: "Hydro / Electricity", test: hasUtil("hydro", ["hydro", "electricity", "electric"]),       alwaysShow: true  },
    { label: "Water",            test: hasUtil("water", ["water"]),                                     alwaysShow: true  },
    { label: "Internet",         test: hasUtil("internet", ["internet", "wifi"]),                       alwaysShow: false },
    { label: "Air Conditioning", test: !!(raw.ac),                                                      alwaysShow: true  },
    { label: "In-Unit Laundry",  test: laundryType === "in_unit",                                      alwaysShow: true  },
    { label: "Shared Laundry",   test: laundryType === "shared",                                       alwaysShow: false },
    { label: "Parking",          test: !!(property.parking),                                            alwaysShow: true  },
    { label: "Dishwasher",       test: appliances.map(a => a.toLowerCase()).includes("dishwasher"),     alwaysShow: true  },
    { label: "Fridge",           test: appliances.map(a => a.toLowerCase()).some(a => a.includes("fridge") || a.includes("refrigerator")), alwaysShow: false },
    { label: "Stove / Oven",     test: appliances.map(a => a.toLowerCase()).some(a => a.includes("stove") || a.includes("oven") || a.includes("range")), alwaysShow: false },
    { label: "Storage Unit",     test: !!(raw.storage),                                                alwaysShow: false },
    { label: "Backyard",         test: outdoorSpace.includes("backyard") || outdoorSpace.includes("yard"), alwaysShow: false },
    { label: "Balcony / Patio",  test: outdoorSpace.includes("balcony") || outdoorSpace.includes("patio") || outdoorSpace.includes("deck"), alwaysShow: false },
    { label: "Elevator",         test: !!(raw.elevator),                                               alwaysShow: false },
    { label: "Furnished",        test: !!(raw.furnished),                                              alwaysShow: false },
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
