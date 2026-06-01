import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getNeighbourhood, getNeighbourhoodsByCity } from "@/lib/neighbourhoods";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ neighbourhood: string }>;
}

export async function generateStaticParams() {
  return getNeighbourhoodsByCity("london").map((n) => ({ neighbourhood: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { neighbourhood } = await params;
  const n = getNeighbourhood("london", neighbourhood);
  if (!n) return {};
  return {
    title: `Property Management in ${n.name}, London ON`,
    description: `Professional property management in ${n.name}, London ON. ${n.description} Contact Prospera Properties for a free quote.`,
  };
}

export default async function LondonNeighbourhoodPage({ params }: Props) {
  const { neighbourhood } = await params;
  const n = getNeighbourhood("london", neighbourhood);
  if (!n) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://www.prosperaproperties.co/areas/london/${n.slug}`,
    name: "Prospera Properties",
    description: `Property management in ${n.name}, London, Ontario`,
    url: "https://www.prosperaproperties.co",
    telephone: "+15196971227",
    email: "hello@prosperaproperties.co",
    priceRange: "$$",
    image: "https://www.prosperaproperties.co/ebin-founder.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "London",
      addressLocality: "London",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 42.9849,
      longitude: -81.2453,
    },
    areaServed: { "@type": "Place", name: `${n.name}, London, Ontario` },
    sameAs: ["https://www.facebook.com/profile.php?id=381380218388134"],
  };

  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      <JsonLd data={schema} />

      {/* Breadcrumb */}
      <div className="pt-28 pb-2 px-6 max-w-5xl mx-auto">
        <p className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
          <Link href="/areas/london" className="hover:underline" style={{ color: "#8B2030" }}>London</Link>
          {" → "}
          <span style={{ color: "#444444" }}>{n.name}</span>
        </p>
      </div>

      {/* Hero */}
      <section className="pt-8 pb-20 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
            London, Ontario · {n.name}
          </p>
          <h1 className="text-4xl md:text-5xl font-light mb-6 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Property Management in {n.name}
          </h1>
          <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            {n.description}
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest btn-primary rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </div>
      </section>

      {/* Rent ranges */}
      <section className="py-14 px-6" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #D8D2C8" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-10" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            Current Rental Rates in {n.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {n.avgRent.studio && (
              <div className="bg-[#F7F5F2] border p-5 rounded-xl" style={{ borderColor: "#D8D2C8" }}>
                <p className="text-2xl font-light mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{n.avgRent.studio}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Studio /mo</p>
              </div>
            )}
            <div className="bg-[#F7F5F2] border p-5 rounded-xl" style={{ borderColor: "#D8D2C8" }}>
              <p className="text-2xl font-light mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{n.avgRent.oneBed}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>1 Bed /mo</p>
            </div>
            <div className="bg-[#F7F5F2] border p-5 rounded-xl" style={{ borderColor: "#D8D2C8" }}>
              <p className="text-2xl font-light mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{n.avgRent.twoBed}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>2 Bed /mo</p>
            </div>
            {n.avgRent.threeBed && (
              <div className="bg-[#F7F5F2] border p-5 rounded-xl" style={{ borderColor: "#D8D2C8" }}>
                <p className="text-2xl font-light mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{n.avgRent.threeBed}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>3 Bed /mo</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About + highlights */}
      <section className="py-16 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-light mb-5" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              About {n.name}
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              {n.longDescription}
            </p>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Typical Tenant</p>
            <p className="text-sm" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>{n.tenantProfile}</p>
          </div>
          <div>
            <h3 className="text-xl font-light mb-5" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Why Landlords Choose {n.name}
            </h3>
            <ul className="space-y-3 mb-8">
              {n.highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  <span style={{ color: "#8B2030" }}>✓</span>
                  {h}
                </li>
              ))}
            </ul>
            <h3 className="text-xl font-light mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Nearby Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {n.nearbyAmenities.map((a) => (
                <span key={a} className="text-xs px-3 py-1.5 border rounded" style={{ borderColor: "#D8D2C8", color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      {n.faqs && n.faqs.length > 0 && (
        <section className="py-16 px-6" style={{ backgroundColor: "#FFFFFF" }}>
          <JsonLd data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: n.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }} />
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-light mb-10" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Common Questions About {n.name} Rentals
            </h2>
            <div className="space-y-8">
              {n.faqs.map((faq) => (
                <div key={faq.q} className="border-b pb-8" style={{ borderColor: "#D8D2C8" }}>
                  <h3 className="text-lg font-medium mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>{faq.q}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
          Own a Rental in {n.name}?
        </h2>
        <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
          We manage properties across {n.name} and all of London. Free consultation, no pressure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest btn-primary rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
          <Link
            href="/listings"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest border btn-primary rounded"
            style={{ borderColor: "rgba(250,248,245,0.3)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            View Available Rentals
          </Link>
        </div>
      </section>
    </div>
  );
}
