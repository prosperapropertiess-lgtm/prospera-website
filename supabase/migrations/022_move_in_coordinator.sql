-- Move-In Coordinator — extends the existing leasing module instead of
-- building a second, disconnected property/tenant system. Everything here
-- hangs off leasing_properties(id) (the existing tenant-placement
-- "campaign"), which already carries owner_name/owner_email and links to
-- an approved leasing_applications row for tenant info.

create table if not exists move_in_sessions (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references leasing_properties(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  application_id uuid references leasing_applications(id) on delete set null,
  inspector_name text,
  move_in_date date,
  status text not null default 'draft' check (status in ('draft', 'awaiting_signatures', 'completed')),
  report_version integer not null default 1,
  meter_readings jsonb not null default '[]'::jsonb,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists move_in_sessions_campaign_idx on move_in_sessions(campaign_id);

create table if not exists move_in_rooms (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references move_in_sessions(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists move_in_rooms_session_idx on move_in_rooms(session_id);

create table if not exists move_in_items (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references move_in_rooms(id) on delete cascade,
  label text not null,
  condition text not null default 'not_inspected'
    check (condition in ('good', 'existing_damage', 'needs_attention', 'not_inspected', 'not_applicable')),
  notes text,
  repair_needed boolean not null default false,
  photos jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists move_in_items_room_idx on move_in_items(room_id);

create table if not exists move_in_appliances (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references move_in_sessions(id) on delete cascade,
  name text not null,
  location text,
  cosmetic_condition text not null default 'good'
    check (cosmetic_condition in ('good', 'existing_damage', 'needs_attention', 'not_inspected', 'not_applicable')),
  test_status text not null default 'not_tested' check (test_status in ('working', 'issue', 'not_tested')),
  brand text,
  model text,
  serial_number text,
  photos jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists move_in_appliances_session_idx on move_in_appliances(session_id);

create table if not exists move_in_keys (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references move_in_sessions(id) on delete cascade,
  item_name text not null,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists move_in_keys_session_idx on move_in_keys(session_id);

-- One per physical property, not per move-in — reused across tenancies.
create table if not exists property_welcome_guides (
  property_id uuid primary key references properties(id) on delete cascade,
  garbage_instructions text,
  parking_details text,
  mailbox_details text,
  utility_info text,
  appliance_instructions text,
  maintenance_contact text,
  emergency_contact text,
  other_notes text,
  internal_notes text, -- explicitly never included in shared PDFs/emails
  attachments jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists move_in_signatures (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references move_in_sessions(id) on delete cascade,
  report_version integer not null,
  signer_name text not null,
  signer_role text not null check (signer_role in ('tenant', 'inspector')),
  signature_data text not null,
  signed_at timestamptz not null default now()
);
create index if not exists move_in_signatures_session_idx on move_in_signatures(session_id);

create table if not exists move_in_documents (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references move_in_sessions(id) on delete cascade,
  doc_type text not null check (doc_type in ('inspection_report', 'welcome_guide')),
  report_version integer not null,
  file_url text not null,
  file_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists move_in_documents_session_idx on move_in_documents(session_id);

-- Per-recipient send tracking so "Finish & Send" and retries are idempotent
-- — never re-send to a recipient already marked 'sent'.
create table if not exists move_in_email_log (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references move_in_sessions(id) on delete cascade,
  recipient_email text not null,
  recipient_role text not null check (recipient_role in ('tenant', 'owner')),
  email_type text not null check (email_type in ('inspection_report', 'welcome_guide')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, recipient_email, email_type)
);

create table if not exists move_in_review_requests (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references move_in_sessions(id) on delete cascade,
  send_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'cancelled')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists move_in_review_requests_pending_idx on move_in_review_requests(send_at) where status = 'scheduled';

-- Single-row site-wide config for the review-request link/message.
create table if not exists move_in_review_settings (
  id integer primary key default 1,
  google_review_link text,
  message_template text,
  follow_up_delay_days integer not null default 3,
  constraint move_in_review_settings_single_row check (id = 1)
);
insert into move_in_review_settings (id) values (1) on conflict (id) do nothing;
