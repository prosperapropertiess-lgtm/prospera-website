-- Add cached rent insights column to onboarding_sessions
ALTER TABLE onboarding_sessions
  ADD COLUMN IF NOT EXISTS rent_insights jsonb;
