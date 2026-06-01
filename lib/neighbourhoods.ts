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
  faqs: { q: string; a: string }[];
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
    longDescription: "Old North is consistently one of London's highest-demand rental areas. Heritage brick homes, mature tree canopy, and easy access to Richmond Row make it a top choice for professionals, academics, and families. Vacancies rarely last more than two weeks here. Landlords benefit from stable, long-term tenants and strong rent appreciation year over year.\n\nThe neighbourhood sits north of Oxford Street and stretches toward Western Road, putting tenants within easy reach of the downtown core, Victoria Hospital, and major transit routes. Streets like Huron, Waterloo, and Sydenham are particularly sought after for their canopy and heritage character.\n\nRental properties in Old North range from large century homes divided into upper and lower units, to purpose-built apartment buildings from the 1960s and 70s. Investors who purchased in Old North five to ten years ago have seen significant appreciation — and rents have followed the same trajectory. For landlords seeking a low-vacancy, high-quality-tenant neighbourhood, Old North remains one of London's most reliable bets.",
    avgRent: { oneBed: "$1,650", twoBed: "$2,100", threeBed: "$2,600" },
    highlights: ["Low vacancy rate", "Professional tenant pool", "Heritage architecture", "Walk to Richmond Row"],
    tenantProfile: "Young professionals, university faculty, established families",
    nearbyAmenities: ["Richmond Row", "Victoria Hospital", "Western University", "Hyde Park"],
    faqs: [
      {
        q: "What types of rental properties are most common in Old North, London?",
        a: "Old North is known for its converted century homes — many large heritage properties have been divided into upper and lower units. You'll also find small apartment buildings from the 1960s and 70s, and the occasional newer infill build. Two- and three-bedroom units are the most in-demand.",
      },
      {
        q: "How long do tenants typically stay in Old North rentals?",
        a: "Longer than average for London. Tenants in Old North — especially families and professionals — often renew for multiple years. Turnover tends to be driven by job relocation or home purchases rather than dissatisfaction, which means fewer surprise vacancies for landlords.",
      },
      {
        q: "Is Old North a good neighbourhood for property investment in London, Ontario?",
        a: "Yes. Old North has seen consistent rent appreciation and low vacancy for over a decade. Its proximity to Victoria Hospital, Western University, and the downtown core creates diverse, steady demand. Properties here rarely sit vacant and attract tenants who take care of them.",
      },
    ],
  },
  {
    slug: "wortley-village",
    name: "Wortley Village",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "London's most charming village neighbourhood — indie shops, farmers market, and a tight-knit community.",
    longDescription: "Wortley Village has a distinct character unlike anywhere else in London. The village centre is walkable, with local cafes, a weekly farmers market, and community events year round. Renters who move here rarely leave — turnover is some of the lowest in the city. For landlords, this means fewer vacancy periods and tenants who genuinely care for the property.\n\nThe neighbourhood is bounded roughly by Wharncliffe Road to the west, Ridout Street to the east, and Springbank Drive to the south. Wortley Road itself is the main commercial artery, lined with independent businesses that give the area its village feel. The Saturday farmers market runs from spring through fall and draws residents from across the city.\n\nRental properties in Wortley are mostly older detached homes and duplexes, with limited inventory — which is precisely why demand stays elevated. If a well-maintained unit becomes available here, it's common to receive multiple applications within 48 hours. Rent growth has been steady, and the neighbourhood's walkability and community identity attract long-term renters who treat the property as their home.",
    avgRent: { oneBed: "$1,600", twoBed: "$2,050", threeBed: "$2,500" },
    highlights: ["Lowest turnover in the city", "Walkable village core", "Farmers market", "Strong community ties"],
    tenantProfile: "Artists, young couples, long-term renters",
    nearbyAmenities: ["Wortley Village shops", "Springbank Park", "Ridout Trail", "South London Community Centre"],
    faqs: [
      {
        q: "Why is Wortley Village so popular with renters in London?",
        a: "Wortley Village offers something rare in a mid-sized city: genuine walkability, independent businesses, and a strong community identity. Tenants who move here often describe it as the best place they've lived in London. That emotional attachment translates directly into low turnover and reliable rent payments.",
      },
      {
        q: "How competitive is the rental market in Wortley Village?",
        a: "Very competitive. Available units in Wortley Village are scarce compared to demand. Well-priced, well-maintained properties typically receive multiple applications within a few days of listing. If you own a rental here, you have significant pricing power.",
      },
      {
        q: "What are typical rental property types in Wortley Village?",
        a: "Most rentals in Wortley Village are older detached homes converted to upper-lower units, or century-era duplexes and triplexes. New builds are rare, which keeps supply constrained and demand high. Two-bedroom units are the most common and in highest demand.",
      },
    ],
  },
  {
    slug: "byron",
    name: "Byron",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "Southwest London's family-friendly hub — excellent schools, Springbank Park, and stable long-term tenants.",
    longDescription: "Byron attracts families looking for space, good schools, and proximity to Springbank Park — one of London's best green spaces. Rental demand is steady year-round and skews toward families and couples who tend to sign multi-year leases. Properties in Byron hold their value well and offer landlords predictable, low-drama tenancies.\n\nByron sits in the southwest quadrant of the city, bordered by Wonderland Road to the east, the Thames River to the north, and Springbank Drive along its southern edge. The neighbourhood grew primarily in the 1970s and 80s, meaning much of the housing stock consists of larger bungalows and two-storey homes with yards — exactly what families are looking for.\n\nFor landlords, Byron's appeal is stability. Families who move here for the schools — particularly Byron Northview Public School and Sir Frederick Banting Secondary — often stay for years. Turnover tends to happen on a school-year cycle, giving landlords advance notice and time to re-rent without extended vacancies. Rent growth has been modest but consistent, reflecting the neighbourhood's family-oriented, lower-churn character.",
    avgRent: { oneBed: "$1,500", twoBed: "$1,950", threeBed: "$2,400" },
    highlights: ["Top-rated schools nearby", "Springbank Park", "Family tenants", "Long lease terms"],
    tenantProfile: "Families, couples, long-term renters",
    nearbyAmenities: ["Springbank Park", "Byron Community Centre", "Westmount Shopping Centre", "Thames River trails"],
    faqs: [
      {
        q: "What schools are near rental properties in Byron, London?",
        a: "Byron is served by Byron Northview Public School (JK–8), Sir Frederick Banting Secondary School, and several Catholic school options including St. George Catholic School. The school quality is a major draw for family tenants and is one of the main reasons turnover in Byron is lower than many other London neighbourhoods.",
      },
      {
        q: "How does Byron compare to other London neighbourhoods for rental investment?",
        a: "Byron is better suited for landlords who prioritize stability over maximum rent growth. You'll get tenants who stay 3–5 years and treat the property well, but you won't see the same rent appreciation as Old North or Masonville. It's a lower-risk, lower-volatility investment that suits landlords who want minimal management headaches.",
      },
      {
        q: "Is there demand for larger rental homes in Byron?",
        a: "Yes — three-bedroom homes with yards are in short supply for rent in Byron. Most of the rental stock is two-bedroom apartments and smaller units. Larger single-family rentals command a premium and attract the most stable, long-term tenants the neighbourhood has to offer.",
      },
    ],
  },
  {
    slug: "masonville",
    name: "Masonville",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "North London's premier rental market — close to Western University and University Hospital with near-zero vacancy.",
    longDescription: "Masonville is one of London's tightest rental markets. Proximity to Western University and University Hospital generates constant demand from grad students, residents, nurses, and healthcare professionals. Well-maintained properties here rarely sit vacant for more than a week. Rental rates have climbed steadily, making this one of the best areas in London for landlord returns.\n\nThe neighbourhood centres around Masonville Place mall and stretches north toward Fanshawe Park Road and east toward Richmond Street. University Hospital (LHSC) is on the western edge, drawing a large population of healthcare workers who want to live close to work. Western's main campus is a short bus ride or 15-minute bike ride away.\n\nFor investors, Masonville represents the best combination of yield and demand in London. Vacancy rates are consistently below 1%. Tenants — whether grad students finishing a degree or nurses completing a shift rotation — reliably renew or are replaced within weeks. One- and two-bedroom units perform best here, though three-bedroom properties shared among grad students also generate strong returns.",
    avgRent: { oneBed: "$1,700", twoBed: "$2,200", threeBed: "$2,750" },
    highlights: ["Near Western University", "University Hospital catchment", "Near-zero vacancy", "Strong rent growth"],
    tenantProfile: "Medical professionals, grad students, healthcare workers",
    nearbyAmenities: ["Masonville Place", "Western University", "University Hospital (LHSC)", "Medway Valley Heritage Forest"],
    faqs: [
      {
        q: "Who are the typical tenants renting in the Masonville area of London?",
        a: "Masonville draws a mix of healthcare workers from University Hospital (LHSC), graduate students and faculty from Western University, and young professionals working in North London. This diverse demand base means vacancy is rare — when one tenant group slows down, another picks up.",
      },
      {
        q: "What rental unit sizes perform best in Masonville?",
        a: "One- and two-bedroom units command the best rents relative to size in Masonville. Three-bedroom units shared among grad students also perform well. Studios can work near the hospital but have a narrower tenant pool. Well-maintained, updated one-bedroom units near Western University consistently receive the most applications.",
      },
      {
        q: "Is Masonville a good area to invest in rental property in London, Ontario?",
        a: "Masonville is consistently one of the top-performing rental investment areas in London. Vacancy rates are near zero, rent growth has been strong, and the dual demand from Western University and LHSC provides a buffer against economic slowdowns. It's the area we most commonly recommend to new investors.",
      },
    ],
  },
  {
    slug: "old-east-village",
    name: "Old East Village",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "London's most rapidly gentrifying neighbourhood — rising values, creative tenants, and growing rental demand.",
    longDescription: "Old East Village is undergoing a significant transformation. Once overlooked, it's now attracting artists, entrepreneurs, and young professionals drawn by affordable rents and a growing arts scene along Dundas Street. Savvy landlords are getting in early — prices are still accessible but trending upward quickly as the neighbourhood fills with new businesses and community investment.\n\nThe neighbourhood runs along Dundas Street East from Adelaide Street to around Clarke Road. It's seen substantial City of London investment in streetscaping and infrastructure over the last decade, and new businesses — restaurants, studios, co-working spaces — continue to open along the main corridor. The Covent Garden Market and Victoria Park anchor the western edge.\n\nFor investors, Old East Village represents the best value-add opportunity in London right now. Purchase prices remain below most other inner-city neighbourhoods, but rents are rising as the demographic shifts. Tenants are creative, entrepreneurial, and community-focused — they tend to stay and often improve the properties they rent. In five years, this neighbourhood is likely to look very different from today.",
    avgRent: { oneBed: "$1,350", twoBed: "$1,700", threeBed: "$2,100" },
    highlights: ["Rapidly gentrifying", "Strong upside potential", "Arts district", "Affordable entry point"],
    tenantProfile: "Artists, entrepreneurs, young creatives",
    nearbyAmenities: ["Covent Garden Market", "Dundas Street arts corridor", "Victoria Park", "Downtown core"],
    faqs: [
      {
        q: "Is Old East Village safe to invest in as a rental landlord?",
        a: "Yes, and the window for affordable entry is shrinking. Old East Village has seen significant City of London investment, rising business activity on Dundas Street, and a clear demographic shift toward younger professionals and creatives. Properties purchased today are likely to see strong appreciation over the next 5–10 years as gentrification accelerates.",
      },
      {
        q: "What type of tenants rent in Old East Village?",
        a: "Old East Village attracts artists, musicians, small business owners, and young professionals who value affordability and community over prestige. These tenants often stay long-term and are invested in the neighbourhood's success. Turnover tends to be lower than you'd expect for the price point.",
      },
      {
        q: "How do Old East Village rents compare to other London neighbourhoods?",
        a: "Old East Village still offers some of the most affordable rents in inner London, typically 15–25% below comparable units in Old North or Masonville. As the neighbourhood continues to gentrify, that gap is narrowing — which is what makes it attractive for investors entering now.",
      },
    ],
  },
  {
    slug: "white-oaks",
    name: "White Oaks",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "South London's high-demand rental corridor — diverse community, great transit, and consistent year-round demand.",
    longDescription: "White Oaks and South London offer some of the city's most consistent rental demand. The area's diversity, transit access, and affordable rents make it attractive to a wide range of tenants — from newcomers to long-established families. Landlords benefit from low vacancy, reliable demand, and lower purchase prices that translate to strong cash flow.\n\nThe neighbourhood is anchored by White Oaks Mall and sits along the Wellington Road and Jalna Boulevard corridors. London Transit routes connect residents to the downtown core and other employment centres efficiently. The area has a strong community identity supported by multicultural businesses, places of worship, and community organizations.\n\nFor investors focused on cash flow rather than appreciation, White Oaks is one of London's strongest performers. Purchase prices are lower than north or central London, while rental demand is consistent. The tenant pool is large and diverse, reducing the risk of extended vacancies. Properties here attract tenants who prioritize value, transit access, and community — a reliable, stable demographic for landlords.",
    avgRent: { oneBed: "$1,350", twoBed: "$1,650", threeBed: "$2,050" },
    highlights: ["Strong transit access", "Diverse tenant pool", "Consistent demand", "Best cash flow in London"],
    tenantProfile: "Newcomers, diverse families, service workers",
    nearbyAmenities: ["White Oaks Mall", "South London Community Centre", "YMCA", "Bus terminal"],
    faqs: [
      {
        q: "Why is White Oaks popular with rental tenants in London, Ontario?",
        a: "White Oaks offers affordable rents, strong transit connections, and a welcoming diverse community. For newcomers to Canada and working families, it provides the best combination of cost, accessibility, and community support services in London. The area has consistently strong rental demand regardless of broader economic conditions.",
      },
      {
        q: "What is the cash flow like for rental properties in the White Oaks area?",
        a: "White Oaks typically offers the best cash-flow returns in London for investors. Lower purchase prices combined with solid rental demand mean better cap rates compared to Old North or Masonville. The trade-off is slower appreciation, but for landlords focused on monthly income, it's hard to beat South London.",
      },
      {
        q: "What rental unit types are in highest demand in White Oaks?",
        a: "Two- and three-bedroom units are the most sought-after in White Oaks, driven by families and multi-person households looking for affordable space. One-bedroom units also lease well, particularly near transit routes. Properties with on-site laundry and parking have the strongest demand.",
      },
    ],
  },
  {
    slug: "downtown-london",
    name: "Downtown London",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "London's urban core is growing fast — new condos, young professionals, and a booming restaurant and nightlife scene.",
    longDescription: "Downtown London has seen major investment over the last five years. Condo development, new restaurants, and remote workers choosing city living have made it one of the fastest-growing rental markets in the region. Younger tenants who want to walk to work, restaurants, and entertainment are driving demand for updated units. Landlords with renovated suites command premium rents here.\n\nThe downtown core is roughly bounded by the Thames River to the north and south, Adelaide Street to the east, and Wharncliffe Road to the west. The Covent Garden Market, Budweiser Gardens, and Richmond Row are the main activity anchors. The Via Rail station connects downtown to Toronto and Windsor, which draws a specific demographic of urban professionals who commute regularly.\n\nFor landlords, downtown London requires active management — turnover is higher than residential neighbourhoods, tenants expect modern finishes and in-suite laundry, and competition from new condo buildings is increasing. However, the rent premiums for well-maintained, updated units are significant. Investors who keep properties current and well-managed consistently achieve top-of-market rents and low vacancy.",
    avgRent: { studio: "$1,200", oneBed: "$1,550", twoBed: "$2,000" },
    highlights: ["Fastest-growing rental market", "Walk score 90+", "Young professional tenants", "New development"],
    tenantProfile: "Remote workers, young professionals, students",
    nearbyAmenities: ["Covent Garden Market", "Budweiser Gardens", "Richmond Row", "Via Rail station"],
    faqs: [
      {
        q: "Is downtown London a good area for rental investment?",
        a: "Downtown London offers strong rents and consistent demand from young professionals and remote workers, but requires more active management than suburban areas. Tenants expect updated finishes, in-suite laundry, and proximity to amenities. Landlords who invest in their properties here typically achieve the best rents in the city, but should budget for higher maintenance and turnover costs.",
      },
      {
        q: "What amenities do downtown London tenants prioritize?",
        a: "In-suite laundry, updated kitchens and bathrooms, and high-speed internet infrastructure are the biggest differentiators for downtown tenants. Bike storage and proximity to Richmond Row, the Covent Garden Market, and the Via Rail station also rank highly. Parking matters less in downtown London than in suburban areas.",
      },
      {
        q: "How does downtown London rental demand compare to other parts of the city?",
        a: "Downtown London has the fastest rent growth of any submarket in the city over the last five years, driven by condo development attracting a new resident demographic. Vacancy is low for updated units but higher for older properties that haven't been renovated. The key is keeping units current with what the market expects.",
      },
    ],
  },
  {
    slug: "east-london",
    name: "East London",
    city: "London",
    citySlug: "london",
    province: "Ontario",
    description: "Affordable rents and strong student demand — ideal for landlords targeting the Fanshawe College catchment area.",
    longDescription: "East London is the gateway to Fanshawe College, making it a top destination for student renters and young professionals entering the workforce. Rents are among the most affordable in the city, giving landlords access to a large tenant pool. Units near transit routes fill fast — vacancies in this part of London average under two weeks.\n\nEast London stretches from the downtown core along Dundas Street East toward Clarke Road and beyond. The Oxford Street East corridor provides strong transit connections, and Fanshawe College — one of Ontario's largest community colleges — sits in the northeast corner of the area. Argyle Mall serves as the commercial anchor.\n\nFor investors, East London's strength is volume: large tenant pools, fast lease-up times, and entry-level purchase prices. The challenge is that student tenants require more active screening and management than professional tenants. Landlords who invest in proper tenant screening and set clear expectations upfront typically have excellent experiences here. Multi-unit buildings are common in this area and often represent strong cash-flow opportunities.",
    avgRent: { oneBed: "$1,300", twoBed: "$1,600", threeBed: "$1,950" },
    highlights: ["Fanshawe College nearby", "Affordable rents", "Large tenant pool", "Fast-filling vacancies"],
    tenantProfile: "College students, young professionals, trades workers",
    nearbyAmenities: ["Fanshawe College", "Argyle Mall", "East London Community Centre", "Highway 401 access"],
    faqs: [
      {
        q: "Is East London suitable for student rental properties?",
        a: "Yes, and it's one of the best areas in London for this strategy. Fanshawe College has a large, steady enrollment that creates consistent demand for rentals in East London. Landlords who run tight operations — clear lease terms, proper screening, prompt maintenance — do very well here. The key is not cutting corners on tenant selection.",
      },
      {
        q: "How are East London rents trending compared to other London neighbourhoods?",
        a: "East London rents are rising, but more slowly than Old North, Masonville, or downtown. The affordability of the area is both its strength (large tenant pool) and a limiting factor on rent growth. For cash-flow investors, the lower purchase prices make the numbers work well even at current rents.",
      },
      {
        q: "What is the typical vacancy period for rentals in East London?",
        a: "For well-priced, well-maintained units in East London, vacancy periods are typically under two weeks. The large student population and proximity to Fanshawe College create year-round demand, with a peak in late summer as the new academic year approaches. Listing in July and August consistently produces the fastest lease-up times.",
      },
    ],
  },

  // ── St. Thomas ───────────────────────────────────────────────────────────
  {
    slug: "downtown-st-thomas",
    name: "Downtown St. Thomas",
    city: "St. Thomas",
    citySlug: "st-thomas",
    province: "Ontario",
    description: "The heart of St. Thomas — walkable, affordable, and growing as Amazon and Volkswagen investment draws workers to the area.",
    longDescription: "Downtown St. Thomas is experiencing a real moment. Major investment from Amazon and the Volkswagen battery plant is bringing thousands of jobs to Elgin County, and rental demand is climbing fast. Downtown units are affordable compared to London while offering everything tenants need within walking distance. Landlords who move now are ahead of the curve.\n\nThe downtown core runs along Talbot Street and the surrounding blocks, with Pinafore Park at the southern edge providing green space. The area has a walkable, small-city character that appeals to workers relocating from larger centres who want more space for less money. City Hall, the library, and the Elgin County Courthouse anchor the civic core.\n\nFor investors, the Volkswagen EV battery plant — one of the largest manufacturing investments in Canadian history — is a structural demand driver that will impact St. Thomas rentals for years. Workers and contractors relocating to support the project need housing, and the downtown offers the best combination of walkability and affordability. Properties purchased now, before the full employment wave arrives, represent some of the best value in Southwestern Ontario.",
    avgRent: { oneBed: "$1,250", twoBed: "$1,550", threeBed: "$1,900" },
    highlights: ["Rapid job growth", "Volkswagen plant impact", "Affordable entry", "High demand ahead"],
    tenantProfile: "Trades workers, young families, newcomers",
    nearbyAmenities: ["Elgin County Courthouse", "Pinafore Park", "City Hall", "St. Thomas Library"],
    faqs: [
      {
        q: "How will the Volkswagen battery plant affect rental demand in St. Thomas?",
        a: "The Volkswagen EV battery plant in St. Thomas is one of the largest manufacturing investments in Canadian history. When fully operational, it will employ thousands of workers directly, plus additional contractors and service workers. This will put significant upward pressure on rental demand and rents across St. Thomas, particularly downtown and in areas accessible by transit.",
      },
      {
        q: "Is downtown St. Thomas a good area to invest in rental property right now?",
        a: "The timing is compelling. St. Thomas rents and property prices are still well below London levels, but the demand fundamentals are shifting fast. Amazon's distribution centre and the Volkswagen plant represent structural employment growth that will drive rental demand for a decade. Investors entering now get ahead of that wave.",
      },
      {
        q: "What types of tenants are renting in downtown St. Thomas?",
        a: "Downtown St. Thomas attracts trades workers, young families, newcomers to Canada, and workers relocating for employment at the Amazon facility and upcoming Volkswagen plant. The demographic is primarily working-class and blue-collar, with a growing influx of skilled trades as the VW plant construction accelerates.",
      },
    ],
  },
  {
    slug: "northwest-st-thomas",
    name: "Northwest St. Thomas",
    city: "St. Thomas",
    citySlug: "st-thomas",
    province: "Ontario",
    description: "Family neighbourhoods close to schools and parks — ideal for landlords targeting stable, longer-term tenants.",
    longDescription: "Northwest St. Thomas is predominantly residential — quiet streets, good schools, and proximity to Pinafore Park make it a natural fit for families. Tenants here tend to stay for years, reducing turnover costs and vacancy headaches. With St. Thomas's growth trajectory, properties in this area are likely to see solid appreciation.\n\nThe northwest quadrant sits above the downtown core toward Elm Street and Sunset Drive, characterized by post-war housing stock and newer subdivisions further out. The area is served by Arthur Voaden Secondary School and several elementary schools, making it a natural landing spot for families moving to St. Thomas for work.\n\nFor investors, northwest St. Thomas offers the stability of a family-oriented neighbourhood at prices that are a fraction of comparable London areas. Tenants who come for the schools tend to sign multi-year leases, which reduces the management burden significantly. As the Volkswagen plant ramps up employment, demand for larger family rentals in quiet residential areas like this is expected to grow.",
    avgRent: { oneBed: "$1,200", twoBed: "$1,500", threeBed: "$1,850" },
    highlights: ["Family-oriented", "Low turnover", "School catchment area", "Pinafore Park access"],
    tenantProfile: "Families, long-term renters, couples",
    nearbyAmenities: ["Pinafore Park", "Arthur Voaden Secondary School", "YMCA St. Thomas", "Mitchell Hepburn Park"],
    faqs: [
      {
        q: "What schools serve the northwest St. Thomas rental area?",
        a: "Northwest St. Thomas is served by Arthur Voaden Secondary School, Mitchell Hepburn Public School, and St. Anne Catholic Elementary School, among others. School quality and proximity are a primary draw for family tenants in this part of the city, and the catchment area is a reliable anchor for long-term tenancies.",
      },
      {
        q: "How does northwest St. Thomas compare to downtown for rental investment?",
        a: "Northwest St. Thomas offers more stability and lower turnover than downtown, but typically slower rent growth. It suits landlords who prefer set-and-forget management over active portfolio optimization. Family tenants in the northwest tend to stay 2–4 years, compared to shorter tenancies typical of downtown.",
      },
      {
        q: "Will the Volkswagen plant affect rental demand in northwest St. Thomas?",
        a: "Yes, indirectly. As the VW plant and Amazon facility draw more workers and families to St. Thomas, demand for family-sized rentals in residential neighbourhoods will increase. Northwest St. Thomas — with its schools, parks, and quieter streets — is exactly the type of area that relocating families will target.",
      },
    ],
  },
  {
    slug: "elgin-mall-area",
    name: "Elgin Mall Area",
    city: "St. Thomas",
    citySlug: "st-thomas",
    province: "Ontario",
    description: "High-traffic corridor with convenient access to shopping and employment — strong demand from service and retail workers.",
    longDescription: "The Elgin Mall area is St. Thomas's commercial hub, and the surrounding residential streets attract tenants who work nearby in retail, healthcare, and trades. Transit access is good and rents are accessible, making units here easy to fill. The area is also well-positioned to benefit from the Volkswagen plant employment wave coming to the region.\n\nThe neighbourhood centres on Elgin Mall and the Talbot Street commercial corridor to the east, extending into the residential streets between Highbury Avenue and the mall. St. Thomas Elgin General Hospital is nearby, creating steady demand from healthcare workers who want to live close to work.\n\nFor investors, the Elgin Mall area offers a practical combination of amenities and transit access that appeals to a broad range of tenants. Unlike the downtown, which is more walkable and character-driven, this area's appeal is functional — proximity to employment, shopping, and services. Properties here lease quickly to practical, working tenants, and the upcoming industrial employment boom is expected to increase demand further.",
    avgRent: { oneBed: "$1,200", twoBed: "$1,475", threeBed: "$1,800" },
    highlights: ["Transit accessible", "Near employment hub", "Retail and services nearby", "Consistent demand"],
    tenantProfile: "Service workers, retail employees, young renters",
    nearbyAmenities: ["Elgin Mall", "St. Thomas Elgin General Hospital", "Highbury Park", "Multiple transit routes"],
    faqs: [
      {
        q: "Who are the main rental tenants in the Elgin Mall area of St. Thomas?",
        a: "The Elgin Mall corridor attracts service workers, retail employees, and healthcare workers from St. Thomas Elgin General Hospital. It's a practical, working-class rental market driven by employment proximity rather than lifestyle appeal. Tenants are reliable, working adults who prioritize convenience and affordability.",
      },
      {
        q: "Is the Elgin Mall area good for rental investment in St. Thomas?",
        a: "It's a solid, low-risk market with consistent demand and fast lease-up times. Purchase prices are reasonable and the tenant pool is large and stable. It won't generate the appreciation upside of the downtown core, but it offers reliable occupancy and straightforward property management.",
      },
      {
        q: "How will new industrial employment affect the Elgin Mall rental area?",
        a: "New manufacturing and distribution employment in St. Thomas will benefit the Elgin Mall area by expanding the tenant pool with trades workers and industrial employees who want housing near the city's commercial core. Expect upward pressure on rents as employment ramps up through 2025–2027.",
      },
    ],
  },

  // ── Strathroy ────────────────────────────────────────────────────────────
  {
    slug: "downtown-strathroy",
    name: "Downtown Strathroy",
    city: "Strathroy",
    citySlug: "strathroy",
    province: "Ontario",
    description: "Strathroy's walkable core — affordable rents, small-town feel, and strong demand from families and trades workers.",
    longDescription: "Downtown Strathroy offers what bigger cities can't — affordability, community, and a genuinely relaxed pace of life. Rental demand here comes primarily from families, tradespeople, and workers commuting to London along Highway 402. Units are easier to acquire than in London and offer strong cash flow. Tenants who find a good rental here tend to stay, which means lower turnover and fewer headaches for landlords.\n\nThe downtown core runs along Caradoc Street North and the surrounding blocks, with Strathroy District Collegiate Institute and Strathroy Middlesex General Hospital as the major institutions in the area. The town has a compact, walkable character that many tenants prefer to the suburban sprawl of larger cities.\n\nFor investors, downtown Strathroy represents a cash-flow play that many London-focused buyers overlook. Purchase prices are significantly lower, tenants are stable, and the commuting distance to London (30 minutes via Highway 402) makes it accessible to city employers. As London's housing costs continue to push renters further afield, Strathroy is a natural beneficiary — and downtown properties are the first to see demand increases.",
    avgRent: { oneBed: "$1,150", twoBed: "$1,400", threeBed: "$1,750" },
    highlights: ["Strong cash flow", "Low purchase prices", "Stable tenant demand", "Low vacancy"],
    tenantProfile: "Families, trades workers, London commuters",
    nearbyAmenities: ["Strathroy District Collegiate Institute", "Strathroy Middlesex General Hospital", "Four Counties Health Services", "Highway 402 access"],
    faqs: [
      {
        q: "Why do tenants choose to rent in downtown Strathroy over London?",
        a: "Affordability is the primary driver. Tenants can rent a comparable unit in Strathroy for significantly less than in London, and the 30-minute Highway 402 commute makes London employers accessible. For families, the small-town environment, lower density, and community feel are also strong draws.",
      },
      {
        q: "What is the cash flow like for rental properties in downtown Strathroy?",
        a: "Downtown Strathroy typically offers the best cap rates in the region for small landlords. Lower purchase prices and stable rents translate to strong monthly cash flow, especially for properties in good condition that don't require significant capital expenditure. It's a landlord-friendly market.",
      },
      {
        q: "Are Strathroy rents rising?",
        a: "Yes, gradually. As London rents push tenants to look further afield, Strathroy has seen steady rent increases over the past few years. The market won't see the same appreciation as urban London, but the combination of rising rents and low property costs is making Strathroy increasingly attractive to investors.",
      },
    ],
  },
  {
    slug: "west-strathroy",
    name: "West Strathroy",
    city: "Strathroy",
    citySlug: "strathroy",
    province: "Ontario",
    description: "Family-friendly west end with newer housing stock and excellent schools — great for landlords seeking stable long-term tenants.",
    longDescription: "West Strathroy is the family end of town — newer subdivisions, well-maintained streets, and proximity to parks and schools. Tenants here are predominantly families looking for a safe, quiet neighbourhood within commuting distance of London. Properties don't stay vacant long, and tenants who move in with kids tend to stay for years.\n\nThe west end of Strathroy developed primarily in the 1990s and 2000s, offering newer housing stock than the downtown core. Larger lot sizes, attached garages, and proximity to Optimist Park and the Strathroy Arena make it appealing to families with children. The area feeds into Strathroy District Collegiate for high school, which is a consistent draw.\n\nFor landlords, west Strathroy is the lowest-maintenance submarket in town. Families who rent here are looking for a long-term home, not a temporary arrangement. They care for the property, pay on time, and give adequate notice when they do leave. For investors focused on passive income with minimal intervention, the west end delivers.",
    avgRent: { oneBed: "$1,100", twoBed: "$1,375", threeBed: "$1,700" },
    highlights: ["Family neighbourhood", "Low turnover", "Newer housing stock", "Easy highway access"],
    tenantProfile: "Young families, couples, long-term renters",
    nearbyAmenities: ["Strathroy District Collegiate", "Optimist Park", "Strathroy Arena", "Shopping plazas"],
    faqs: [
      {
        q: "What makes west Strathroy attractive for family renters?",
        a: "West Strathroy offers newer housing stock, larger lots, and proximity to parks and the Strathroy Arena — exactly what families with children are looking for. Rents are significantly more affordable than comparable suburban areas in London, and the quality of life is high for families who don't need to be in the city daily.",
      },
      {
        q: "How long do tenants typically stay in west Strathroy rentals?",
        a: "Longer than average. Families in west Strathroy who find a good rental home often stay 3–5 years or more. Turnover tends to be driven by home purchases or job changes rather than dissatisfaction. For landlords, this means minimal vacancy and reduced management time.",
      },
      {
        q: "Is west Strathroy a good area to buy a rental property?",
        a: "It's excellent for investors who want stable, long-term tenants and minimal management intervention. The returns aren't as high as cash-flow-focused downtown properties, but the risk is very low. Properties in west Strathroy rarely sit vacant and attract tenants who treat them as their own homes.",
      },
    ],
  },
  {
    slug: "caradoc",
    name: "Caradoc / Rural Strathroy",
    city: "Strathroy",
    citySlug: "strathroy",
    province: "Ontario",
    description: "Rural properties and acreages on the outskirts of Strathroy — growing demand from buyers seeking space and affordability.",
    longDescription: "The rural areas surrounding Strathroy are attracting a new wave of renters — remote workers, retirees, and families who want space without the London price tag. Larger properties with land are in particularly short supply for rent. Landlords managing rural or semi-rural properties in this corridor can command strong rents relative to their acquisition cost, especially for well-maintained homes with modern amenities.\n\nCaradoc Township surrounds Strathroy to the north, west, and south, encompassing small hamlets and rural properties along concession roads and the Thames River valley. The area is known for its natural setting — riverside properties, large lots, and agricultural land that gives tenants the privacy and space unavailable in town.\n\nFor investors, rural Strathroy is a niche market but a compelling one. Competition is low, and well-maintained rural homes command rents that often exceed what you'd expect relative to purchase price. Remote workers who need high-speed internet but want acreage are a growing demographic here. The challenge is property maintenance — rural homes require more upkeep than urban units, which is precisely why professional property management adds the most value in this market.",
    avgRent: { oneBed: "$1,050", twoBed: "$1,300", threeBed: "$1,650" },
    highlights: ["Rural setting", "Space and privacy", "Remote worker appeal", "Underserved rental market"],
    tenantProfile: "Remote workers, retirees, families seeking space",
    nearbyAmenities: ["Strathroy town centre", "Thames River access", "Highway 402", "London (30 min)"],
    faqs: [
      {
        q: "Who rents rural properties in the Caradoc area near Strathroy?",
        a: "The Caradoc area attracts remote workers who want acreage and privacy, retirees downsizing from larger homes who still want rural space, and families who can't afford comparable properties in London or Strathroy proper. The shift to remote work has noticeably increased demand for larger rural rentals with good internet access.",
      },
      {
        q: "What should landlords know about managing rural rental properties near Strathroy?",
        a: "Rural properties require more active maintenance than urban units — well pumps, septic systems, laneways, and larger lots all need attention. Prospera Properties manages rural properties across this corridor and handles these specifics as part of our standard management service. The key is having local contractors on call who know rural systems.",
      },
      {
        q: "Are rural rental properties near Strathroy a good investment?",
        a: "They can be, but they suit experienced landlords or those working with a management company. The tenant pool is smaller but very stable — rural renters tend to stay long-term. Purchase prices are low, and rents for well-maintained properties with acreage command a premium in this undersupplied market.",
      },
    ],
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
