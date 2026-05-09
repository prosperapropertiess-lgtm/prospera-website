# OpenClaw Scraper — Prospera Properties Rental Intelligence

## Mission

Scrape active rental listings from multiple sources for London, St. Thomas, and Strathroy (Ontario, Canada). Output clean, structured data to a Google Sheet. This data feeds a rental market intelligence engine that helps landlords price their properties accurately.

Run once per week. Scrape all sources. Clean everything. Append to the sheet.

---

## Schedule

**Every Sunday at 3:00 AM EDT**

Run all sources in sequence. Complete one source fully before starting the next.

---

## Sources

### 1. Kijiji
**London:** `https://www.kijiji.ca/b-apartments-condos/london/c37l1700215`
**St. Thomas:** `https://www.kijiji.ca/b-apartments-condos/st-thomas/c37l1700214`
**Strathroy:** `https://www.kijiji.ca/b-apartments-condos/strathroy/c37l80009`

- Scrape up to 10 pages per city
- Data lives in `__NEXT_DATA__` JSON on each page
- Wait 2 seconds between pages to avoid rate limiting

### 2. Realtor.ca
**London:** `https://www.realtor.ca/map#ZoomLevel=12&Center=42.983612,-81.249725&LatitudeMax=43.1&LatitudeMin=42.8&LongitudeMax=-81.0&LongitudeMin=-81.5&Sort=6-D&PropertyTypeGroupID=1&TransactionTypeId=3&PropertySearchTypeId=1`
**St. Thomas:** `https://www.realtor.ca/map#ZoomLevel=12&Center=42.775,-81.183&LatitudeMax=42.85&LatitudeMin=42.70&LongitudeMax=-81.05&LongitudeMin=-81.32&Sort=6-D&PropertyTypeGroupID=1&TransactionTypeId=3&PropertySearchTypeId=1`
**Strathroy:** `https://www.realtor.ca/map#ZoomLevel=13&Center=42.958,-81.616&LatitudeMax=43.0&LatitudeMin=42.91&LongitudeMax=-81.54&LongitudeMin=-81.70&Sort=6-D&PropertyTypeGroupID=1&TransactionTypeId=3&PropertySearchTypeId=1`

- Use the API endpoint: `https://api2.realtor.ca/Listing.svc/PropertySearch_Post`
- Filter: `TransactionTypeId=3` (for lease/rent), `PropertyTypeGroupID=1` (residential)
- Realtor.ca has rich data — extract all available fields including sqft, building age, parking details
- Wait 3 seconds between requests

### 3. Rentals.ca
**London:** `https://rentals.ca/london`
**St. Thomas:** `https://rentals.ca/st-thomas`
**Strathroy:** `https://rentals.ca/strathroy`

- Scrape up to 5 pages per city
- Rich utility and amenity data — prioritize extracting these fields
- Wait 2 seconds between pages

### 4. Zumper
**London:** `https://www.zumper.com/apartments-for-rent/london-on`
**St. Thomas:** `https://www.zumper.com/apartments-for-rent/st-thomas-on`

- Scrape up to 5 pages per city
- Good for bedroom/bathroom/price data
- Wait 2 seconds between pages

### 5. Facebook Marketplace
**London rentals:** Search `London Ontario apartments for rent`
**St. Thomas rentals:** Search `St Thomas Ontario apartments for rent`

- Scrape up to 3 pages per city
- Less structured — extract what you can, leave rest blank
- source value: `facebook_marketplace`

---

## Phase 1 — Source Health Check

Before extracting anything, verify each source is accessible.

**Log this for each source:**
```
[PHASE 1] Kijiji — accessible: true/false
[PHASE 1] Realtor.ca — accessible: true/false
[PHASE 1] Rentals.ca — accessible: true/false
[PHASE 1] Zumper — accessible: true/false
[PHASE 1] Facebook Marketplace — accessible: true/false
```

**If a source is blocked or returns errors:** Skip it, log it, continue with the next source. Never let one failed source stop the whole run.

---

## Phase 2 — Discovery

For each accessible source and each city, count available listings before extracting.

