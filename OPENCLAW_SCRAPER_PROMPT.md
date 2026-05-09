# OpenClaw Scraper — Prospera Properties Rental Intelligence

## Mission

Scrape active rental listings from Kijiji for London, St. Thomas, and Strathroy (Ontario, Canada) and output clean, structured data to a Google Sheet. This data feeds a rental market intelligence engine that helps landlords price their properties accurately.

---

## Target URLs

Scrape these three city searches on Kijiji:

1. **London**: `https://www.kijiji.ca/b-apartments-condos/london/c37l1700215`
2. **St. Thomas**: `https://www.kijiji.ca/b-apartments-condos/st-thomas/c37l1700214`
3. **Strathroy**: `https://www.kijiji.ca/b-apartments-condos/strathroy/c37l80009`

Scrape all available pages for each city. Stop when you hit a page with no new listings or reach 10 pages.

---

## Phase 1 — Page Discovery

**What to do:**
- Load each city URL
- Count total listings found
- Identify number of pages available
- Log before moving to extraction

**Health check — log this before Phase 2:**
```
[PHASE 1] London: X listings found across Y pages
[PHASE 1] St. Thomas: X listings found across Y pages
[PHASE 1] Strathroy: X listings found across Y pages
[PHASE 1] Total: X listings to process
```

**Stop and report if:**
- Any city URL returns 0 listings (likely blocked or URL changed)
- Total listings across all cities is under 20 (something is wrong)

---

## Phase 2 — Listing Extraction

For each listing, extract every field you can find. Do not skip a listing because a field is missing — extract what you have and leave the rest blank.

### Fields to extract:

| Field | Where to find it | Notes |
|---|---|---|
| `title` | Listing headline | Raw text, don't clean |
| `city` | Which city search it came from | London / St. Thomas / Strathroy |
| `city_zone` | Neighbourhood/area in the listing title or description | See zone mapping below |
| `property_type` | Title or description | See type mapping below |
| `bedrooms` | Listed as "X bedroom" or "X bd" | Number only |
| `bathrooms` | Listed as "X bathroom" or "X ba" | Number only |
| `sqft` | Square footage if mentioned | Number only, null if not found |
| `rent_amount` | Monthly rent price | Number only, no $ sign |
| `parking_spots` | Number of parking spots mentioned | 0 if none mentioned |
| `garage` | Type of garage if mentioned | See garage mapping below |
| `utilities_included` | What utilities are included | See utilities mapping below |
| `pet_friendly` | Whether pets are allowed | true / false / null |
| `laundry` | Laundry situation | See laundry mapping below |
| `furnished` | Furnished status | See furnished mapping below |
| `source` | Always `kijiji` | Hardcoded |
| `source_url` | Full URL of the listing | Required |
| `scraped_at` | ISO timestamp when scraped | e.g. 2026-05-09T20:00:00.000Z |

---

## Phase 2 — Field Mapping

### city_zone
Map neighbourhood mentions to one of these exact values. If unclear, leave null.

| If listing mentions... | Use this value |
|---|---|
| North London, Masonville, Fanshawe, Stoney Creek | `north` |
| Northeast, Hunt Club, Huron Heights | `north_east` |
| Northwest, Oakridge, Wonderland Rd N | `north_west` |
| South London, Old South, Wortley | `south` |
| Southeast, Pond Mills, Summerside | `south_east` |
| Southwest, Byron, Lambeth, White Oaks | `south_west` |
| East London, Argyle, Huron/Highbury | `east` |
| West London, Westmount, Oakridge | `west` |
| Downtown, Core, Richmond Row, King St | `downtown` |
| Central (for St. Thomas / Strathroy) | `central` |

### property_type
| If listing mentions... | Use this value |
|---|---|
| Apartment, unit, suite, condo | `apartment` |
| House, home, detached, bungalow | `house` |
| Condo (owned unit in condo building) | `condo` |
| Basement, lower level, lower unit | `basement` |
| If unclear | null |

### garage
| If listing mentions... | Use this value |
|---|---|
| No garage / no parking mentioned | `none` |
| 1 car garage (attached) | `attached_single` |
| 2 car garage (attached) | `attached_double` |
| Single garage (detached) | `detached` |
| Single garage (type unclear) | `single` |
| Double garage (type unclear) | `double` |

### utilities_included
| If listing mentions... | Use this value |
|---|---|
| No utilities included / tenant pays all | `none` |
| Water only | `water` |
| Hydro / electricity only | `hydro` |
| Water + hydro | `water_hydro` |
| Water + hydro + gas/heat | `water_hydro_gas` |
| All utilities included / heat + hydro + water | `all` |
| If unclear | null |

