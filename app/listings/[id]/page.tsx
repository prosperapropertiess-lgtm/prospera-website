import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ListingPage from "@/components/listings/detail/ListingPage";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ id: string }>;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getSupabase().from("properties").select("title, city, price, bedrooms, bathrooms, description, available_date, ai_life_intro, images").eq("id", id).single();
  if (!data) return {};

  const desc = data.ai_life_intro
    ? data.ai_life_intro.split("\n")[0]
    : `${data.bedrooms} bed, ${data.bathrooms} bath in ${data.city}, Ontario. $${data.price?.toLocaleString()}/mo.`;

  return {
    title: `${data.title} — ${data.city}, ON`,
    description: `${desc} ${data.description?.slice(0, 100) || ""}`,
    openGraph: {
      title: `${data.title} — Prospera Properties`,
      description: `${data.bedrooms} bed · ${data.bathrooms} bath · $${data.price?.toLocaleString()}/mo in ${data.city}, ON`,
      type: "website",
      images: data.images?.[0] ? [{ url: data.images[0], width: 1200, height: 630 }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const { data } = await getSupabase().from("properties").select("*").eq("id", id).single();
  if (!data) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: data.title,
    description: data.description,
    url: `https://www.prosperaproperties.co/listings/${id}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: data.address,
      addressLocality: data.city,
      addressRegion: "ON",
      addressCountry: "CA",
    },
    numberOfBedrooms: data.bedrooms,
    numberOfBathroomsTotal: data.bathrooms,
    petsAllowed: data.pet_friendly,
    floorSize: data.sqft ? { "@type": "QuantitativeValue", value: data.sqft, unitCode: "FTK" } : undefined,
    image: data.images?.[0] ? { "@type": "ImageObject", url: data.images[0] } : undefined,
    offers: {
      "@type": "Offer",
      price: data.price,
      priceCurrency: "CAD",
      availability: data.available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      availabilityStarts: data.available_date || undefined,
    },
    geo: data.latitude && data.longitude ? {
      "@type": "GeoCoordinates",
      latitude: data.latitude,
      longitude: data.longitude,
    } : undefined,
  };

  return (
    <>
      <JsonLd data={schema} />
      <ListingPage property={data} />
    </>
  );
}
