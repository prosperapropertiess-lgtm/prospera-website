import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";
import ListingPage from "@/components/listings/detail/ListingPage";
import JsonLd from "@/components/seo/JsonLd";

// ISR — revalidate every 10 minutes so edits propagate without per-request overhead
export const revalidate = 600;

interface Props {
  params: Promise<{ slug: string }>;
}

function db() {
  return getSupabaseAdmin();
}

/** Resolve a slug or legacy UUID → property row */
async function resolveProperty(param: string) {
  // Try slug first (canonical)
  const { data: bySlug } = await db()
    .from("properties")
    .select("*")
    .eq("slug", param)
    .eq("status", "published")
    .maybeSingle();
  if (bySlug) return { property: bySlug, isLegacyId: false };

  // Fall back to UUID (legacy /listings/[id] links — we'll 301 to slug)
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRe.test(param)) {
    const { data: byId } = await db()
      .from("properties")
      .select("*")
      .eq("id", param)
      .eq("status", "published")
      .maybeSingle();
    if (byId) return { property: byId, isLegacyId: true };
  }

  return null;
}

function buildMetaTitle(p: Record<string, unknown>): string {
  const beds = p.bedrooms ? `${p.bedrooms}-Bedroom ` : "";
  const type = p.property_type
    ? (p.property_type as string).charAt(0).toUpperCase() +
      (p.property_type as string).slice(1).replace(/_/g, " ") + " "
    : "Rental ";
  const status = p.available === false ? "Recently Rented" : "for Rent";
  const city = (p.city as string) || "London";
  return `${beds}${type}${status} in ${city}, Ontario | Prospera Properties`;
}

function buildMetaDescription(p: Record<string, unknown>): string {
  const city = (p.city as string) || "London";
  const price = p.price as number | null;
  const beds = p.bedrooms as number | null;
  const baths = p.bathrooms as number | null;

  if (p.available === false) {
    return `This ${beds || ""}bd/${baths || ""}ba unit in ${city}, ON has been rented. Join our rental alerts to be first to know about similar properties from Prospera Properties.`;
  }

  const intro = (p.ai_life_intro as string | null)?.split(/[.\n]/)[0]?.trim();
  if (intro && intro.length >= 60 && intro.length <= 140) return intro + ".";

  const sqft = p.sqft ? ` · ${(p.sqft as number).toLocaleString()} sqft` : "";
  return `${beds || ""}bd/${baths || ""}ba rental${sqft} in ${city}, Ontario at $${price?.toLocaleString() || "—"}/mo. Professional management. Fast responses. Apply with Prospera Properties.`.slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await resolveProperty(slug);
  if (!result) return {};

  const { property: p } = result;
  const title = buildMetaTitle(p);
  const description = buildMetaDescription(p);
  const canonicalSlug = (p.slug as string) || slug;
  const canonicalUrl = `https://www.prosperaproperties.co/listings/${canonicalSlug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: "Prospera Properties",
      images: (p.images as string[] | null)?.[0]
        ? [{ url: (p.images as string[])[0], width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: (p.images as string[] | null)?.[0] ? [(p.images as string[])[0]] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await resolveProperty(slug);
  if (!result) notFound();

  const { property, isLegacyId } = result;

  // 301 legacy UUID → canonical slug
  if (isLegacyId && property.slug) {
    redirect(`/listings/${property.slug as string}`);
  }

  const canonicalUrl = `https://www.prosperaproperties.co/listings/${(property.slug as string) || slug}`;
  const metaTitle = buildMetaTitle(property);
  const metaDesc = buildMetaDescription(property);

  // ── Structured data ────────────────────────────────────────────────────────
  const propertySchema = {
    "@context": "https://schema.org",
    "@type": property.property_type === "house" ? "House"
      : property.property_type === "townhouse" ? "Townhouse"
      : "Apartment",
    name: metaTitle,
    description: metaDesc,
    url: canonicalUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: "ON",
      addressCountry: "CA",
    },
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    petsAllowed: property.pet_friendly ?? false,
    floorSize: property.sqft
      ? { "@type": "QuantitativeValue", value: property.sqft, unitCode: "FTK" }
      : undefined,
    image: (property.images as string[] | null)?.[0]
      ? {
          "@type": "ImageObject",
          url: (property.images as string[])[0],
          caption: metaTitle,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "CAD",
      availability: property.available !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      availabilityStarts: property.available_date || undefined,
    },
    geo: property.latitude && property.longitude
      ? { "@type": "GeoCoordinates", latitude: property.latitude, longitude: property.longitude }
      : undefined,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.prosperaproperties.co" },
      { "@type": "ListItem", position: 2, name: "Rentals in London, Ontario", item: "https://www.prosperaproperties.co/listings" },
      { "@type": "ListItem", position: 3, name: metaTitle, item: canonicalUrl },
    ],
  };

  const faqs = buildFaqs(property);
  const faqSchema = faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }
    : null;

  return (
    <>
      <JsonLd data={propertySchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      <ListingPage key={property.id as string} property={property} faqs={faqs} />
    </>
  );
}

