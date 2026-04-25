export interface Neighbourhood {
  slug: string;
  name: string;
  city: string;
  citySlug: string;
  province: string;
  description: string;
  longDescription: string;
  avgRent: { studio?: string; oneBed: string; twoBed: string; threeBed?: string };
  highlights: string[];
  tenantProfile: string;
  nearbyAmenities: string[];
}

export const neighbourhoods: Neighbourhood[] = [
  // ── London ───────────────────────────────────────────────────────────────
  {
    slug: "old-north",
    name: "Old North",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "One of London's most sought-after neighbourhoods — tree-lined streets, heritage homes, and a 5-minute drive to downtown.",
    longDescription: "Old North is consistently one of London's highest-demand rental areas. Heritage brick homes, mature tree canopy, and easy access to Richmond Row make it a top choice for professionals, academics, and families. Vacancies rarely last more than two weeks here. Landlords benefit from stable, long-term tenants and strong rent appreciation year over year.",
    avgRent: { oneBed: "$1,650", twoBed: "$2,100", threeBed: "$2,600" },
    highlights: ["Low vacancy rate", "Professional tenant pool", "Heritage architecture", "Walk to Richmond Row"],
    tenantProfile: "Young professionals, university faculty, established families",
    nearbyAmenities: ["Richmond Row", "Victoria Hospital", "Western University", "Hyde Park"],
  },
  {
    slug: "wortley-village",
    name: "Wortley Village",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "London's most charming village neighbourhood — indie shops, farmers market, and a tight-knit community.",
    longDescription: "Wortley Village has a distinct character unlike anywhere else in London. The village centre is walkable, with local cafes, a weekly farmers market, and community events year round. Renters who move here rarely leave — turnover is some of the lowest in the city. For landlords, this means fewer vacancy periods and tenants who genuinely care for the property.",
    avgRent: { oneBed: "$1,600", twoBed: "$2,050", threeBed: "$2,500" },
    highlights: ["Lowest turnover in the city", "Walkable village core", "Farmers market", "Strong community ties"],
    tenantProfile: "Artists, young couples, long-term renters",
    nearbyAmenities: ["Wortley Village shops", "Springbank Park", "Ridout Trail", "South London Community Centre"],
  },
  {
    slug: "byron",
    name: "Byron",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "Southwest London's family-friendly hub — excellent schools, Springbank Park, and stable long-term tenants.",
    longDescription: "Byron attracts families looking for space, good schools, and proximity to Springbank Park — one of London's best green spaces. Rental demand is steady year-round and skews toward families and couples who tend to sign multi-year leases. Properties in Byron hold their value well and offer landlords predictable, low-drama tenancies.",
    avgRent: { oneBed: "$1,500", twoBed: "$1,950", threeBed: "$2,400" },
    highlights: ["Top-rated schools nearby", "Springbank Park", "Family tenants", "Long lease terms"],
    tenantProfile: "Families, couples, long-term renters",
    nearbyAmenities: ["Springbank Park", "Byron Community Centre", "Westmount Shopping Centre", "Thames River trails"],
  },
  {
    slug: "masonville",
    name: "Masonville",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "North London's premier rental market — close to Western University and University Hospital with near-zero vacancy.",
    longDescription: "Masonville is one of London's tightest rental markets. Proximity to Western University and University Hospital generates constant demand from grad students, residents, nurses, and healthcare professionals. Well-maintained properties here rarely sit vacant for more than a week. Rental rates have climbed steadily, making this one of the best areas in London for landlord returns.",
    avgRent: { oneBed: "$1,700", twoBed: "$2,200", threeBed: "$2,750" },
    highlights: ["Near Western University", "University Hospital catchment", "Near-zero vacancy", "Strong rent growth"],
    tenantProfile: "Medical professionals, grad students, healthcare workers",
    nearbyAmenities: ["Masonville Place", "Western University", "University Hospital (LHSC)", "Medway Valley Heritage Forest"],
  },
  {
    slug: "old-east-village",
    name: "Old East Village",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "London's most rapidly gentrifying neighbourhood — rising values, creative tenants, and growing rental demand.",
    longDescription: "Old East Village is undergoing a significant transformation. Once overlooked, it's now attracting artists, entrepreneurs, and young professionals drawn by affordable rents and a growing arts scene along Dundas Street. Savvy landlords are getting in early — prices are still accessible but trending upward quickly as the neighbourhood fills with new businesses and community investment.",
    avgRent: { oneBed: "$1,350", twoBed: "$1,700", threeBed: "$2,100" },
    highlights: ["Rapidly gentrifying", "Strong upside potential", "Arts district", "Affordable entry point"],
    tenantProfile: "Artists, entrepreneurs, young creatives",
    nearbyAmenities: ["Covent Garden Market", "Dundas Street arts corridor", "Victoria Park", "Downtown core"],
  },
  {
    slug: "white-oaks",
    name: "White Oaks",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "South London's high-demand rental corridor — diverse community, great transit, and consistent year-round demand.",
    longDescription: "White Oaks and South London offer some of the city's most consistent rental demand. The area's diversity, transit access, and affordable rents make it attractive to a wide range of tenants — from newcomers to long-established families. Landlords benefit from low vacancy, reliable demand, and lower purchase prices that translate to strong cash flow.",
    avgRent: { oneBed: "$1,350", twoBed: "$1,650", threeBed: "$2,050" },
    highlights: ["Strong transit access", "Diverse tenant pool", "Consistent demand", "Best cash flow in London"],
    tenantProfile: "Newcomers, diverse families, service workers",
    nearbyAmenities: ["White Oaks Mall", "South London Community Centre", "YMCA", "Bus terminal"],
  },
  {
    slug: "downtown-london",
    name: "Downtown London",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "London's urban core is growing fast — new condos, young professionals, and a booming restaurant and nightlife scene.",
    longDescription: "Downtown London has seen major investment over the last five years. Condo development, new restaurants, and remote workers choosing city living have made it one of the fastest-growing rental markets in the region. Younger tenants who want to walk to work, restaurants, and entertainment are driving demand for updated units. Landlords with renovated suites command premium rents here.",
    avgRent: { studio: "$1,200", oneBed: "$1,550", twoBed: "$2,000" },
    highlights: ["Fastest-growing rental market", "Walk score 90+", "Young professional tenants", "New development"],
    tenantProfile: "Remote workers, young professionals, students",
    nearbyAmenities: ["Covent Garden Market", "Budweiser Gardens", "Richmond Row", "Via Rail station"],
  },
  {
    slug: "east-london",
    name: "East London",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "Affordable rents and strong student demand — ideal for landlords targeting the Fanshawe College catchment area.",
    longDescription: "East London is the gateway to Fanshawe College, making it a top destination for student renters and young professionals entering the workforce. Rents are among the most affordable in the city, giving landlords access to a large tenant pool. Units near transit routes fill fast — vacancies in this part of London average under two weeks.",
    avgRent: { oneBed: "$1,300", twoBed: "$1,600", threeBed: "$1,950" },
    highlights: ["Fanshawe College nearby", "Affordable rents", "Large tenant pool", "Fast-filling vacancies"],
    tenantProfile: "College students, young professionals, trades workers",
    nearbyAmenities: ["Fanshawe College", "Argyle Mall", "East London Community Centre", "Highway 401 access"],
  },

  // ── St. Thomas ───────────────────────────────────────────────────────────
  {
    slug: "downtown-st-thomas",
    name: "Downtown St. Thomas",
    city: "St. Thomas",
    citySlug: "st-thomas",
    province: "Ontario",
    description: "The heart of St. Thomas — walkable, affordable, and growing as Amazon and Volkswagen investment draws workers to the area.",
    longDescription: "Downtown St. Thomas is experiencing a real moment. Major investment from Amazon and the Volkswagen battery plant is bringing thousands of jobs to Elgin County, and rental demand is climbing fast. Downtown units are affordable compared to London while offering everything tenants need within walking distance. Landlords who move now are ahead of the curve.",
    avgRent: { oneBed: "$1,250", twoBed: "$1,550", threeBed: "$1,900" },
    highlights: ["Rapid job growth", "Volkswagen plant impact", "Affordable entry", "High demand ahead"],
    tenantProfile: "Trades workers, young families, newcomers",
    nearbyAmenities: ["Elgin County Courthouse", "Pinafore Park", "City Hall", "St. Thomas Library"],
  },
  {
    slug: "northwest-st-thomas",
    name: "Northwest St. Thomas",
    city: "St. Thomas",
    citySlug: "st-thomas",
    province: "Ontario",
    description: "Family neighbourhoods close to schools and parks — ideal for landlords targeting stable, longer-term tenants.",
    longDescription: "Northwest St. Thomas is predominantly residential — quiet streets, good schools, and proximity to Pinafore Park make it a natural fit for families. Tenants here tend to stay for years, reducing turnover costs and vacancy headaches. With St. Thomas's growth trajectory, properties in this area are likely to see solid appreciation.",
    avgRent: { oneBed: "$1,200", twoBed: "$1,500", threeBed: "$1,850" },
    highlights: ["Family-oriented", "Low turnover", "School catchment area", "Pinafore Park access"],
    tenantProfile: "Families, long-term renters, couples",
    nearbyAmenities: ["Pinafore Park", "Arthur Voaden Secondary School", "YMCA St. Thomas", "Mitchell Hepburn Park"],
  },
  {
    slug: "elgin-mall-area",
    name: "Elgin Mall Area",
    city: "St. Thomas",
    citySlug: "st-thomas",
    province: "Ontario",
    description: "High-traffic corridor with convenient access to shopping and employment — strong demand from service and retail workers.",
    longDescription: "The Elgin Mall area is St. Thomas's commercial hub, and the surrounding residential streets attract tenants who work nearby in retail, healthcare, and trades. Transit access is good and rents are accessible, making units here easy to fill. The area is also well-positioned to benefit from the Volkswagen plant employment wave coming to the region.",
    avgRent: { oneBed: "$1,200", twoBed: "$1,475", threeBed: "$1,800" },
    highlights: ["Transit accessible", "Near employment hub", "Retail and services nearby", "Consistent demand"],
    tenantProfile: "Service workers, retail employees, young renters",
    nearbyAmenities: ["Elgin Mall", "St. Thomas Elgin General Hospital", "Highbury Park", "Multiple transit routes"],
  },

  // ── Strathroy ────────────────────────────────────────────────────────────
  {
    slug: "downtown-strathroy",
    name: "Downtown Strathroy",
    city: "Strathroy",
    citySlug: "strathroy",
    province: "Ontario",
    description: "Strathroy's walkable core — affordable rents, small-town feel, and strong demand from families and trades workers.",
    longDescription: "Downtown Strathroy offers what bigger cities can't — affordability, community, and a genuinely relaxed pace of life. Rental demand here comes primarily from families, tradespeople, and workers commuting to London along Highway 402. Units are easier to acquire than in London and offer strong cash flow. Tenants who find a good rental here tend to stay, which means lower turnover and fewer headaches for landlords.",
    avgRent: { oneBed: "$1,150", twoBed: "$1,400", threeBed: "$1,750" },
    highlights: ["Strong cash flow", "Low purchase prices", "Stable tenant demand", "Low vacancy"],
    tenantProfile: "Families, trades workers, London commuters",
    nearbyAmenities: ["Strathroy District Collegiate Institute", "Strathroy Middlesex General Hospital", "Four Counties Health Services", "Highway 402 access"],
  },
  {
    slug: "west-strathroy",
    name: "West Strathroy",
    city: "Strathroy",
    citySlug: "strathroy",
    province: "Ontario",
    description: "Family-friendly west end with newer housing stock and excellent schools — great for landlords seeking stable long-term tenants.",
    longDescription: "West Strathroy is the family end of town — newer subdivisions, well-maintained streets, and proximity to parks and schools. Tenants here are predominantly families looking for a safe, quiet neighbourhood within commuting distance of London. Properties don't stay vacant long, and tenants who move in with kids tend to stay for years.",
    avgRent: { oneBed: "$1,100", twoBed: "$1,375", threeBed: "$1,700" },
    highlights: ["Family neighbourhood", "Low turnover", "Newer housing stock", "Easy highway access"],
    tenantProfile: "Young families, couples, long-term renters",
    nearbyAmenities: ["Strathroy District Collegiate", "Optimist Park", "Strathroy Arena", "Shopping plazas"],
  },
  {
    slug: "caradoc",
    name: "Caradoc / Rural Strathroy",
    city: "Strathroy",
    citySlug: "strathroy",
    province: "Ontario",
    description: "Rural properties and acreages on the outskirts of Strathroy — growing demand from buyers seeking space and affordability.",
    longDescription: "The rural areas surrounding Strathroy are attracting a new wave of renters — remote workers, retirees, and families who want space without the London price tag. Larger properties with land are in particularly short supply for rent. Landlords managing rural or semi-rural properties in this corridor can command strong rents relative to their acquisition cost, especially for well-maintained homes with modern amenities.",
    avgRent: { oneBed: "$1,050", twoBed: "$1,300", threeBed: "$1,650" },
    highlights: ["Rural setting", "Space and privacy", "Remote worker appeal", "Underserved rental market"],
    tenantProfile: "Remote workers, retirees, families seeking space",
    nearbyAmenities: ["Strathroy town centre", "Thames River access", "Highway 402", "London (30 min)"],
  },
];

export function getNeighbourhood(citySlug: string, neighbourhoodSlug: string): Neighbourhood | undefined {
  return neighbourhoods.find((n) => n.citySlug === citySlug && n.slug === neighbourhoodSlug);
}

export function getNeighbourhoodsByCity(citySlug: string): Neighbourhood[] {
  return neighbourhoods.filter((n) => n.citySlug === citySlug);
}

export const cityMeta: Record<string, { name: string; slug: string }> = {
  london: { name: "London", slug: "london" },
  "st-thomas": { name: "St. Thomas", slug: "st-thomas" },
  strathroy: { name: "Strathroy", slug: "strathroy" },
};
