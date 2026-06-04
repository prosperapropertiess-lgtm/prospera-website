-- Landlord onboarding pipeline sessions
-- Each row = one onboarding in progress

create table if not exists onboarding_sessions (
  id                  uuid default gen_random_uuid() primary key,
  token               text unique not null,
  current_step        int default 2,
  status              text default 'in_progress' check (status in ('in_progress', 'complete', 'abandoned')),

  -- Step 2: owner basic info
  owner_name          text,
  owner_email         text,
  owner_phone         text,
  step2_completed_at  timestamptz,

  -- Step 3: property details
  property_address    text,
  property_city       text,
  property_type       text,
  num_units           int,
  approx_monthly_rent numeric,
  fee_structure       text,
  fee_amount          numeric,
  property_notes      text,
  drive_folder_url    text,
  step3_completed_at  timestamptz,

  -- Step 4: lease + owner details form
  lease_storage_path  text,
  lease_parsed_data   jsonb,
  details             jsonb,
  step4_completed_at  timestamptz,

  -- Step 5: management agreement
  agreement_signed_at timestamptz,
  agreement_ip        text,
  agreement_name      text,

  -- Steps 6–9: checklists stored as jsonb blobs
  step6_data          jsonb,
  step7_data          jsonb,
  step8_completed_at  timestamptz,
  step9_data          jsonb,

  -- Notion IDs created during onboarding
  notion_owner_id     text,
  notion_property_id  text,

  -- Final dashboard
  owner_access_token  text,
  completed_at        timestamptz,

  created_at          timestamptz default now()
);

-- Index for token lookups (every page load uses this)
create unique index if not exists onboarding_sessions_token_idx on onboarding_sessions (token);

-- Index for status filtering (session list page)
create index if not exists onboarding_sessions_status_idx on onboarding_sessions (status, created_at desc);