// ── FAQ generator ──────────────────────────────────────────────────────────────
// Built from real property fields — no AI hallucination at render time.
export interface FaqItem {
  q: string;
  a: string;
}

function buildFaqs(p: Record<string, unknown>): FaqItem[] {
  const faqs: FaqItem[] = [];
  const city = (p.city as string) || "London";
  const price = p.price as number | null;
  const beds = p.bedrooms as number | null;
  const baths = p.bathrooms as number | null;
  const availDate = p.available_date as string | null;

  if (availDate) {
    const formatted = new Date(availDate).toLocaleDateString("en-CA", {
      month: "long", day: "numeric", year: "numeric",
    });
    faqs.push({
      q: "When is this property available?",
      a: `This property is available starting ${formatted}. We recommend booking a viewing as soon as possible: similar units in ${city} typically receive multiple applications within the first week of listing.`,
    });
  }

  if (p.utilities_included) {
    const list = (p.utilities_list as string[] | null)?.join(", ");
    faqs.push({
      q: "Are utilities included in the rent?",
      a: list
        ? `Yes. The following utilities are included in the monthly rent: ${list}. Any utilities not listed are the tenant's responsibility.`
        : `Yes, utilities are included in the monthly rent of $${price?.toLocaleString()}/mo.`,
    });
  } else {
    faqs.push({
      q: "Are utilities included in the rent?",
      a: `Utilities are not included. Budget an additional $150–$300/month for hydro, water, and heat, typical for a ${beds || ""}-bedroom unit in ${city} depending on season and usage.`,
    });
  }

  faqs.push({
    q: "Is parking available?",
    a: p.parking
      ? `Yes, parking is included with this property. Details are confirmed at the viewing; contact us if you have specific requirements.`
      : `Parking is not included with this unit. Street parking may be available nearby. Contact us to discuss options.`,
  });

  if (p.pet_friendly) {
    const policy = typeof p.pet_policy === "string" ? p.pet_policy : null;
    faqs.push({
      q: "Are pets allowed?",
      a: policy || `Pets are welcome at this property. Please disclose your pet's type and size during your application. Under Ontario's Residential Tenancies Act, landlords cannot refuse a tenant solely because they have pets.`,
    });
  } else {
    faqs.push({
      q: "Are pets allowed?",
      a: `This property does not permit pets. If you have questions about your specific situation, contact us directly at (519) 697-1227.`,
    });
  }

  faqs.push({
    q: "How do I apply for this property?",
    a: `Book a viewing through this page or call (519) 697-1227. After viewing, we'll send you an application link. The process is straightforward: we verify your identity, income, and references. Applications are reviewed within 24–48 hours.`,
  });

  const leaseTerm = p.lease_term as string | null;
  faqs.push({
    q: "What is the lease term?",
    a: leaseTerm
      ? `This property is offered on a ${leaseTerm} lease. After the initial term, the tenancy converts to month-to-month under Ontario's Residential Tenancies Act.`
      : `Standard 12-month lease. After the initial term, it converts to month-to-month. We're open to discussing lease length during the application process.`,
  });

  if (beds && baths) {
    faqs.push({
      q: `How many bedrooms and bathrooms does this property have?`,
      a: `This property has ${beds} bedroom${beds > 1 ? "s" : ""} and ${baths} bathroom${baths > 1 ? "s" : ""}${p.sqft ? `, with approximately ${(p.sqft as number).toLocaleString()} square feet of living space` : ""}. It is located in ${city}, Ontario, managed by Prospera Properties.`,
    });
  }

  return faqs;
}
