import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { querySearchAnalytics, getGSCTokenViaOAuth, getGSCToken } from "@/lib/google-search-console";

const SITE_URL = "https://www.prosperaproperties.co/";
const SITE_URL_DOMAIN = "sc-domain:prosperaproperties.co";
const BASE = "https://www.prosperaproperties.co";

// Pull all pages GSC has seen in the last 16 months (max allowed)
async function fetchAllGSCPages(): Promise<{ url: string; clicks: number; impressions: number; position: number }[]> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 480); // ~16 months

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const params = {
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ["page"],
    rowLimit: 25000,
  };

  const result =
    (await querySearchAnalytics({ siteUrl: SITE_URL, ...params })) ??
    (await querySearchAnalytics({ siteUrl: SITE_URL_DOMAIN, ...params }));

  if (!result?.rows) return [];

  return result.rows.map((r) => ({
    url: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    position: r.position,
  }));
}

// Call the URL Inspection API for a single URL
async function inspectUrl(siteUrl: string, inspectUrl: string, token: string): Promise<string> {
  try {
    const res = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ inspectionUrl: inspectUrl, siteUrl }),
    });
    if (!res.ok) return "unknown";
    const data = await res.json();
    return data?.inspectionResult?.indexStatusResult?.coverageState ?? "unknown";
  } catch {
    return "unknown";
  }
}

function categorize(url: string): string {
  const path = url.replace(BASE, "").split("?")[0];
  if (path === "/" || path === "") return "homepage";
  if (path.startsWith("/blog/")) return "blog";
  if (path.startsWith("/listings/")) return "listing";
  if (path.startsWith("/areas/")) return path.split("/").length >= 4 ? "neighbourhood" : "city";
  if (path.startsWith("/services/")) return "service";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/api/")) return "api";
  if (path.includes("?") || /[&=]/.test(path)) return "query-param";
  return "static";
}

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const inspect = searchParams.get("inspect") === "1";

  // 1. All pages GSC has impression data for
  const gscPages = await fetchAllGSCPages();

  // 2. Group by category
  const byCategory: Record<string, { count: number; clicks: number; impressions: number; urls: string[] }> = {};
  for (const p of gscPages) {
    const cat = categorize(p.url);
    if (!byCategory[cat]) byCategory[cat] = { count: 0, clicks: 0, impressions: 0, urls: [] };
    byCategory[cat].count++;
    byCategory[cat].clicks += p.clicks;
    byCategory[cat].impressions += p.impressions;
    if (byCategory[cat].urls.length < 5) byCategory[cat].urls.push(p.url);
  }

  // 3. Zero-impression pages (indexed but invisible — or in GSC coverage but no impressions)
  const zeroImpression = gscPages.filter((p) => p.impressions === 0);
  const lowImpression = gscPages.filter((p) => p.impressions > 0 && p.impressions < 5);

  // 4. Spot-check up to 10 key pages with URL Inspection API (optional, slow)
  let inspectionResults: { url: string; status: string }[] = [];
  if (inspect) {
    const token = (await getGSCTokenViaOAuth()) ?? (await getGSCToken());
    if (token) {
      const sampled = [
        `${BASE}/`,
        `${BASE}/landlords`,
        `${BASE}/listings`,
        `${BASE}/blog`,
        `${BASE}/areas/london`,
        `${BASE}/services/student-rental-management`,
        // Pick top blog post
        ...(gscPages.filter((p) => p.url.includes("/blog/")).sort((a, b) => b.impressions - a.impressions).slice(0, 4).map((p) => p.url)),
      ].slice(0, 10);

      inspectionResults = await Promise.all(
        sampled.map(async (u) => ({ url: u, status: await inspectUrl(SITE_URL, u, token) }))
      );
    }
  }

  // 5. Top pages (for reference)
  const topPages = gscPages
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
    .map((p) => ({ url: p.url.replace(BASE, ""), impressions: p.impressions, clicks: p.clicks, position: Math.round(p.position * 10) / 10 }));

  // 6. Suspicious URL patterns (likely causing bloat)
  const suspicious = gscPages
    .filter((p) => {
      const path = p.url.replace(BASE, "");
      return path.includes("?") || path.includes("%") || path.includes("//") || /\.(php|asp|html)$/.test(path);
    })
    .map((p) => p.url.replace(BASE, ""))
    .slice(0, 30);

  return NextResponse.json({
    summary: {
      totalGSCPages: gscPages.length,
      withImpressions: gscPages.filter((p) => p.impressions > 0).length,
      withClicks: gscPages.filter((p) => p.clicks > 0).length,
      zeroImpression: zeroImpression.length,
      lowImpression: lowImpression.length,
    },
    byCategory: Object.entries(byCategory)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([cat, data]) => ({ category: cat, ...data })),
    suspicious,
    topPages,
    inspectionResults,
    note: gscPages.length < 100
      ? "GSC Search Analytics only shows pages with at least 1 impression in the date range. The 3,196 not-indexed pages are pages Google found but chose not to index — they won't appear here."
      : null,
  });
}
