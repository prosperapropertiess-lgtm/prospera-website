-- Tenant portal tables
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/hwaroazxbzgmjjasgtdb/sql/new

-- Token access (one row per tenant)
create table if not exists tenant_access (
  id               uuid default gen_random_uuid() primary key,
  token            text unique not null,
  notion_tenant_id text not null,
  tenant_name      text not null,
  property_id      text not null,   -- Notion property ID
  created_at       timestamptz default now()
);

-- Documents uploaded by Ebin for tenants
create table if not exists tenant_documents (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    text not null,        -- Notion tenant ID
  property_id  text not null,
  token        text not null,
  label        text not null,
  category     text not null default 'Other'
    check (category in ('Lease Agreement', 'Inspection Report', 'Notice', 'Receipt', 'Other')),
  storage_path text not null,
  file_name    text not null,
  file_size    bigint,
  mime_type    text,
  uploaded_at  timestamptz not null default now()
);

create index tenant_documents_tenant_id_idx on tenant_documents(tenant_id);
create index tenant_documents_token_idx on tenant_documents(token);

alter table tenant_documents enable row level security;
create policy "Service role full access" on tenant_documents for all using (true) with check (true);

-- Maintenance requests
create table if not exists tenant_maintenance_requests (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             text not null,
  property_id           text not null,
  token                 text not null,
  category              text not null,
  description           text not null,
  troubleshooting_steps text not null default '[]',
  ai_diagnosis          text not null default '',
  status                text not null default 'submitted'
    check (status in ('submitted', 'acknowledged', 'scheduled', 'resolved')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index tenant_maintenance_token_idx on tenant_maintenance_requests(token);
create index tenant_maintenance_status_idx on tenant_maintenance_requests(status);

alter table tenant_maintenance_requests enable row level security;
create policy "Service role full access" on tenant_maintenance_requests for all using (true) with check (true);

-- Messages (tenant <-> AI <-> Ebin)
create table if not exists tenant_messages (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   text not null,
  token       text not null,
  author      text not null check (author in ('tenant', 'ai', 'ebin')),
  author_name text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index tenant_messages_token_idx on tenant_messages(token);
create index tenant_messages_created_at_idx on tenant_messages(created_at desc);

alter table tenant_messages enable row level security;
create policy "Service role full access" on tenant_messages for all using (true) with check (true);

-- Home guide content (per property, managed by Ebin)
create table if not exists property_home_guide (
  id          uuid primary key default gen_random_uuid(),
  property_id text not null,
  section     text not null,
  title       text not null,
  content     text not null default '',
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now(),
  unique (property_id, section)
);

create index property_home_guide_property_idx on property_home_guide(property_id);

alter table property_home_guide enable row level security;
create policy "Service role full access" on property_home_guide for all using (true) with check (true);

-- Schedule & reminders (per property, managed by Ebin)
create table if not exists property_schedule (
  id          uuid primary key default gen_random_uuid(),
  property_id text not null,
  event_type  text not null default 'other'
    check (event_type in ('inspection', 'maintenance', 'reminder', 'garbage', 'other')),
  title       text not null,
  description text,
  event_date  date,
  recurring   text,
  created_at  timestamptz not null default now()
);

create index property_schedule_property_idx on property_schedule(property_id);
create index property_schedule_date_idx on property_schedule(event_date asc);

alter table property_schedule enable row level security;
create policy "Service role full access" on property_schedule for all using (true) with check (true);

-- Storage bucket for tenant documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-documents',
  'tenant-documents',
  false,
  52428800,
  array['application/pdf','image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;
