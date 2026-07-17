-- Add geocoordinates to onboarding_sessions
-- Captured from Google Maps Places autocomplete when admin enters property address
ALTER TABLE onboarding_sessions
  ADD COLUMN IF NOT EXISTS property_lat  double precision,
  ADD COLUMN IF NOT EXISTS property_lng  double precision;
