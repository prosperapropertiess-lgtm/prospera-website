# Prospera Properties — Website Build Plan

## Project Overview

**Company:** Prospera Properties — property management company operating in London, St. Thomas, and Strathroy, Ontario, Canada.

**Founder:** Ebin (sole operator, hands-on, personal brand is a core differentiator)

**Existing tools:** Buildium (tenant/landlord portals, rent collection, maintenance tracking). The website does NOT replace Buildium — it sits on top as the public-facing brand + marketing engine + lead capture system.

**Reference site:** [belonghome.com](https://belonghome.com) — take heavy inspiration from their layout, structure, animations, and UX patterns. Adapt for a Canadian single-operator property management company.

**Design direction:** Visually stunning, fast, modern. Smooth scroll animations, micro-interactions, parallax effects. Navy and gold brand palette (Prospera's established identity). Think luxury real estate meets modern tech startup. NOT a WordPress site. This should feel like a funded startup's website even though it's bootstrapped.

---

## Tech Stack

| Layer | Tool | Cost | Purpose |
|-------|------|------|---------|
| Framework | Next.js (App Router) | Free | React-based, SSR for SEO, image optimization |
| Hosting | Vercel | Free tier | Auto-deploy from GitHub, global CDN, SSL |
| Database | Supabase | Free tier (500MB) | PostgreSQL, auth, file storage, real-time |
| Admin CMS | Directus (self-hosted on Hostinger) | Free | Visual admin panel for property uploads |
| Email | Resend | Free tier (3K/mo) | Transactional emails, newsletter sends |
| Images | Cloudinary | Free tier (25GB) | Image optimization, responsive delivery |
| Animations | Framer Motion | Free | Scroll animations, page transitions, micro-interactions |
| Blog | Markdown files in repo | Free | Agent-written, auto-deployed via Git |
| Analytics | Vercel Analytics | Free | Basic traffic metrics |
| Domain | Already owned | Paid | Connect to Vercel |

**Total monthly cost: $0** (until free tiers are exceeded)

---

## Design System

### Brand Identity

**IMPORTANT: LIGHT WARM THEME — NOT dark like Belong.**
The site should feel warm, welcoming, and premium — like walking into a well-designed home, not a corporate tech dashboard. Think luxury real estate editorial, not Silicon Valley startup.

- **Theme:** Light / warm — cream and warm white backgrounds, NOT dark mode
- **Primary color:** Deep navy (#0A1628 or similar) — used for text, navbar, accents, NOT as background
- **Accent color:** Gold (#C5A55A or similar) — buttons, highlights, hover states, ornamental details
- **Background:** Warm white (#FAF8F5) as primary background, soft cream (#F5F0EB) for alternating sections
- **Secondary surfaces:** Light warm gray (#E8E6E3) for cards and subtle section dividers
- **Text:** Navy (#0A1628) for headings, dark charcoal (#2C2C2C) for body text
- **Typography:** 
  - Headlines: Cormorant Garamond (serif, luxury feel) — already established in Prospera branding
  - Body: A clean sans-serif (DM Sans, Outfit, or similar — NOT Inter or Roboto)
- **Logo:** Prospera Properties crest (navy + gold, ornamental)
- **Overall feel:** Warm, inviting, premium, personal — like a high-end boutique, NOT a cold tech company
- **Photo direction:** Warm-toned property photography, natural light, golden hour shots where possible
- **Ornamental details:** Subtle gold borders, thin decorative lines — consistent with the booklet aesthetic

### Animation Philosophy
- Page transitions: smooth fade + slight upward slide
- Scroll-triggered reveals: elements fade in as they enter viewport
- Hover states: subtle scale/color shifts on cards and CTAs
- Number counters: animate stats (properties managed, years, etc.)
- Parallax: subtle on hero images, not overdone
- Library: Framer Motion for React components

### Component Library (reusable across pages)
1. **Navbar** — sticky, transparent on hero → solid on scroll, logo left, nav links center, CTA button right. INCLUDES two login buttons: "Landlord Login" and "Tenant Login" — both link directly to Buildium portal URLs (external links, open in new tab). These are NOT custom-built portals — Buildium handles the portal experience.
2. **Hero section** — full-width, background image/video, overlay text, CTA buttons
3. **Section heading** — centered, serif headline + sans-serif subtitle
4. **Feature card** — icon/image + headline + description, hover animation
5. **Testimonial carousel** — photo + quote + name, auto-rotate, swipeable
6. **Pricing comparison table** — Prospera vs. typical PM fees (Belong-style)
7. **Process stepper** — numbered steps with illustrations, scroll-triggered
8. **Property card** — photo, beds/baths, price, location, hover zoom on image
9. **CTA banner** — full-width colored section with headline + button
10. **FAQ accordion** — expandable questions, smooth height animation
11. **Footer** — multi-column, logo, nav links, contact info, social links
12. **Newsletter popup** — modal with email capture, timed trigger or exit-intent
13. **Lead capture form** — name, email, phone, property address, message
14. **Stats bar** — animated counters (properties managed, cities served, etc.)

---

## Site Map & Page-by-Page Plan

### PAGE 1: Homepage (/)

**Purpose:** Router page — establishes credibility, splits traffic to landlord and tenant paths.

**Sections (top to bottom):**

1. **Hero**
   - Full-screen background (professional property photo or video loop of London, ON)
   - Headline: "Property Management That Actually Cares."
   - Subtitle: "Serving landlords and tenants across London, St. Thomas, and Strathroy, Ontario."
   - Two CTA buttons: "I'm a Landlord" → /landlords | "I'm a Tenant" → /tenants
   - Scroll-down indicator (animated chevron)

2. **Social proof bar**
   - Google rating, number of properties managed, years in business
   - Scrolling or static — animated number counters on scroll

3. **Two-column split (Belong-style)**
   - Left: "Own rental property? We handle everything." → Button to /landlords
   - Right: "Looking for a home? Find your next rental." → Button to /tenants
   - Each with a supporting image

4. **How it works (brief 3-step version)**
   - Step 1: "Tell us about your property"
   - Step 2: "We find and screen tenants"
   - Step 3: "You collect rent, stress-free"
   - Visual: numbered cards with simple illustrations, scroll-animated

5. **Testimonials carousel**
   - 3-5 testimonials from real landlords/tenants
   - Photo + quote + name + "Landlord in London, ON"
   - Auto-rotate, swipeable

6. **CTA banner**
   - "Ready to stop managing your property alone?"
   - Button: "Get a Free Quote" → /contact

7. **Blog preview**
   - Latest 3 blog posts, card layout
   - "Read More" link to /blog

8. **Footer**

---

### PAGE 2: For Landlords (/landlords)

**Purpose:** The money page. Converts landlords into leads. Heavy inspiration from Belong's /homeowners page.

**Sections:**

1. **Hero**
   - Headline: "Property Management With Guaranteed Peace of Mind"
   - Subtitle: "We handle your tenants, maintenance, and rent collection — so you don't have to."
   - CTA: "Get a Free Rental Estimate" → scrolls to rent estimator
   - Background: professional property photo

2. **Pain points → solutions (3-column cards)**
   - "Tired of chasing rent?" → "We guarantee on-time collection"
   - "Dealing with maintenance calls at 2 AM?" → "24/7 emergency support"
   - "Can't find good tenants?" → "Thorough screening and vetting"

3. **How it works (detailed, Belong-style stepper)**
   - Step 1: "Introduce us to your property" — we inspect and assess
   - Step 2: "We prepare your property" — cleaning, photos, minor repairs
   - Step 3: "Professional marketing" — listings on major platforms
   - Step 4: "Tenant screening" — background checks, income verification, references
   - Step 5: "Move-in coordination" — lease signing, key handover
   - Step 6: "Ongoing management" — rent collection, maintenance, inspections
   - Each step: illustration + description, scroll-triggered animation

4. **Rent estimator tool**
   - Input: property address (or city + bedrooms + bathrooms)
   - Output: estimated monthly rent range
   - CTA after result: "Want a detailed analysis? Let's talk." → captures email
   - Data source: manually maintained comparable rents in Supabase

5. **Pricing comparison table (Belong-style)**
   - Two columns: "Prospera Properties" vs. "Typical Property Manager"
   - Rows: management fee, placement fee, lease renewal, vacancy fee, maintenance markup, early termination, setup fee, photo shoots, listing, etc.
   - Prospera column shows competitive/transparent pricing
   - Competitor column shows industry ranges

6. **Testimonials (landlord-specific)**
   - Focus on landlord pain points resolved
   - Video testimonials if available, otherwise text + photo

7. **FAQ (landlord-specific)**
   - "What's included in your management fee?"
   - "How do you screen tenants?"
   - "What happens if a tenant doesn't pay?"
   - "Can I still be involved in decisions?"
   - "What areas do you cover?"
   - Expandable accordion, SEO-optimized

8. **CTA banner**
   - "Let's talk about your property."
   - Button: "Get a Free Quote" → /contact

---

### PAGE 3: For Tenants (/tenants)

**Purpose:** Attract quality tenants, show that Prospera treats tenants with respect (a differentiator).

**Sections:**

1. **Hero**
   - Headline: "Find a Home You'll Actually Love"
   - Subtitle: "Quality rentals in London, St. Thomas, and Strathroy. Professionally managed, well-maintained."
   - CTA: "Browse Available Rentals" → /listings

2. **What you get as a Prospera tenant (3-4 feature cards)**
   - "Well-maintained properties" — regular inspections, fast repairs
   - "Responsive management" — 24/7 support for emergencies
   - "Clear communication" — no guessing, transparent processes
   - "Fair treatment" — we respect your home and your rights

3. **How renting works (3-step)**
   - Step 1: Browse available listings
   - Step 2: Apply online (links to Buildium application)
   - Step 3: Move in and enjoy

4. **Featured listings preview**
   - Pull 3-6 latest available properties from database
   - Property cards with photos, price, beds/baths
   - "See All Listings" → /listings

5. **Testimonials (tenant-specific)**

6. **FAQ (tenant-specific)**
   - "How do I apply?"
   - "What does the application process involve?"
   - "How do I submit a maintenance request?"
   - "What are my rights as a tenant in Ontario?"

7. **CTA: "Ready to find your next home?"** → /listings

---

### PAGE 4: Available Listings (/listings)

**Purpose:** This is NOT just a listing directory — it's a **property matcher web app**. Tenants land here, browse stunning property cards, check commute times from their workplace, get emotionally invested, and then you capture their email. The goal is to make this page so useful and beautiful that tenants interact with multiple properties before leaving — and every interaction is a chance to capture their contact info.

**Design:** Visually stunning. Think high-end real estate portal. Large property photos, smooth hover animations, warm light backgrounds. Every card should make the tenant want to click.

#### Listings Grid Page (/listings)

**Layout:**
- Hero banner at top: "Find Your Next Home in London, St. Thomas & Strathroy" with subtle background image
- **Filter bar** (sticky on scroll): city dropdown, bedrooms, bathrooms, price range slider, pet-friendly toggle
- **Sort options:** price low-high, price high-low, newest first
- **Property cards in responsive grid** (3 columns desktop, 2 tablet, 1 mobile)

**Each property card:**
- Large hero photo with subtle zoom on hover
- Price/month (large, prominent)
- Beds, baths, sqft (icon + number format)
- Address / neighborhood name
- 1-line teaser ("Quiet street near Western University")
- "View Details" button with hover animation
- Favorite/save heart icon (saves to localStorage, prompts email signup after 3 saves)

**Lead capture triggers on this page:**
- After viewing 2+ property detail pages → subtle slide-up popup: "Get alerts when new homes match your search"
- After spending 2+ minutes on page → popup: "Save your search and get notified of new listings"
- After using commute calculator → popup: "Get listings near your workplace delivered to your inbox"
- After saving 3+ favorites → popup: "Create a free account to save your favorites permanently"
- All popups capture: name, email, preferred city, max budget

#### Individual Property Page (/listings/[slug])

**Hero section:**
- Full-width photo gallery (lightbox viewer, swipeable, thumbnails below)
- Large price/month display
- Key stats bar: beds | baths | sqft | available date
- Two CTA buttons: "Apply Now" (→ Buildium) | "Schedule a Viewing" (→ Calendly or contact form)

**"Why You'll Love This Home" section:**
- 2-3 sentences written by Ebin about the property's vibe and personality
- Neighborhood description (walkability, vibe, nearby coffee shops, transit)
- Bullet highlights: parking included, in-unit laundry, pet-friendly, etc.
- This section should feel personal and warm — NOT a generic feature list

**Commute Calculator (key feature):**
- Interactive section: "How far is this from your workplace?"
- Input field: "Enter your workplace or any address"
- Uses **Google Maps Distance Matrix API** (free tier: ~100 requests/day, expandable)
- On submit: displays an embedded map showing both locations, plus:
  - Driving distance and time
  - Transit distance and time (if available)
  - Walking/biking distance and time
- User can enter multiple addresses (workplace, girlfriend's house, gym, etc.)
- Each address shows a pin on the map with distance/time
- **Lead capture hook:** After using the calculator, a subtle prompt appears: "Get listings within [X] minutes of your workplace. Enter your email."
- **Fallback if Google Maps costs increase:** Switch to Mapbox (more generous free tier) or OpenRouteService (completely free)

**Google Maps API setup:**
- Distance Matrix API: calculates travel time between two points
- Maps JavaScript API: renders the interactive map on the page
- Geocoding API: converts addresses to coordinates
- Free tier: $200/month credit (~28,000 map loads, ~40,000 distance calculations)
- Set billing alerts at $0 to prevent unexpected charges

**Nearby Amenities section:**
- Map showing nearby: schools, parks, grocery stores, transit stops, restaurants
- Uses Google Places API or a curated list per property
- Icons on map with distance labels

**Property details:**
- Full description (written by Ebin in admin panel)
- Features grid: parking type, laundry, heating/cooling, flooring, pets policy, lease terms
- Utilities included/excluded breakdown
- Move-in costs breakdown (first/last month, key deposit, etc.)

**Social proof:**
- "X people viewed this property this week" (tracked via simple view counter in Supabase)
- "Listed X days ago" with urgency styling if recent

**Bottom section:**
- Share buttons (copy link, Facebook, Twitter/X)
- "Similar Listings" carousel (same city, similar price range)
- CTA banner: "Interested? Apply now or schedule a viewing"

#### Admin Workflow (Backend)

**Property upload process (via Directus on Hostinger):**
1. Ebin logs into Directus admin panel (hosted on his Hostinger server)
2. Clicks "Add New Property"
3. Fills in all fields: title, address, city, price, beds, baths, sqft, description, "why you'll love this" copy, features checklist, pet policy, available date, Buildium application link
4. Uploads photos (drag and drop) → auto-compressed and pushed to Cloudinary
5. Sets status: "Available" / "Coming Soon" / "Rented"
6. Hits publish → property immediately appears on /listings
7. Optional: clicks "Send to Email List" → triggers Resend to blast to tenant subscribers filtered by city preference

**Auto-notifications:**
- When a property is published, tenants subscribed to that city get an email: "New listing in [city]: [property title] — [price]/month"
- Email includes property photo, key details, and a direct link to the listing page

#### Database Schema for Listings

**Table: properties**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Listing title ("Bright 3-Bed Near Western University") |
| slug | text | URL slug (auto-generated from title) |
| address | text | Full street address |
| city | text | London / St. Thomas / Strathroy |
| neighborhood | text | Neighborhood name |
| price | integer | Monthly rent in dollars |
| bedrooms | integer | Number of bedrooms |
| bathrooms | decimal | Number of bathrooms |
| sqft | integer | Square footage |
| description | text | Full property description |
| why_love | text | "Why you'll love this home" — personal copy |
| features | jsonb | Array: parking, laundry, heating, cooling, flooring, etc. |
| images | jsonb | Array of Cloudinary image URLs |
| pet_friendly | boolean | Allows pets |
| pet_details | text | Pet policy details (breed restrictions, deposit, etc.) |
| utilities_included | jsonb | Array: water, heat, hydro, internet, etc. |
| move_in_costs | jsonb | Object: first_month, last_month, key_deposit |
| available_date | date | When available for move-in |
| lease_term | text | "12 months", "Month-to-month", etc. |
| status | text | available / coming_soon / rented |
| buildium_link | text | Link to Buildium tenant application |
| latitude | decimal | For map display |
| longitude | decimal | For map display |
| view_count | integer | Simple analytics counter |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

**Table: property_views (analytics)**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| property_id | uuid | FK to properties |
| visitor_id | text | Anonymous session ID (cookie or fingerprint) |
| commute_checked | boolean | Did they use the commute calculator? |
| commute_from | text | Address they checked commute from |
| time_on_page | integer | Seconds spent on property page |
| created_at | timestamp | Auto |

**Table: saved_properties (if user gives email)**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| subscriber_id | uuid | FK to subscribers table |
| property_id | uuid | FK to properties |
| created_at | timestamp | Auto |

#### Claude Code Prompt for This Page:

```
Build a stunning property listings system for Prospera Properties.

LISTINGS GRID PAGE (/listings):
- Warm light theme (cream #FAF8F5 background, navy #0A1628 text, gold #C5A55A accents)
- Cormorant Garamond for headings, DM Sans for body
- Responsive property card grid (3 col desktop, 2 tablet, 1 mobile)
- Sticky filter bar: city, beds, baths, price range slider, pet-friendly toggle
- Cards: large photo with hover zoom, price, beds/baths/sqft icons, address, teaser line
- Framer Motion scroll animations (cards fade up as they enter viewport)
- Favorite heart icon on each card (localStorage)
- Pull data from Supabase "properties" table

PROPERTY DETAIL PAGE (/listings/[slug]):
- Full photo gallery with lightbox
- "Why You'll Love This Home" section (warm, personal copy)
- COMMUTE CALCULATOR: input field for address, Google Maps Distance Matrix API, shows map with pins and drive/transit/walk times. User can add multiple addresses.
- Nearby amenities map
- Features grid, utilities breakdown, move-in costs
- "X people viewed this week" counter
- Similar listings carousel at bottom
- CTAs: "Apply Now" (external Buildium link) and "Schedule a Viewing"

LEAD CAPTURE: Subtle popup after viewing 2+ properties OR using commute calculator. Captures name, email, preferred city.

Reference: belonghome.com/homes for the listings grid aesthetic. Make it warmer and more inviting — light theme, not dark.
```

---

### PAGE 5: Pricing (/pricing)

**Purpose:** Transparent pricing page that builds trust. Directly inspired by Belong's comparison table.

**Sections:**

1. **Headline:** "Transparent Pricing. No Surprises."

2. **Pricing packages** (if applicable — e.g., Basic vs. Full Management)
   - OR a single clear fee structure with everything included

3. **Comparison table (featured element)**
   - Prospera vs. typical Ontario property managers
   - Management fee, placement fee, lease renewal, maintenance markup, vacancy fee, setup, photos, advertising, inspection, early termination
   - Green checkmarks for Prospera, red X's or price ranges for competitors

4. **"What's included" breakdown**
   - List of every service covered under the management fee
   - Tenant screening, rent collection, maintenance coordination, financial reporting, annual inspections, etc.

5. **CTA:** "Get a custom quote for your property" → /contact

---

### PAGE 6: About (/about)

**Purpose:** This page sells YOU. Your story is your moat. No other PM company in London, Ontario has your journey.

**Sections:**

1. **Hero**
   - Large professional photo of Ebin
   - Headline: "Built From the Ground Up"
   - Subtitle: personal tagline about your mission

2. **Your story (narrative format)**
   - Came to Canada as an international student
   - Built from nothing, paid off debt, worked hard
   - Started Prospera Properties to solve problems you saw firsthand
   - Now managing properties across three cities
   - This section should feel personal, NOT corporate

3. **Mission / values**
   - What Prospera stands for
   - How you treat landlords and tenants differently

4. **Stats / milestones**
   - Properties managed, cities served, years in business
   - Animated counters

5. **Photo gallery**
   - Professional photos of you, your properties, your work
   - Candid shots that feel authentic

6. **CTA:** "Want to work with me?" → /contact

---

### PAGE 7: Blog (/blog)

**Purpose:** SEO engine. Agent-written articles targeting Ontario landlord/tenant keywords.

**Features:**
- Blog listing page with card grid
- Category filters (Landlord Tips, Tenant Resources, Market Updates, Ontario Law)
- Each card: featured image, title, excerpt, date, category tag, read time
- Search functionality

**Individual post page (/blog/[slug]):**
- Clean reading layout (max-width ~720px, generous line height)
- Featured image at top
- Table of contents (auto-generated from headings)
- Author block (Ebin's photo + bio)
- Related posts at bottom
- Social share buttons
- Newsletter signup CTA at bottom of every post

**Content strategy (for the blog agent):**
- "Ontario Landlord Tenant Act: What You Need to Know in 2026"
- "How Much Can You Charge for Rent in London, Ontario?"
- "5 Red Flags When Screening Tenants"
- "Property Management Fees in Ontario: What's Normal?"
- "Landlord Rights in Ontario: A Complete Guide"
- "How to Handle Late Rent Payments Legally in Ontario"
- Target 2-4 posts per week, 1500-2500 words each, SEO-optimized

---

### PAGE 8: City Landing Pages (/areas/london, /areas/st-thomas, /areas/strathroy)

**Purpose:** Local SEO. Target "property management [city]" keywords.

**Template (same for each city, different content):**

1. **Hero with city-specific headline**
   - "Property Management in London, Ontario"
   - Background: photo of that city

2. **Local market stats**
   - Average rent in [city], vacancy rates, market trends

3. **Services available in this area**
   - Same service list, but positioned as local

4. **Testimonials from landlords/tenants in that city**

5. **Local area guide** (brief)
   - Neighborhoods, schools, amenities — shows you know the area

6. **CTA:** "Get a free rental estimate for your [city] property"

---

### PAGE 9: Contact / Get a Quote (/contact)

**Purpose:** Lead capture. This is where conversions happen.

**Features:**
- Two-path form: "I'm a Landlord" / "I'm a Tenant" (different fields)
- Landlord form: name, email, phone, property address, number of units, message
- Tenant form: name, email, phone, desired city, budget, move-in date
- Form submissions → stored in Supabase + email notification via Resend
- Optional: Calendly embed for booking a call
- Contact info: phone, email, office address (if applicable)
- Map embed showing service area

---

### PAGE 10: FAQ (/faq)

**Purpose:** SEO + reduce support inquiries. Comprehensive version.

**Structure:**
- Tabbed or sectioned: "For Landlords" | "For Tenants" | "General"
- 15-20 questions covering everything
- Accordion format with smooth animations
- Schema markup for Google FAQ rich snippets

---

### PAGE 11: Free Resources (/resources)

**Purpose:** Lead magnet page for landlords. Offers free downloadable legal forms, guides, and templates in exchange for email capture. Positions Prospera as the helpful expert — landlords don't have to dig through government websites for forms they need.

**Sections:**

1. **Hero**
   - Headline: "Free Resources for Ontario Landlords"
   - Subtitle: "Every form, template, and guide you need — no government website digging required."
   - Clean, warm background with subtle gold accent

2. **Resource grid (card layout, 3 columns)**
   Each card shows: document icon, title, short description, "Download Free" button.

   **Launch resources:**
   - Ontario Standard Lease Agreement (blank, ready to fill)
   - Lease Addendum Template (Prospera's version — the existing lead magnet)
   - Tenant Screening Checklist (what to verify before signing)
   - Rent Increase Notice Template (N1 form guidance + template)
   - Eviction Notice Templates (N4, N5, N12 — with plain English explanations)
   - Property Inspection Checklist (move-in/move-out form)
   - Landlord Tax Deduction Guide (what you can write off in Ontario)
   - Maintenance Request Form Template
   - Rental Application Template
   - Ontario Landlord Rights Quick Reference (one-pager)

   **Future additions (grow the library over time):**
   - Lease renewal letter template
   - Security deposit reconciliation form
   - Landlord insurance checklist
   - Rental property ROI calculator
   - Tenant communication templates

3. **Email gate (modal popup)**
   - When user clicks "Download Free" on any resource:
   - Modal appears: "Enter your email to download instantly"
   - Fields: Name, Email, "I'm a: Landlord / Tenant / Other" dropdown
   - Submit → email stored in Supabase → PDF download link delivered instantly + sent via email (Resend)
   - If user already in database (cookie check), skip the gate and download directly
   - After first download, show a banner: "Welcome back! Download anything, no email needed."

4. **CTA banner at bottom**
   - "Need help with your rental property? We handle everything."
   - Button: "Get a Free Quote" → /contact

**File hosting:** All PDFs stored in Supabase Storage (free tier supports this). PDFs are generated/uploaded by Ebin via Directus admin panel or directly to Supabase.

**SEO value:** Each resource can have its own landing page (/resources/ontario-lease-addendum) with description text, targeting long-tail keywords like "Ontario lease addendum template free download."

**Database integration:**

### Table: resources
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Resource title |
| slug | text | URL slug |
| description | text | Short description |
| category | text | forms / guides / templates / checklists |
| file_url | text | Supabase Storage URL |
| download_count | integer | Track popularity |
| created_at | timestamp | Auto |

### Table: resource_downloads
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| resource_id | uuid | FK to resources |
| subscriber_id | uuid | FK to subscribers |
| downloaded_at | timestamp | Auto |

---

## Lead Capture Strategy

### Newsletter Popups
- **Landlord popup:** appears after 30 seconds or exit-intent on landlord-relevant pages. Offers free lease addendum document (your existing lead magnet). Captures name + email.
- **Tenant popup:** appears on /listings and /tenants pages. Offers early notification of new listings. Captures name + email + preferred city.
- Both stored in Supabase `subscribers` table with type (landlord/tenant) flag.

### Email Lists (Supabase tables)
- `subscribers_landlords` — name, email, source, date
- `subscribers_tenants` — name, email, preferred_city, date
- Property listing alerts → when Ebin publishes a new property, option to email tenant list
- Monthly landlord newsletter → market updates, tips, new blog posts

---

## Database Schema (Supabase)

### Table: properties
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Listing title |
| slug | text | URL slug (auto-generated) |
| address | text | Full address |
| city | text | London / St. Thomas / Strathroy |
| price | integer | Monthly rent |
| bedrooms | integer | Number of bedrooms |
| bathrooms | decimal | Number of bathrooms |
| sqft | integer | Square footage |
| description | text | Full description |
| features | jsonb | Array of features (parking, laundry, pets, etc.) |
| images | jsonb | Array of image URLs (Cloudinary) |
| status | text | available / rented / coming_soon |
| pet_friendly | boolean | Allows pets |
| available_date | date | When available |
| buildium_link | text | Link to Buildium application |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### Table: subscribers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Full name |
| email | text | Email address |
| type | text | landlord / tenant |
| preferred_city | text | For tenants |
| source | text | popup / contact_form / listing_page |
| created_at | timestamp | Auto |

### Table: contact_submissions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Full name |
| email | text | Email |
| phone | text | Phone number |
| type | text | landlord / tenant |
| property_address | text | For landlords |
| message | text | Message |
| created_at | timestamp | Auto |

### Table: rent_estimates
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| city | text | Selected city |
| bedrooms | integer | Bedrooms |
| bathrooms | integer | Bathrooms |
| email | text | Captured email |
| estimated_rent | integer | Calculated estimate |
| created_at | timestamp | Auto |

---

## URGENT: SEO Recovery Plan

**Your old site (prosperaproperties.co) is currently down.** Every day it stays down, Google is de-indexing your pages and you're losing whatever search rankings you had. Your Yelp, Facebook, and Google Business Profile all still link to prosperaproperties.co — those backlinks are hitting dead ends.

### Phase 0: Deploy a Coming Soon Page IMMEDIATELY (Day 1)

Before building anything else, deploy a simple one-page placeholder on your domain. This tells Google the domain is alive and stops de-indexing.

**Claude Code prompt for coming soon page:**
```
Build a beautiful "coming soon" landing page for Prospera Properties.

- Warm cream background (#FAF8F5), navy text (#0A1628), gold accents (#C5A55A)
- Cormorant Garamond headline, DM Sans body text
- Prospera Properties logo centered at top
- Headline: "Something Beautiful Is Coming"
- Subtitle: "Prospera Properties is launching a brand new experience for landlords and tenants in London, St. Thomas, and Strathroy, Ontario."
- Email capture form: "Be the first to know when we launch" — name + email → Supabase
- Phone number: (519) 697-1227
- Social links (Facebook, YouTube)
- Subtle background animation (floating gold particles or gentle gradient shift)
- Mobile responsive
- Meta tags for SEO: title, description, Open Graph

Deploy to Vercel, connect to prosperaproperties.co domain.
```

**This does three things at once:**
1. Stops Google from de-indexing your domain
2. Starts collecting emails before your site even launches
3. Tells anyone who finds your Yelp/Facebook/Google Business that you're active and coming back

### SEO Preservation Checklist:
- [ ] Deploy coming soon page on prosperaproperties.co within 24 hours
- [ ] Verify domain ownership in Google Search Console
- [ ] Submit sitemap once the full site launches
- [ ] Set up 301 redirects from old WordPress URLs to new Next.js URLs (if any old blog posts were indexed)
- [ ] Update Google Business Profile link once new site is live
- [ ] Claim your Yelp listing and update it

---

## Build Order (Phases)

### Phase 0: Coming Soon + SEO Recovery (Day 1 — DO THIS FIRST)
- [ ] Create Vercel account and connect GitHub
- [ ] Create Supabase project
- [ ] Build and deploy coming soon page on prosperaproperties.co
- [ ] Set up Google Search Console for domain
- [ ] Start collecting pre-launch emails

### Phase 1: Foundation (Week 1)
- [ ] Initialize Next.js project with App Router
- [ ] Set up Vercel deployment from GitHub
- [ ] Configure Supabase project (database + auth)
- [ ] Set up Cloudinary account
- [ ] Install dependencies (Framer Motion, Tailwind CSS, etc.)
- [ ] Build design system: colors, typography, base components
- [ ] Build Navbar + Footer
- [ ] Build Homepage (all sections)
- [ ] Connect custom domain

### Phase 2: Core Pages (Week 2)
- [ ] Build /landlords page (full Belong-inspired layout)
- [ ] Build /tenants page
- [ ] Build /pricing page with comparison table
- [ ] Build /about page
- [ ] Build /contact page with forms → Supabase
- [ ] Set up Resend for form notification emails

### Phase 3: Listings System (Week 3)
- [ ] Create properties table in Supabase
- [ ] Build /listings page with filters and property cards
- [ ] Build /listings/[slug] individual property pages
- [ ] Set up Directus on Hostinger (admin panel)
- [ ] Connect Directus → Supabase for property management
- [ ] Test upload workflow: Directus → database → frontend

### Phase 4: Blog & SEO (Week 4)
- [ ] Build /blog listing page
- [ ] Build /blog/[slug] post pages with markdown rendering
- [ ] Build city landing pages (/areas/london, /areas/st-thomas, /areas/strathroy)
- [ ] Build /faq page
- [ ] Set up sitemap.xml and robots.txt
- [ ] Add meta tags, Open Graph, JSON-LD schema markup
- [ ] Write first 5 blog posts (or set up agent)

### Phase 5: Lead Capture & Resources (Week 4-5)
- [ ] Build newsletter popup components (landlord + tenant variants)
- [ ] Build rent estimator tool
- [ ] Build /resources page with email-gated PDF downloads
- [ ] Upload initial resource PDFs to Supabase Storage
- [ ] Set up subscriber tables in Supabase
- [ ] Connect Resend for new listing email blasts
- [ ] Connect Resend for resource download delivery emails
- [ ] Test full lead capture → email notification flow

### Phase 6: Polish & Launch
- [ ] Performance optimization (Lighthouse 90+ score)
- [ ] Mobile responsiveness testing (every page)
- [ ] Cross-browser testing
- [ ] 404 page design
- [ ] Loading states and error handling
- [ ] Final copy review
- [ ] Launch

---

## Claude Code Prompting Strategy

When working with Claude Code, feed it one page at a time. Here's how to structure your prompts:

### Prompt template:
```
I'm building the [PAGE NAME] page for Prospera Properties, a property management company in Ontario, Canada.

Reference site: belonghome.com/[relevant page]

Tech stack: Next.js (App Router), Tailwind CSS, Framer Motion, Supabase

Design: LIGHT WARM THEME. Navy (#0A1628) and gold (#C5A55A) palette on warm white (#FAF8F5) and cream (#F5F0EB) backgrounds. Serif headlines (Cormorant Garamond), clean sans-serif body text (DM Sans or Outfit). Luxury but warm and inviting — NOT dark, NOT cold, NOT corporate. Think high-end boutique real estate. Smooth scroll animations.

This page needs the following sections:
1. [Section 1 description]
2. [Section 2 description]
3. [Section 3 description]
...

Make it visually stunning with scroll-triggered animations, smooth transitions, and micro-interactions. Performance should be flawless.
```

### Tips for working with Claude Code:
1. **One page at a time** — don't ask for the whole site at once
2. **Show the reference** — say "look at belonghome.com/homeowners for the layout"
3. **Be specific about animations** — "fade up on scroll", "parallax hero", "counter animation"
4. **Iterate visually** — build the page, review it, then say "make the hero taller" or "add more spacing between sections"
5. **Components first** — build the Navbar, Footer, and reusable cards before building pages
6. **Mobile first** — always ask Claude Code to make it responsive from the start

---

## Files & Folder Structure

```
prospera-website/
├── app/
│   ├── layout.tsx            # Root layout (navbar, footer, fonts)
│   ├── page.tsx              # Homepage
│   ├── landlords/
│   │   └── page.tsx          # For Landlords page
│   ├── tenants/
│   │   └── page.tsx          # For Tenants page
│   ├── listings/
│   │   ├── page.tsx          # All listings
│   │   └── [slug]/
│   │       └── page.tsx      # Individual property
│   ├── pricing/
│   │   └── page.tsx          # Pricing page
│   ├── about/
│   │   └── page.tsx          # About page
│   ├── contact/
│   │   └── page.tsx          # Contact page
│   ├── blog/
│   │   ├── page.tsx          # Blog listing
│   │   └── [slug]/
│   │       └── page.tsx      # Individual blog post
│   ├── areas/
│   │   ├── london/
│   │   │   └── page.tsx
│   │   ├── st-thomas/
│   │   │   └── page.tsx
│   │   └── strathroy/
│   │       └── page.tsx
│   └── faq/
│       └── page.tsx          # FAQ page
│   └── resources/
│       ├── page.tsx          # Free resources listing
│       └── [slug]/
│           └── page.tsx      # Individual resource landing page
├── components/
│   ├── ui/                   # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── FeatureCards.tsx
│   │   ├── ProcessStepper.tsx
│   │   ├── TestimonialCarousel.tsx
│   │   ├── PricingTable.tsx
│   │   ├── StatsBar.tsx
│   │   ├── CTABanner.tsx
│   │   └── FAQAccordion.tsx
│   ├── listings/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGrid.tsx
│   │   ├── FilterBar.tsx
│   │   └── PropertyGallery.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   └── BlogGrid.tsx
│   ├── forms/
│   │   ├── ContactForm.tsx
│   │   ├── NewsletterPopup.tsx
│   │   └── RentEstimator.tsx
│   └── animations/
│       ├── FadeIn.tsx
│       ├── CounterAnimation.tsx
│       └── ParallaxWrapper.tsx
├── content/
│   └── blog/                 # Markdown blog posts
│       ├── ontario-landlord-guide.md
│       └── ...
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── resend.ts             # Email client
│   └── utils.ts              # Helpers
├── public/
│   ├── images/
│   └── fonts/
├── styles/
│   └── globals.css           # Tailwind + custom CSS
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Summary

This plan gives you a visually stunning, fast, SEO-optimized property management website that:

1. **Looks like a $100K build** but costs $0/month to run
2. **Captures leads** from both landlords and tenants
3. **Ranks on Google** for local property management keywords
4. **Lets you manage listings** without touching code
5. **Sends automated emails** when new properties go live
6. **Tells your story** in a way that builds trust
7. **Scales with you** as Prospera grows

Everything in this plan can be built by Claude Code. No developers needed.
