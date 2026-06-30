import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const SERPER_API_KEY = process.env.SERPER_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { address, city, bedrooms } = await req.json();

  if (!city || !bedrooms) {
    return NextResponse.json({ error: "City and bedrooms required" }, { status: 400 });
  }

  if (!SERPER_API_KEY) {
    return NextResponse.json({ error: "SERPER_API_KEY not configured" }, { status: 500 });
  }

  // Search for individual rental listings — not category pages
  const searchQueries = [
    `"${bedrooms} bedroom" "for rent" "${city}" "$" site:kijiji.ca/v-`,
    `${bedrooms} bedroom apartment for rent ${city} Ontario "$" site:rentals.ca`,
    `${bedrooms} bed rental ${address || city} Ontario "$" -"ads for"`,
  ];

  const allResults: Array<{ title: string; snippet: string; link: string }> = [];

  for (const query of searchQueries) {
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

  // Filter out category/search pages — only keep individual listings
  const filtered = allResults.filter((r) => {
    const t = r.title.toLowerCase();
    // Skip Kijiji category pages
    if (/^\d+\s+ads?\s+for/.test(t)) return false;
    if (t.includes("rentals near you")) return false;
    if (t.includes("in all categories")) return false;
    if (t.includes("in long term rentals")) return false;
    // Skip results without a dollar amount
    if (!(/\$[\d,]+/.test(r.title + " " + r.snippet))) return false;
    return true;
  });

  // Parse individual listings
  const comps: Array<{
    address: string;
    rent: number;
    days_on_market: string;
    ad_description: string;
    source: string;
  }> = [];

  const seenKeys = new Set<string>();

  for (const result of filtered) {
    const text = result.title + " " + result.snippet;

    // Extract ALL dollar amounts and pick the most likely rent
    const rentMatches = [...text.matchAll(/\$([\d,]+)(?:\.00)?/g)];
    if (!rentMatches.length) continue;

    const rents = rentMatches
      .map(m => parseInt(m[1].replace(/,/g, ""), 10))
      .filter(r => r >= 800 && r <= 8000); // Reasonable rent range

    if (!rents.length) continue;
    const rent = rents[0]; // First reasonable rent is usually the asking price

    // Extract street address
    const addrPatterns = [
      /(\d+\s+[A-Z][a-zA-Z]+(?:\s+[A-Za-z]+)*\s+(?:St(?:reet)?|Ave(?:nue)?|Rd|Road|Dr(?:ive)?|Blvd|Boulevard|Cres(?:cent)?|Ct|Court|Way|Lane|Ln|Pl(?:ace)?|Terr(?:ace)?|Cir(?:cle)?|Park|Gate|Trail|Grove|Pkwy|Hwy))/i,
      /(\d+\s+(?:North|South|East|West|N|S|E|W)\s+[A-Z][a-zA-Z]+(?:\s+[A-Za-z]+)*)/i,
    ];

    let extractedAddress = "";
    for (const pattern of addrPatterns) {
      const match = text.match(pattern);
      if (match) { extractedAddress = match[1].trim(); break; }
    }

    // If no address found, try to extract from the title (Kijiji titles often have location)
    if (!extractedAddress) {
      // Use the first meaningful part of the title
      const titleParts = result.title.split(/[-–|·,]/).map(s => s.trim());
      const meaningful = titleParts.find(s => s.length > 10 && !s.includes("Kijiji") && !s.includes("Rentals"));
      extractedAddress = meaningful || result.title.slice(0, 50);
    }

    // Deduplicate by rent + first 20 chars of address
    const key = `${rent}-${extractedAddress.slice(0, 20).toLowerCase()}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    // Determine source
    const source = result.link.includes("kijiji") ? "Kijiji"
      : result.link.includes("rentals.ca") ? "Rentals.ca"
      : result.link.includes("facebook") ? "Facebook"
      : result.link.includes("zumper") ? "Zumper"
      : result.link.includes("padmapper") ? "PadMapper"
      : "Web";

    // Extract bedrooms/bathrooms from snippet if mentioned
    const bedMatch = text.match(/(\d+)\s*(?:bed|bedroom|br|bdr)/i);
    const bathMatch = text.match(/(\d+(?:\.\d)?)\s*(?:bath|bathroom|ba)/i);
    const sqftMatch = text.match(/([\d,]+)\s*(?:sq\s*ft|sqft|square\s*feet)/i);

    // Build a clean description
    let desc = result.snippet.replace(/\s+/g, " ").trim();
    if (desc.length > 250) desc = desc.slice(0, 250) + "...";

    // Add extracted specs to description if found
    const specs: string[] = [];
    if (bedMatch) specs.push(`${bedMatch[1]} bed`);
    if (bathMatch) specs.push(`${bathMatch[1]} bath`);
    if (sqftMatch) specs.push(`${sqftMatch[1]} sqft`);
    if (specs.length) desc = `[${specs.join(" · ")}] ${desc}`;

    comps.push({
      address: extractedAddress.includes(city) ? extractedAddress : `${extractedAddress}, ${city}, ON`,
      rent,
      days_on_market: "",
      ad_description: desc,
      source,
    });

    if (comps.length >= 8) break;
  }

  // Calculate rent ranges from found comps
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
    totalSearchResults: allResults.length,
    filteredResults: filtered.length,
    compsParsed: comps.length,
  });
}
