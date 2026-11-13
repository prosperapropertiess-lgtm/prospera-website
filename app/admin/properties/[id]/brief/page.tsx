import { notFound } from "next/navigation";
import PropertyBrief from "@/components/brief/PropertyBrief";
import { loadProperty, briefLinks, briefUrl, agentBriefUrl } from "@/lib/property-brief";

export const dynamic = "force-dynamic";

// Admin view of the brief: renter version by default, ?for=agent adds access details.
export default async function AdminBriefPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ for?: string }> }) {
  const { id } = await params;
  const { for: forWho } = await searchParams;
  const p = await loadProperty({ id });
  if (!p) notFound();
  return <PropertyBrief p={p} links={await briefLinks(p)} agent={forWho === "agent"} shareUrl={briefUrl(p)} agentUrl={agentBriefUrl(p)} />;
}
