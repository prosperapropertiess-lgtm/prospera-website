-- Property messages: activity feed between Ebin and property owners
create table if not exists property_messages (
  id uuid primary key default gen_random_uuid(),
  property_id text not null,          -- Notion property ID
  token text not null,                -- owner access token
  author text not null check (author in ('ebin', 'owner')),
  author_name text not null,
  content text not null,
  message_type text not null default 'update'
    check (message_type in ('update', 'maintenance', 'tenant_note', 'general')),
  created_at timestamptz not null default now()
);

create index property_messages_property_id_idx on property_messages(property_id);
create index property_messages_token_idx on property_messages(token);
create index property_messages_created_at_idx on property_messages(created_at desc);

alter table property_messages enable row level security;

-- Service role has full access (all server-side calls use service role)
create policy "Service role full access" on property_messages
  for all using (true) with check (true);