**Log before Phase 3:**
```
[PHASE 2] Kijiji
  London:      X listings across Y pages
  St. Thomas:  X listings across Y pages
  Strathroy:   X listings across Y pages

[PHASE 2] Realtor.ca
  London:      X listings
  St. Thomas:  X listings
  Strathroy:   X listings

[PHASE 2] Rentals.ca
  London:      X listings across Y pages
  St. Thomas:  X listings across Y pages
  Strathroy:   X listings across Y pages

[PHASE 2] Zumper
  London:      X listings across Y pages
  St. Thomas:  X listings across Y pages

[PHASE 2] Facebook Marketplace
  London:      X listings
  St. Thomas:  X listings

[PHASE 2] Total across all sources: X listings to process
```

**Stop and report if total is under 30.** Something is wrong.

---

## Phase 3 — Extraction

Extract every listing from every source. Do not skip a listing because a field is missing — extract what you have, leave the rest blank.

### Fields to extract:

| Field | Notes |
|---|---|
| `title` | Raw listing headline — do not clean |
| `city` | London / St. Thomas / Strathroy |
| `city_zone` | See zone mapping below |
| `property_type` | See type mapping below |
| `bedrooms` | Number only |
| `bathrooms` | Number only |
| `sqft` | Number only, blank if not found |
| `rent_amount` | Monthly rent, number only, no $ sign |
| `parking_spots` | Number, 0 if none mentioned |
| `garage` | See garage mapping below |
| `utilities_included` | See utilities mapping below |
| `pet_friendly` | true / false / blank |
| `laundry` | See laundry mapping below |
| `furnished` | See furnished mapping below |
| `source` | kijiji / realtor_ca / rentals_ca / zumper / facebook_marketplace |
| `source_url` | Full URL of the individual listing |
| `scraped_at` | ISO 8601 timestamp — e.g. 2026-05-09T20:00:00.000Z |

---

## Phase 3 — Field Mapping

### city_zone
Map neighbourhood mentions to one of these exact values. Leave blank if unclear.

| If listing mentions... | Use this value |
|---|---|
| North London, Masonville, Fanshawe, Stoney Creek | `north` |
| Northeast, Hunt Club, Huron Heights | `north_east` |
| Northwest, Oakridge, Wonderland Rd N | `north_west` |
| South London, Old South, Wortley | `south` |
| Southeast, Pond Mills, Summerside | `south_east` |
| Southwest, Byron, Lambeth, White Oaks | `south_west` |
| East London, Argyle, Huron/Highbury | `east` |
| West London, Westmount | `west` |
| Downtown, Core, Richmond Row, King St | `downtown` |
| Central (St. Thomas / Strathroy only) | `central` |

### property_type
| If listing mentions... | Use this value |
|---|---|
| Apartment, unit, suite | `apartment` |
| House, home, detached, bungalow, two-storey | `house` |
| Condo (owned unit in condo building) | `condo` |
| Basement, lower level, lower unit | `basement` |
| Unclear | blank |

### garage
| If listing mentions... | Use this value |
|---|---|
| No garage / no parking | `none` |
| 1 car attached garage | `attached_single` |
| 2 car attached garage | `attached_double` |
| Detached garage | `detached` |
| Single garage (type unclear) | `single` |
| Double garage (type unclear) | `double` |

### utilities_included
| If listing mentions... | Use this value |
|---|---|
| Tenant pays all / no utilities | `none` |
| Water only | `water` |
| Hydro / electricity only | `hydro` |
| Water + hydro | `water_hydro` |
| Water + hydro + gas or heat | `water_hydro_gas` |
| All utilities / everything included | `all` |
| Unclear | blank |

### laundry
| If listing mentions... | Use this value |
|---|---|
| In-unit washer/dryer, ensuite laundry | `in_unit` |
| Shared laundry, coin laundry, laundry room | `shared` |
| No laundry mentioned | blank |

### furnished
| If listing mentions... | Use this value |
|---|---|
| Furnished, fully furnished | `fully_furnished` |
| Semi-furnished, partially furnished | `semi_furnished` |
| Unfurnished, empty, nothing mentioned | `unfurnished` |

### pet_friendly
| If listing mentions... | Use this value |
|---|---|
| Pets welcome, pets allowed | `true` |
| No pets, pets not allowed | `false` |
| Nothing mentioned | blank |

---

## Phase 3 — Extraction Health Check

Log after each source is fully extracted:

