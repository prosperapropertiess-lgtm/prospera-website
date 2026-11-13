-- Applied via MCP 2026-11-13. One-click personalized application invites, and the steps
-- after an application: owner conditional approval, first month's rent by e-transfer, SingleKey, move-in.
create table if not exists public.application_invites (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  viewing_request_id uuid references public.viewing_requests(id) on delete set null,
  appointment_id uuid references public.fo_appointments(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  sent_by text not null,
  sender_name text,
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  application_id uuid references public.applications(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists application_invites_email on public.application_invites (lower(email), property_id);
alter table public.application_invites enable row level security;

alter table public.applications
  add column if not exists invite_id uuid references public.application_invites(id) on delete set null,
  add column if not exists viewing_request_id uuid references public.viewing_requests(id) on delete set null,
  add column if not exists doc_option text check (doc_option in ('bank','stubs')),
  add column if not exists stage text not null default 'review'
    check (stage in ('review','sent_to_owner','owner_approved','owner_declined','rent_requested','rent_received','screened','move_in','declined')),
  add column if not exists owner_name text,
  add column if not exists owner_email text,
  add column if not exists owner_sent_at timestamptz,
  add column if not exists owner_decided_at timestamptz,
  add column if not exists owner_note text,
  add column if not exists rent_amount_due numeric,
  add column if not exists rent_reference text,
  add column if not exists rent_etransfer_to text,
  add column if not exists rent_requested_at timestamptz,
  add column if not exists rent_received_at timestamptz,
  add column if not exists singlekey_path text,
  add column if not exists singlekey_done_at timestamptz,
  add column if not exists move_in_started_at timestamptz;
