import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { querySearchAnalytics } from "@/lib/google-search-console";

const SITE_URL = "https://www.prosperaproperties.co/";
const BLOG_PREFIX = "https://www.prosperaproperties.co/blog/";

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getPeriods() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 27);

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - 27);

  return {
    current: { start: formatDate(start), end: formatDate(end) },
    previous: { start: formatDate(prevStart), end: formatDate(prevEnd) },
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { current, previous } = getPeriods();

  const [summaryResult, pagesResult, queriesResult, prevSummaryResult] = await Promise.all([
    querySearchAnalytics({ siteUrl: SITE_URL, startDate: current.start, endDate: current.end, dimensions: [] }),
    querySearchAnalytics({
      siteUrl: SITE_URL,
      startDate: current.start,
      endDate: current.end,
      dimensions: ["page"],
      rowLimit: 20,
      dimensionFilterGroups: [{
        filters: [{ dimension: "page", operator: "contains", expression: "/blog/" }],
      }],
    }),
    querySearchAnalytics({ siteUrl: SITE_URL, startDate: current.start, endDate: current.end, dimensions: ["query"], rowLimit: 20 }),
    querySearchAnalytics({ siteUrl: SITE_URL, startDate: previous.start, endDate: previous.end, dimensions: [] }),
  ]);

  if (!summaryResult && !pagesResult && !queriesResult) {
    return NextResponse.json({ error: "GSC not configured" }, { status: 500 });
  }

  const summaryRow = summaryResult?.rows?.[0];
  const prevRow = prevSummaryResult?.rows?.[0];

  const summary = {
    clicks: summaryRow?.clicks ?? 0,
    impressions: summaryRow?.impressions ?? 0,
    ctr: summaryRow?.ctr ?? 0,
    position: summaryRow?.position ?? 0,
    prevClicks: prevRow?.clicks ?? 0,
    prevImpressions: prevRow?.impressions ?? 0,
  };

  const pages = (pagesResult?.rows ?? [])
    .sort((a, b) => b.impressions - a.impressions)
    .map((row) => ({
      page: row.keys[0],
      slug: row.keys[0].replace(BLOG_PREFIX, ""),
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));

  const queries = (queriesResult?.rows ?? [])
    .sort((a, b) => b.impressions - a.impressions)
    .map((row) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));

  return NextResponse.json({
    period: { start: current.start, end: current.end },
    summary,
    pages,
    queries,
  });
}
