import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadReport } from "@/lib/market/report";
import ReportView from "../ReportView";
import { reportMetadata } from "../meta";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ edition: string }> }): Promise<Metadata> {
  const { edition } = await params;
  const data = await loadReport(edition);
  return reportMetadata(data?.edition.key ?? null, data?.whole.median ?? null, data?.edition.label ?? "");
}

export default async function EditionPage({ params }: { params: Promise<{ edition: string }> }) {
  const { edition } = await params;
  if (!/^(\d{4}-\d{2}(-\d{2})?|weekly|monthly)$/.test(edition)) notFound();
  const data = await loadReport(edition);
  if (!data) notFound();
  return <ReportView data={data} />;
}
