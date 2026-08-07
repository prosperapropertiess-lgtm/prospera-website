"use client";

import BookViewingButton from "./BookViewingButton";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

function formatAvailableDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

interface Chip {
  label: string;
  icon: string;
  style: "green" | "neutral" | "muted";
}

function buildChips(property: PropertyRecord): Chip[] {
  const chips: Chip[] = [];

  // Utilities — only show when included (don't lead with a negative)
  if (property.utilities_included) {
    const list = property.utilities_list;
    chips.push({
      label: list?.length ? `${list.join(", ")} Included` : "Utilities Included",
      icon: "✓",
      style: "green",
    });
  }

  if (property.parking)        chips.push({ label: "Parking Included",  icon: "✓", style: "green"   });
  if (property.pet_friendly)   chips.push({ label: "Pet Friendly",       icon: "✓", style: "green"   });

  const raw = property as Record<string, unknown>;
  if (raw.furnished)           chips.push({ label: "Furnished",          icon: "✓", style: "green"   });
  if (raw.storage)             chips.push({ label: "Storage Included",   icon: "✓", style: "green"   });
  if (raw.wheelchair_accessible) chips.push({ label: "Accessible",       icon: "✓", style: "neutral" });

  return chips;
}

const CHIP_STYLES: Record<Chip["style"], React.CSSProperties> = {
  green: {
    backgroundColor: "rgba(45,122,79,0.08)",
    border: "1px solid rgba(45,122,79,0.20)",
    color: "#2D7A4F",
  },
  neutral: {
    backgroundColor: "#F7F5F2",
    border: "1px solid #D8D2C8",
    color: "#444444",
  },
  muted: {
    backgroundColor: "#F7F5F2",
    border: "1px solid #D8D2C8",
    color: "#888888",
  },
};

export default function QuickSummary({ property }: Props) {
  const stats = [
    property.bedrooms  != null && `${property.bedrooms} ${property.bedrooms === 1 ? "Bed" : "Beds"}`,
    property.bathrooms != null && `${property.bathrooms} ${property.bathrooms === 1 ? "Bath" : "Baths"}`,
    property.sqft               && `${property.sqft.toLocaleString()} sqft`,
    property.property_type      && property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1),
  ].filter(Boolean) as string[];

  const chips = buildChips(property);

  return (
    <section
      className="px-5 sm:px-8 py-6 sm:py-8"
      style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DE" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Row 1: Price + actions */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
              style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
            >
              Monthly Rent
            </p>
            <div className="flex items-baseline gap-2">
              <p
                className="text-4xl sm:text-5xl font-bold leading-none"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
              >
                ${property.price.toLocaleString()}
              </p>
              <span className="text-base font-normal" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
                /mo
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            {property.available_date && (
              <div
                className="px-4 py-2 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(45,122,79,0.08)",
                  color: "#2D7A4F",
                  border: "1px solid rgba(45,122,79,0.2)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Available {formatAvailableDate(property.available_date)}
              </div>
            )}
            <BookViewingButton property={property} variant="primary" label="Book a Viewing" />
          </div>
        </div>

        {/* Row 2: Property stats */}
        {stats.length > 0 && (
          <div className="flex flex-wrap items-center gap-0 mb-4 pb-4" style={{ borderBottom: "1px solid #F0EDE8" }}>
            {stats.map((s, i) => (
              <span key={s} className="flex items-center">
                <span className="text-sm font-medium" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  {s}
                </span>
                {i < stats.length - 1 && (
                  <span className="mx-3" style={{ color: "#D8D2C8" }}>·</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Row 3: Feature chips */}
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ fontFamily: "var(--font-dm-sans)", ...CHIP_STYLES[chip.style] }}
            >
              <span className="text-[11px] font-bold">{chip.icon}</span>
              {chip.label}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
