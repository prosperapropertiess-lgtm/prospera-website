"use client";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface BadgeProps {
  children: React.ReactNode;
}

function Badge({ children }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: "#F7F5F2",
        border: "1px solid #D8D2C8",
        color: "#333333",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {children}
    </span>
  );
}

function formatAvailableDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export default function QuickSummary({ property }: Props) {
  return (
    <section
      className="w-full py-6 px-5 sm:px-8 border-y"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}
    >
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-4">
        {/* Price — dominant left */}
        <div className="mr-4">
          <span
            className="text-3xl font-bold"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            ${property.price.toLocaleString()}
          </span>
          <span
            className="text-sm ml-1"
            style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
          >
            /mo
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-8 w-px" style={{ backgroundColor: "#D8D2C8" }} />

        {/* Stat badges */}
        <div className="flex flex-wrap items-center gap-2">
          {property.bedrooms != null && (
            <Badge>{property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}</Badge>
          )}
          {property.bathrooms != null && (
            <Badge>{property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}</Badge>
          )}
          {property.sqft && (
            <Badge>{property.sqft.toLocaleString()} sqft</Badge>
          )}
          {property.property_type && (
            <Badge>{property.property_type}</Badge>
          )}
          {property.available_date && (
            <Badge>Avail. {formatAvailableDate(property.available_date)}</Badge>
          )}
          {property.pet_friendly && (
            <Badge>Pet Friendly</Badge>
          )}
          {property.parking && (
            <Badge>Parking Incl.</Badge>
          )}
          {property.utilities_included && (
            <Badge>Utilities Incl.</Badge>
          )}
        </div>
      </div>
    </section>
  );
}
