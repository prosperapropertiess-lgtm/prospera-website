import type { Metadata } from "next";
import { loadReport } from "@/lib/market/report";
import ReportView from "./ReportView";
import { reportMetadata } from "./meta";
import NoReport from "./NoReport";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadReport(null);
  return reportMetadata(data?.edition.key ?? null, data?.whole.median ?? null, data?.edition.label ?? "");
}

export default async function RentReportPage() {
  const data = await loadReport(null);
  return data ? <ReportView data={data} /> : <NoReport />;
}
