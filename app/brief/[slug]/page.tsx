import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyBrief from "@/components/brief/PropertyBrief";
import { loadProperty, briefLinks, briefUrl, fullAddress } from "@/lib/property-brief";
import { verifyId } from "@/lib/fieldops/engine";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await loadProperty(UUID.test(slug) ? { id: slug } : { slug });
  return {
    title: { absolute: p ? `${fullAddress(p)} | Property brief | Prospera Properties` : "Property brief | Prospera Properties" },
    description: p ? `Rent, utilities, parking and everything else about living at ${fullAddress(p)}, ${p.city}.` : undefined,
    robots: { index: false },
  };
}

// Public renter brief. A signed ?k= link (sent to showing specialists) shows the agent version.
export default async function BriefPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ k?: string }> }) {
  const { slug } = await params;
  const { k } = await searchParams;
  const p = await loadProperty(UUID.test(slug) ? { id: slug } : { slug });
  if (!p) notFound();
  const agent = !!k && verifyId("brief", k) === p.id;
  if (!agent && p.status !== "published") notFound();
  return <PropertyBrief p={p} links={await briefLinks(p)} agent={agent} shareUrl={briefUrl(p)} />;
}
