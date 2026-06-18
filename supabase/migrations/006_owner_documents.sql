-- Create storage bucket for owner documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'owner-documents',
  'owner-documents',
  false,
  52428800, -- 50MB limit
  array['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

-- Metadata table
create table if not exists owner_documents (
  id uuid primary key default gen_random_uuid(),
  property_id text not null,
  token text not null,
  label text not null,
  category text not null default 'Other'
    check (category in ('Lease Agreement', 'Inspection Report', 'Notice', 'Statement', 'Other')),
  storage_path text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  uploaded_at timestamptz not null default now()
);

create index owner_documents_property_id_idx on owner_documents(property_id);
create index owner_documents_token_idx on owner_documents(token);
create index owner_documents_uploaded_at_idx on owner_documents(uploaded_at desc);

alter table owner_documents enable row level security;
create policy "Service role full access" on owner_documents
  for all using (true) with check (true);
