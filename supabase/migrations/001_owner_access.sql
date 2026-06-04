-- Owner dashboard tables (no auth — token in URL is the access key)
-- Run this in: https://supabase.com/dashboard/project/hwaroazxbzgmjjasgtdb/sql/new

create table if not exists owner_access (
  id               uuid default gen_random_uuid() primary key,
  token            text unique not null,        -- secret URL slug, e.g. "randt-k9mp2xyz..."
  notion_owner_ids text[] not null,             -- Notion owner page IDs
  owner_names      text not null,               -- "Randy & Tina"
  created_at       timestamptz default now(),
  last_accessed    timestamptz
);

create table if not exists owner_data_cache (
  token       text primary key references owner_access(token) on delete cascade,
  bundle_json jsonb not null,
  cached_at   timestamptz default now()
);
