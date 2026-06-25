-- 014_scoring_viewings_matching.sql
-- Adds tenant scoring, viewing management, and matching infrastructure.

-- ============================================================
-- SCORING on prequalifications
-- ============================================================
ALTER TABLE prequalifications ADD COLUMN IF NOT EXISTS score integer DEFAULT 0;
ALTER TABLE prequalifications ADD COLUMN IF NOT EXISTS score_breakdown jsonb DEFAULT '{}';
-- score_breakdown: {movein_match: 20, income_ratio: 25, docs_ready: 20, refs: 15, pets_ok: 10, occupants_ok: 10}

-- Extra fields for scoring
ALTER TABLE prequalifications ADD COLUMN IF NOT EXISTS rent_ok boolean;
ALTER TABLE prequalifications ADD COLUMN IF NOT EXISTS docs_agreed boolean DEFAULT false;
ALTER TABLE prequalifications ADD COLUMN IF NOT EXISTS late_movein boolean DEFAULT false;
ALTER TABLE prequalifications ADD COLUMN IF NOT EXISTS outcome text CHECK (outcome IN ('qualified','waitlist','disqualified'));

-- ============================================================
-- VIEWINGS TABLE
-- Tracks scheduled viewings with automated email sequence state.
-- ============================================================
CREATE TABLE IF NOT EXISTS viewings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL,
  prequalification_id uuid REFERENCES prequalifications(id),
  -- Tenant info
  tenant_name text NOT NULL,
  tenant_email text NOT NULL,
  tenant_phone text,
  -- Scheduling
  viewing_date timestamptz NOT NULL,
  viewing_duration integer DEFAULT 30, -- minutes
  viewing_notes text,
  -- Status
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','completed','no_show','cancelled','rescheduled')),
  -- Automated sequence tracking
  confirmation_sent_at timestamptz,
  reminder_24h_sent_at timestamptz,
  reminder_1h_sent_at timestamptz,
  followup_sent_at timestamptz,
  nudge_48h_sent_at timestamptz,
  -- Post-viewing
  tenant_interested boolean,
  tenant_feedback text,
  -- Meta
  created_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  cancel_reason text
);

CREATE INDEX IF NOT EXISTS idx_viewings_property ON viewings (property_id);
CREATE INDEX IF NOT EXISTS idx_viewings_date ON viewings (viewing_date);
CREATE INDEX IF NOT EXISTS idx_viewings_status ON viewings (status);
CREATE INDEX IF NOT EXISTS idx_viewings_email_sequence ON viewings (status, viewing_date)
  WHERE status = 'confirmed';

-- ============================================================
-- INQUIRY COUNT TRACKING (for social proof)
-- ============================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS inquiry_count integer DEFAULT 0;
-- Incremented each time a prequalification is submitted for this property.

-- ============================================================
-- TENANT MATCH TRACKING
-- Records which tenants were notified about new properties.
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_match_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL,
  prequalification_id uuid NOT NULL,
  tenant_email text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  clicked boolean DEFAULT false,
  clicked_at timestamptz,
  UNIQUE (property_id, tenant_email)
);

CREATE INDEX IF NOT EXISTS idx_tenant_match_property ON tenant_match_notifications (property_id);
