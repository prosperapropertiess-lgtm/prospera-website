import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

// A plain Google map of the street address. Loads only when scrolled to.
export default function LocationMap({ property }: Props) {
  if (!property.address) return null;
  const query = `${property.address}, ${property.city || "London"}, ON`;
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
  const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <section className="py-10 md:py-14 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
          Location
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
            {query}
          </h2>
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            Open in Google Maps
          </a>
        </div>
        <div className="relative w-full rounded-xl overflow-hidden" style={{ border: "1px solid #D8D2C8", height: 320 }}>
          <iframe
            src={src}
            title={`Map of ${query}`}
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
