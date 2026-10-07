"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Property {
  id: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  images: string[] | null;
}

// One generalized link per agent, not one per unit — picks a property
// first, then hands off into the existing, unchanged, already-working
// 3-step application at /apply/[agentId]/[propertyId]. Reuses the exact
// same /api/listings query the public listings page already uses for
// "currently published and available" — no new backend logic.
export default function ApplyPickPropertyPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const router = useRouter();

  const [properties, setProperties] = useState<Property[] | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/listings");
        const json = await res.json();
        if (!res.ok) {
          setLoadError("Couldn't load current openings. Please try again shortly.");
          return;
        }
        setProperties(json.available || []);
      } catch {
        setLoadError("Couldn't load current openings. Please try again shortly.");
      }
    }
    load();
  }, []);

  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontSize: 32, fontWeight: 400, color: "#1F2F3A", fontFamily: "var(--font-cormorant)", marginBottom: 12 }}>Something went wrong</p>
          <p style={{ fontSize: 15, color: "#64748B", fontFamily: "var(--font-dm-sans)" }}>{loadError}</p>
        </div>
      </div>
    );
  }

  if (properties === null) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94A3B8", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2" }}>
      {/* Header — matches the per-property apply flow's visual language */}
      <div style={{ backgroundColor: "#1F2F3A", padding: "24px 24px 28px", textAlign: "center" }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}>
          Rental Application
        </p>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 400, color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
          Which home are you applying for?
        </h1>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 60px" }}>
        {properties.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 20, fontWeight: 400, color: "#1F2F3A", fontFamily: "var(--font-cormorant)", marginBottom: 8 }}>
              Nothing available to apply for right now
            </p>
            <p style={{ fontSize: 14, color: "#64748B", fontFamily: "var(--font-dm-sans)" }}>
              Check back soon, or contact us directly and we&apos;ll let you know as something opens up.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {properties.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/apply/${agentId}/${p.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "left",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #D8D2C8",
                  borderRadius: 12,
                  padding: 16,
                  cursor: "pointer",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                <div
                  style={{
                    width: 84,
                    height: 64,
                    borderRadius: 8,
                    flexShrink: 0,
                    backgroundColor: "#E8E3DC",
                    backgroundImage: p.images?.[0] ? `url(${p.images[0]})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 600, color: "#1F2F3A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.address}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>
                    {p.city} &nbsp;·&nbsp; {p.bedrooms}bd / {p.bathrooms}ba &nbsp;·&nbsp;{" "}
                    <strong style={{ color: "#8B2030" }}>${p.price.toLocaleString()}/mo</strong>
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
