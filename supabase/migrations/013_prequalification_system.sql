-- 013_prequalification_system.sql
-- Adds pre-qualification flow, ideal tenant profiles, marketplace descriptions, and sharing support.

-- ============================================================
-- IDEAL TENANT + MARKETPLACE on properties
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ideal_tenant_profile text[] DEFAULT '{}';
-- e.g. ['young_professional', 'couple', 'small_family']
ALTER TABLE properties ADD COLUMN IF NOT EXISTS marketplace_description text;
-- Plain-text listing for Kijiji / Facebook Marketplace, auto-generated on publish

-- ============================================================
-- PRE-QUALIFICATIONS TABLE
-- Tenants must pre-qualify before booking a viewing.
-- ============================================================
CREATE TABLE IF NOT EXISTS prequalifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL,
  -- Contact
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  -- Qualification
  current_city text,
  move_in_date date,
  monthly_income numeric,
  employment_status text CHECK (employment_status IN ('employed','self-employed','student','retired','other')),
  employer_name text,
  num_occupants integer DEFAULT 1,
  has_pets boolean DEFAULT false,
  pet_details text,
  has_references boolean DEFAULT false,
  credit_score_range text CHECK (credit_score_range IN ('excellent','good','fair','poor','unknown')),
  additional_notes text,
  -- Outcome
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at timestamptz,
  reviewed_by text,
  rejection_reason text,
  -- Viewing
  viewing_requested boolean DEFAULT false,
  viewing_date timestamptz,
  viewing_confirmed boolean DEFAULT false,
  -- Tracking
  created_at timestamptz DEFAULT now(),
  source text DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS idx_prequalifications_property ON prequalifications (property_id);
CREATE INDEX IF NOT EXISTS idx_prequalifications_email ON prequalifications (email);
CREATE INDEX IF NOT EXISTS idx_prequalifications_status ON prequalifications (status, created_at DESC);
