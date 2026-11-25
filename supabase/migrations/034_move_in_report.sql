-- Move-in report: web report links for owner + tenant, room-level photos
-- from the rapid camera, and the tenant's 7-day comment window.

-- Rapid-camera shots taken without picking an item land on the room.
alter table move_in_rooms add column if not exists photos jsonb not null default '[]'::jsonb;

-- Two separate links so only the tenant link can add comments.
alter table move_in_sessions add column if not exists owner_token uuid not null default gen_random_uuid();
alter table move_in_sessions add column if not exists tenant_token uuid not null default gen_random_uuid();
alter table move_in_sessions add column if not exists comments_close_at timestamptz;
alter table move_in_sessions add column if not exists notion_linked_at timestamptz;
create unique index if not exists move_in_sessions_owner_token_idx on move_in_sessions(owner_token);
create unique index if not exists move_in_sessions_tenant_token_idx on move_in_sessions(tenant_token);

create table if not exists move_in_report_comments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references move_in_sessions(id) on delete cascade,
  item_id uuid references move_in_items(id) on delete set null,
  -- Copied at write time so the comment still reads right if the item is edited later.
  room_name text,
  item_label text,
  author_name text,
  body text not null,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists move_in_report_comments_session_idx on move_in_report_comments(session_id);
alter table move_in_report_comments enable row level security;
