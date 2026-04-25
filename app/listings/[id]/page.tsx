import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import PropertyDetailClient from "@/components/listings/PropertyDetailClient";
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
  const { data } = await getSupabase().from("properties").select("title, city, price, bedrooms, bathrooms, description").eq("id", id).single();
  if (!data) return {};
  return {
    title: `${data.title} — ${data.city}, ON`,
    description: `${data.bedrooms} bed, ${data.bathrooms} bath in ${data.city}, Ontario. $${data.price.toLocaleString()}/mo. ${data.description?.slice(0, 120)}`,
    openGraph: {
      title: `${data.title} — Prospera Properties`,
      description: `${data.bedrooms} bed · ${data.bathrooms} bath · $${data.price.toLocaleString()}/mo in ${data.city}, ON`,
      type: "website",
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const { data } = await getSupabase().from("properties").select("*").eq("id", id).single();
  if (!data) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: data.title,
    description: data.description,
    url: `https://www.prosperaproperties.co/listings/${id}`,
    price: data.price,
    priceCurrency: "CAD",
    address: {
      "@type": "PostalAddress",
      streetAddress: data.address,
      addressLocality: data.city,
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    numberOfRooms: data.bedrooms,
    petsAllowed: data.pet_friendly,
    image: data.images?.[0] || undefined,
    offers: {
      "@type": "Offer",
      price: data.price,
      priceCurrency: "CAD",
      availability: data.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <JsonLd data={schema} />
      <PropertyDetailClient property={data} />
    </>
  );
}