### laundry
| If listing mentions... | Use this value |
|---|---|
| In-unit washer/dryer, ensuite laundry | `in_unit` |
| Shared laundry, coin laundry, laundry room | `shared` |
| No laundry mentioned | null |

### furnished
| If listing mentions... | Use this value |
|---|---|
| Furnished, fully furnished | `fully_furnished` |
| Semi-furnished, partially furnished | `semi_furnished` |
| Unfurnished, empty | `unfurnished` |
| Nothing mentioned | `unfurnished` |

### pet_friendly
| If listing mentions... | Use this value |
|---|---|
| Pets welcome, pets allowed, pet friendly | `true` |
| No pets, pets not allowed | `false` |
| Nothing mentioned | null |

---

## Phase 2 — Health Check

Log after each city is fully extracted:

```
[PHASE 2] London extracted: X listings
[PHASE 2] London — fields populated:
  - bedrooms: X% filled
  - bathrooms: X% filled
  - sqft: X% filled
  - rent_amount: X% filled (if under 90%, stop — something is wrong)
  - city_zone: X% filled
  - utilities_included: X% filled
  - pet_friendly: X% filled

[PHASE 2] St. Thomas extracted: X listings
[PHASE 2] Strathroy extracted: X listings
```

**Stop and report if:**
- `rent_amount` fill rate is under 90% — extraction is broken
- `bedrooms` fill rate is under 70% — extraction is broken
- Any city returns 0 listings after extraction

---

## Phase 3 — Deduplication

Before writing to the sheet, remove duplicates within this scrape run.

**Deduplicate on:** `source_url` (exact match)

If two listings have the same URL, keep only one.

**Health check:**
```
[PHASE 3] Duplicates removed: X
[PHASE 3] Final unique listings: X
```

---

## Phase 4 — Validation

Run these checks on every listing before writing. Drop listings that fail.

| Check | Rule |
|---|---|
| rent_amount | Must be a number between 500 and 8000 |
| city | Must be London, St. Thomas, or Strathroy |
| bedrooms | Must be a number between 0 and 10 if present |
| bathrooms | Must be a number between 0 and 10 if present |
| source_url | Must start with https://www.kijiji.ca |

**Health check:**
```
[PHASE 4] Listings dropped (failed validation): X
[PHASE 4] Reason breakdown:
  - rent out of range: X
  - missing city: X
  - invalid URL: X
[PHASE 4] Listings passing validation: X
```

---

## Phase 5 — Google Sheet Output

Write all validated listings to the Google Sheet, one row per listing.

**Sheet name:** `Raw Listings`

**Column order (exact):**
`scraped_at` | `city` | `city_zone` | `property_type` | `bedrooms` | `bathrooms` | `sqft` | `rent_amount` | `garage` | `parking_spots` | `utilities_included` | `pet_friendly` | `laundry` | `furnished` | `source` | `source_url` | `title`

**Rules:**
- Append rows — do not overwrite existing data
- Leave cells blank (not "null" or "N/A") when data is not available
- `true`/`false` for boolean fields — not 1/0 or Yes/No
- Numbers as numbers — not strings
- `scraped_at` in ISO 8601 format: `2026-05-09T20:00:00.000Z`

**Health check after write:**
```
[PHASE 5] Rows written to sheet: X
[PHASE 5] Sheet total rows (including header): X
[PHASE 5] Write successful: true/false
```

---

## Phase 6 — Final Summary

After all phases complete, output this summary:

```
=== SCRAPE COMPLETE ===
Run timestamp: [ISO timestamp]

Cities:
  London:      X listings
  St. Thomas:  X listings
  Strathroy:   X listings

Pipeline:
  Discovered:  X
  Extracted:   X
  Deduplicated: X removed
  Validated:   X passed, X dropped
  Written:     X rows to sheet

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

Status: SUCCESS / PARTIAL / FAILED
```

If status is PARTIAL or FAILED, include:
```
Issues:
  - [describe what went wrong and which phase it happened in]
```

---

## Error Handling

| Situation | What to do |
|---|---|
| Kijiji blocks the request (CAPTCHA, 403) | Wait 30 seconds, retry once. If still blocked, log and skip that city. |
| Listing page fails to load | Skip that listing, log the URL |
| Field extraction fails for one listing | Keep the listing with that field blank, continue |
| Google Sheet write fails | Retry once. If still failing, save listings to a local JSON file as backup. |
| Total extracted listings under 20 | Stop everything, report FAILED — do not write to sheet |

---

## Notes

- Run on a schedule: **Sundays 3:00 AM EDT**
- This data is temporary scaffolding. Once landlords are submitting their own data, the scraper becomes less critical.
- Do not scrape more than 10 pages per city — Kijiji degrades in quality past that point.
- Do not scrape faster than 1 page per 2 seconds — avoid rate limiting.
