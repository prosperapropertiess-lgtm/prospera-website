import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const SERPER_API_KEY = process.env.SERPER_API_KEY || "";
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { address, city, bedrooms } = await req.json();

  if (!city || !bedrooms) {
    return NextResponse.json({ error: "City and bedrooms required" }, { status: 400 });
  }

  // Step 1: Search for comparable rentals via Serper
  const searchQueries = [
    `${bedrooms} bedroom rental ${city} Ontario kijiji`,
    `${bedrooms} bedroom apartment for rent ${city} Ontario`,
    `${bedrooms} bed rental near ${address || city} Ontario`,
  ];

  const allResults: Array<{ title: string; snippet: string; link: string }> = [];

  if (SERPER_API_KEY) {
    for (const query of searchQueries.slice(0, 2)) {
      try {
        const res = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ q: query, num: 10, gl: "ca", hl: "en" }),
        });
        const data = await res.json();
        if (data.organic) {
          allResults.push(...data.organic.map((r: { title: string; snippet: string; link: string }) => ({
            title: r.title || "",
            snippet: r.snippet || "",
            link: r.link || "",
          })));
        }
      } catch (err) {
        console.error("[auto-comps] Serper search failed:", err);
      }
    }
  }

  // Step 2: Parse rental listings from search results
  const comps: Array<{
    address: string;
    rent: number;
    days_on_market: string;
    ad_description: string;
    source: string;
  }> = [];

  const seenAddresses = new Set<string>();

  for (const result of allResults) {
    // Extract rent from title/snippet (look for $X,XXX patterns)
    const rentMatch = (result.title + " " + result.snippet).match(/\$\s*([\d,]+)\s*(?:\/?\s*(?:mo|month|mth))?/i);
    if (!rentMatch) continue;

    const rent = parseInt(rentMatch[1].replace(/,/g, ""), 10);
    if (rent < 500 || rent > 10000) continue; // Filter unreasonable rents

    // Extract address from title/snippet
    let extractedAddress = "";

    // Try to find street address pattern (number + street name)
    const addrMatch = (result.title + " " + result.snippet).match(/(\d+\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Cres|Crescent|Ct|Court|Way|Lane|Ln|Pl|Place|Terr|Terrace|Cir|Circle))/i);
    if (addrMatch) {
      extractedAddress = addrMatch[1].trim();
    } else {
      // Use title as fallback (often contains the address or area)
      extractedAddress = result.title.split(/[-–|·]/).map(s => s.trim()).find(s => /\d/.test(s) || s.length > 10) || result.title.slice(0, 60);
    }

    // Deduplicate
    const key = extractedAddress.toLowerCase().replace(/\s+/g, " ");
    if (seenAddresses.has(key)) continue;
    seenAddresses.add(key);

    // Determine source
    const source = result.link.includes("kijiji") ? "Kijiji"
      : result.link.includes("rentals.ca") ? "Rentals.ca"
      : result.link.includes("facebook") ? "Facebook"
      : result.link.includes("zumper") ? "Zumper"
      : "Web";

    comps.push({
      address: `${extractedAddress}, ${city}, ON`,
      rent,
      days_on_market: "",
      ad_description: result.snippet.slice(0, 300),
      source,
    });

    if (comps.length >= 8) break;
  }

  // Step 3: Calculate rent ranges from found comps
  const rents = comps.map(c => c.rent).sort((a, b) => a - b);
  let rentLow = 0, rentMarket = 0, rentPremium = 0;

  if (rents.length >= 3) {
    rentLow = rents[Math.floor(rents.length * 0.25)];
    rentMarket = rents[Math.floor(rents.length * 0.5)];
    rentPremium = rents[Math.floor(rents.length * 0.75)];
  } else if (rents.length >= 1) {
    const median = rents[Math.floor(rents.length / 2)];
    rentLow = Math.round(median * 0.9);
    rentMarket = median;
    rentPremium = Math.round(median * 1.12);
  }

  // Round to nearest 25
  rentLow = Math.round(rentLow / 25) * 25;
  rentMarket = Math.round(rentMarket / 25) * 25;
  rentPremium = Math.round(rentPremium / 25) * 25;

  return NextResponse.json({
    comps: comps.slice(0, 5),
    rentLow,
    rentMarket,
    rentPremium,
    totalFound: allResults.length,
    compsParsed: comps.length,
  });
}