```
[PHASE 3] Kijiji — extracted: X listings
  rent_amount:        X% filled  ← if under 90%, extraction is broken
  bedrooms:           X% filled  ← if under 70%, extraction is broken
  bathrooms:          X% filled
  city_zone:          X% filled
  utilities_included: X% filled
  pet_friendly:       X% filled

[PHASE 3] Realtor.ca — extracted: X listings
  [same breakdown]

[PHASE 3] Rentals.ca — extracted: X listings
  [same breakdown]

[PHASE 3] Zumper — extracted: X listings
  [same breakdown]

[PHASE 3] Facebook Marketplace — extracted: X listings
  [same breakdown]
```

**If rent_amount or bedrooms fill rate drops below threshold for a source:** Log the warning but continue. Do not stop the whole run.

---

## Phase 4 — Deduplication

Deduplicate within this scrape run before writing. Two levels:

1. **Exact URL match** — same `source_url`, keep one
2. **Cross-source duplicate** — same city + bedrooms + rent_amount + property_type across different sources, keep the one with more fields filled

**Log:**
```
[PHASE 4] Duplicates removed (same URL): X
[PHASE 4] Duplicates removed (cross-source): X
[PHASE 4] Unique listings remaining: X
```

---

## Phase 5 — Validation

Drop listings that fail any of these checks:

| Check | Rule |
|---|---|
| `rent_amount` | Number between 500 and 8000 |
| `city` | Must be London, St. Thomas, or Strathroy |
| `bedrooms` | Number between 0 and 10 if present |
| `bathrooms` | Number between 0 and 10 if present |
| `source_url` | Must be a valid URL |

**Log:**
```
[PHASE 5] Listings dropped (failed validation): X
  - rent out of range: X
  - missing/invalid city: X
  - invalid URL: X
  - other: X
[PHASE 5] Listings passing validation: X
```

---

## Phase 6 — Google Sheet Output

**Sheet name:** `Raw Listings`

**Column order (exact):**
`scraped_at` | `city` | `city_zone` | `property_type` | `bedrooms` | `bathrooms` | `sqft` | `rent_amount` | `garage` | `parking_spots` | `utilities_included` | `pet_friendly` | `laundry` | `furnished` | `source` | `source_url` | `title`

**Rules:**
- Append rows — never overwrite existing data
- Leave cells blank (not "null", "N/A", or "undefined") when data is unavailable
- `true` / `false` for boolean fields — not 1/0 or Yes/No
- Numbers as numbers — not strings
- `scraped_at` in ISO 8601 format

**Log after write:**
```
[PHASE 6] Rows written to sheet: X
[PHASE 6] Sheet total rows (including header): X
[PHASE 6] Write status: SUCCESS / FAILED
```

---

## Phase 7 — Final Summary

Output this after every run:

```
=== SCRAPE COMPLETE ===
Run timestamp: [ISO timestamp]
Duration: X minutes

Sources:
  Kijiji:               X listings
  Realtor.ca:           X listings
  Rentals.ca:           X listings
  Zumper:               X listings
  Facebook Marketplace: X listings

Pipeline:
  Discovered:     X
  Extracted:      X
  Deduplicated:   X removed
  Validated:      X passed, X dropped
  Written:        X rows to sheet

Field coverage (across all listings):
  rent_amount:        X%
  bedrooms:           X%
  bathrooms:          X%
  sqft:               X%
  city_zone:          X%
  property_type:      X%
  utilities_included: X%
  pet_friendly:       X%
  laundry:            X%

Sources skipped (blocked/failed): [list or none]

Status: SUCCESS / PARTIAL / FAILED
```

If PARTIAL or FAILED:
```
Issues:
  - [Phase X] [Source] — [what went wrong]
```

---

## Error Handling

| Situation | What to do |
|---|---|
| Source blocked (CAPTCHA, 403, 429) | Wait 60 seconds, retry once. If still blocked, skip source and log it. |
| Individual listing page fails to load | Skip that listing, log the URL, continue. |
| Field extraction fails for one listing | Keep the listing with that field blank, continue. |
| Google Sheet write fails | Retry once after 30 seconds. If still failing, save all listings to a local JSON backup file. |
| Total validated listings under 30 | Log as FAILED. Still write whatever was collected to the sheet. |
| Run takes over 20 minutes | Log a warning. Complete current source then stop. |

---

## Notes

- This is temporary scaffolding. Once enough landlords submit their own data, scraping becomes less critical.
- Do not scrape more than 10 pages per source per city.
- Minimum 2 seconds between page requests per source.
- Realtor.ca has the richest data — prioritize getting sqft, building details, and parking from it.
- Facebook Marketplace is the least structured — treat it as best-effort only.
