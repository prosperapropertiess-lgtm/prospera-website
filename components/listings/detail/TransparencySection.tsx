"use client";

import { Check } from "lucide-react";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

const TRANSPARENCY_LABELS: Record<string, string> = {
  last_renovation: "Last Renovated",
  age_of_building: "Building Age",
  landlord_response_time: "Landlord Response Time",
  maintenance_process: "Maintenance Process",
  noise_level: "Noise Level",
  natural_light: "Natural Light",
  street_parking: "Street Parking",
  shared_spaces: "Shared Spaces",
  tenant_history: "Tenant History",
  inspection_status: "Inspection Status",
  known_issues: "Known Issues",
};

export default function TransparencySection({ property }: Props) {
  const transparency = property.transparency as Record<string, string> | null;
  if (!transparency) return null;

  const entries = Object.entries(transparency).filter(([, v]) => v);
  if (!entries.length) return null;

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-4xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            No Surprises
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            What You Should Know
          </h2>
        </div>

        <div>
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{ border: "1px solid #D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="divide-y" style={{ borderColor: "#D8D2C8" }}>
              {entries.map(([key, value]) => (
                <div key={key} className="flex items-start gap-4 px-7 py-5">
                  <div className="mt-0.5 flex-shrink-0">
                    <Check size={15} color="#8B2030" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0 sm:flex sm:items-center sm:justify-between gap-4">
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-1 sm:mb-0"
                      style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {TRANSPARENCY_LABELS[key] ?? key.replace(/_/g, " ")}
                    </p>
                    <p
                      className="text-sm sm:text-right"
                      style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
