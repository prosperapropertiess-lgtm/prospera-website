-- 015_market_comp_fields.sql
-- Adds market comparable fields to onboarding_sessions for the market comp report page

ALTER TABLE onboarding_sessions
  ADD COLUMN IF NOT EXISTS bedrooms        integer,
  ADD COLUMN IF NOT EXISTS bathrooms       integer,
  ADD COLUMN IF NOT EXISTS rent_low        numeric,
  ADD COLUMN IF NOT EXISTS rent_market     numeric,
  ADD COLUMN IF NOT EXISTS rent_premium    numeric,
  ADD COLUMN IF NOT EXISTS comparables     jsonb DEFAULT '[]';
