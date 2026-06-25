-- Tenant move-in onboarding sessions
CREATE TABLE IF NOT EXISTS tenant_onboarding_sessions (
  id                          uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Tenant & property info
  tenant_name                 text NOT NULL,
  tenant_email                text,
  tenant_phone                text,
  property_address            text NOT NULL,
  property_id                 text,           -- Notion property ID
  unit                        text,
  move_in_date                date,
  lease_start                 date NOT NULL,
  lease_end                   date,
  monthly_rent                numeric,

  -- Phase 1 — Pre-move-in (booleans)
  application_approved        boolean DEFAULT false,
  credit_check_done           boolean DEFAULT false,
  references_checked          boolean DEFAULT false,
  lease_prepared              boolean DEFAULT false,
  tenant_signed_at            timestamptz,
  owner_signed_at             timestamptz,
  lease_storage_path          text,
  first_month_collected       boolean DEFAULT false,
  first_month_amount          numeric,
  last_month_collected        boolean DEFAULT false,
  last_month_amount           numeric,
  security_deposit_collected  boolean DEFAULT false,
  security_deposit_amount     numeric,
  post_dated_cheques          boolean DEFAULT false,

  -- Phase 2 — Move-in day
  inspection_done             boolean DEFAULT false,
  inspection_photos           text[]   DEFAULT '{}',
  inspection_signed_at        timestamptz,
  keys_handed                 boolean DEFAULT false,
  keys_count                  int,
  access_codes                text,
  parking_spot                text,
  mailbox_key                 boolean DEFAULT false,
  welcome_package             boolean DEFAULT false,

  -- Phase 3 — System setup (automated)
  notion_tenant_id            text,
  rent_tracker_created        boolean DEFAULT false,
  portal_token                text,

  -- Phase 4 — Communication (automated)
  welcome_email_sent_at       timestamptz,
  checkin_scheduled           boolean DEFAULT false,

  -- Meta
  notes                       text,
  status                      text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'complete')),
  created_at                  timestamptz DEFAULT now(),
  completed_at                timestamptz
);

CREATE INDEX IF NOT EXISTS tenant_onboarding_status_idx ON tenant_onboarding_sessions(status, created_at DESC);

ALTER TABLE tenant_onboarding_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON tenant_onboarding_sessions FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for move-in inspection photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-inspection',
  'tenant-inspection',
  false,
  52428800,
  ARRAY['image/jpeg','image/png','image/webp','image/heic']
)
ON CONFLICT (id) DO NOTHING;
