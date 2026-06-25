-- 012_property_expanded.sql
-- Expands the properties table for the full property wizard + tenant listing page rebuild.
-- All new columns are nullable with sensible defaults for backward compatibility.

-- ============================================================
-- DRAFT / PUBLISH WORKFLOW
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'
  CHECK (status IN ('draft','published','archived'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Backfill: existing published properties get published_at = created_at
UPDATE properties SET published_at = created_at WHERE status = 'published' AND published_at IS NULL;

-- ============================================================
-- STEP 1: BASICS (expanded)
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type text
  CHECK (property_type IN ('apartment','house','condo','townhouse','duplex','triplex','other'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS available_date date;

-- ============================================================
-- STEP 2: LEASE & MOVE-IN
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lease_term text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deposit numeric;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS first_month_required boolean DEFAULT true;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_month_required boolean DEFAULT true;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS move_in_costs jsonb DEFAULT '{}';

-- ============================================================
-- STEP 3: FEATURES & AMENITIES
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_type text
  CHECK (parking_type IN ('none','street','driveway','garage','underground','lot'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS laundry_type text
  CHECK (laundry_type IN ('none','in-unit','shared','coin-op'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ac boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS heating_type text
  CHECK (heating_type IN ('gas','electric','baseboard','radiator','forced-air','heat-pump'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS appliances text[] DEFAULT '{}';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS outdoor_space text
  CHECK (outdoor_space IN ('none','balcony','patio','yard','rooftop','deck'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furnished boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS storage boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS elevator boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS wheelchair_accessible boolean DEFAULT false;

-- ============================================================
-- STEP 4: POLICIES
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pet_policy jsonb DEFAULT '{}';
-- pet_policy shape: {cats: bool, dogs: bool, other: bool, deposit: number, restrictions: string}
ALTER TABLE properties ADD COLUMN IF NOT EXISTS smoking_allowed boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS guest_policy text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS quiet_hours text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS max_occupants integer;

-- ============================================================
-- STEP 5: UTILITIES (expanded)
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS utilities_detail jsonb DEFAULT '{}';
-- utilities_detail shape: {heat: {included: bool, avg_cost: number}, water: {...}, hydro: {...}, internet: {...}, gas: {...}}

-- ============================================================
-- STEP 6: NEIGHBOURHOOD & LOCATION
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS neighbourhood_data jsonb DEFAULT '{}';
-- neighbourhood_data shape: {grocery: [{name, address, distance, walk_time, rating, place_id}], pharmacy: [...], ...}
ALTER TABLE properties ADD COLUMN IF NOT EXISTS walk_score integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS transit_score integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bike_score integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bus_routes jsonb DEFAULT '[]';
-- bus_routes shape: [{route: "10", stop_name: "Main & King", frequency: "every 15 min", walk_time: "2 min"}]
ALTER TABLE properties ADD COLUMN IF NOT EXISTS neighbourhood_vibe text;

-- ============================================================
-- STEP 7: PHOTOS & MEDIA (expanded)
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS photo_labels jsonb DEFAULT '[]';
-- photo_labels shape: [{url: string, label: "kitchen"|"bedroom"|"bathroom"|"living"|"exterior"|"other", sort_order: number}]
ALTER TABLE properties ADD COLUMN IF NOT EXISTS virtual_tour_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_plan_url text;

-- ============================================================
-- STEP 8: AI-GENERATED CONTENT
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ai_highlights text[] DEFAULT '{}';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS life_simulation jsonb DEFAULT '{}';
-- life_simulation shape: {morning: string, afternoon: string, evening: string, night: string}
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ai_life_intro text;

-- ============================================================
-- TRANSPARENCY / RISK REMOVAL
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS transparency jsonb DEFAULT '{}';
-- transparency shape: {heating_reliability: string, internet_providers: string[], pest_control: string, maintenance_response: string, snow_removal: string, parking_enforcement: string, noise_notes: string, garbage_schedule: string}

-- ============================================================
-- WIZARD PROGRESS
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS wizard_step integer DEFAULT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_saved_at timestamptz DEFAULT now();

-- ============================================================
-- NEIGHBOURHOOD CACHE TABLE
-- Shared across properties in the same area. 30-day TTL.
-- ============================================================
CREATE TABLE IF NOT EXISTS neighbourhood_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lat_key double precision NOT NULL,
  lng_key double precision NOT NULL,
  category text NOT NULL,
  data jsonb NOT NULL,
  fetched_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  UNIQUE (lat_key, lng_key, category)
);

CREATE INDEX IF NOT EXISTS idx_neighbourhood_cache_location
  ON neighbourhood_cache (lat_key, lng_key);
CREATE INDEX IF NOT EXISTS idx_neighbourhood_cache_expires
  ON neighbourhood_cache (expires_at);

-- ============================================================
-- INDEXES on properties for common queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_city_status ON properties (city, status);
