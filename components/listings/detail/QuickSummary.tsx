"use client";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

function formatAvailableDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default function QuickSummary({ property }: Props) {
  const stats = [
    property.bedrooms   != null  && `${property.bedrooms} ${property.bedrooms === 1 ? "Bed" : "Beds"}`,
    property.bathrooms  != null  && `${property.bathrooms} ${property.bathrooms === 1 ? "Bath" : "Baths"}`,
    property.sqft                && `${property.sqft.toLocaleString()} sqft`,
    property.property_type       && property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1),
  ].filter(Boolean) as string[];

  const tags = [
    property.available_date      && `Available ${formatAvailableDate(property.available_date)}`,
    property.pet_friendly        && "Pet Friendly",
    property.parking             && "Parking Included",
    property.utilities_included  && "Utilities Included",
  ].filter(Boolean) as string[];

  return (
    <section
      className="px-5 sm:px-8 py-7 sm:py-8"
      style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DE" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Price + availability */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
              style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
            >
              Monthly Rent
            </p>
            <p
              className="text-4xl sm:text-5xl font-bold leading-none"
              style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
            >
              ${property.price.toLocaleString()}
              <span
                className="text-base font-normal ml-2"
                style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}
              >
                /mo
              </span>
            </p>
          </div>

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
        </div>

        {/* Primary stats */}
        {stats.length > 0 && (
          <div className="flex items-center gap-0 mb-4">
            {stats.map((s, i) => (
              <span key={s} className="flex items-center">
                <span
                  className="text-sm font-medium"
                  style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                >
                  {s}
                </span>
                {i < stats.length - 1 && (
                  <span className="mx-3 text-xs" style={{ color: "#D8D2C8" }}>·</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "#F7F5F2",
                  border: "1px solid #D8D2C8",
                  color: "#555555",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
