-- Agent-entered notes on what the owner can do before listing
-- Free text, entered during admin onboard. Null = nothing for owner to do.
ALTER TABLE onboarding_sessions
  ADD COLUMN IF NOT EXISTS owner_action_items text;
