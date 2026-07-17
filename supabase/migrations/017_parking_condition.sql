-- 017_parking_condition.sql
-- Adds parking and condition fields to onboarding_sessions for the market comp report

ALTER TABLE onboarding_sessions
  ADD COLUMN IF NOT EXISTS parking_spots     integer,
  ADD COLUMN IF NOT EXISTS parking_type      text,
  ADD COLUMN IF NOT EXISTS property_condition text;
