-- FieldOps: showing specialists, availability, self-booked viewings, the
-- showing checklist, pay ledger and message log. The appointments table is
-- the one source of truth for who shows what, when.

create extension if not exists btree_gist;

-- Specialists reuse the existing agents table and agent_sessions login.
alter table agents
  add column if not exists phone text,
  add column if not exists role text not null default 'agent' check (role in ('agent', 'specialist')),
  add column if not exists home_area text,
  add column if not exists invite_token_hash text,
  add column if not exists invited_at timestamptz,
  add column if not exists activated_at timestamptz,
  add column if not exists showing_fee numeric,           -- null = use the default in fo_settings
  add column if not exists max_per_day int not null default 8,
  add column if not exists notes text;
alter table agents alter column password_hash drop not null;

create table if not exists fo_settings (
  id int primary key default 1 check (id = 1),
  pay_basis text not null default 'household' check (pay_basis in ('household', 'visit')),
  showing_fee numeric not null default 25,
  bonus_enabled boolean not null default false,   -- off until legal review approves it
  bonus_pct numeric not null default 10,
  reminder_hours int[] not null default '{24,2}',
  booking_link_days int not null default 7,
  weight_batch int not null default 40,
  weight_fair int not null default 30,
  weight_reliable int not null default 20,
  weight_travel int not null default 10,
  updated_at timestamptz not null default now()
);
insert into fo_settings (id) values (1) on conflict do nothing;

create table if not exists fo_availability_rules (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),        -- 0 = Sunday
  start_min int not null check (start_min between 0 and 1439),
  end_min int not null check (end_min between 1 and 1440 and end_min > start_min),
  created_at timestamptz not null default now()
);
create index if not exists fo_availability_rules_agent on fo_availability_rules(agent_id);

create table if not exists fo_availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('off', 'extra')),
  start_min int not null default 0,
  end_min int not null default 1440 check (end_min > start_min),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists fo_availability_exceptions_agent_day on fo_availability_exceptions(agent_id, day);

create table if not exists fo_property_rules (
  property_id uuid primary key references properties(id) on delete cascade,
  booking_enabled boolean not null default false,
  duration_min int not null default 20 check (duration_min between 10 and 120),
  travel_buffer_min int not null default 20 check (travel_buffer_min between 0 and 180),
  min_notice_hours int not null default 12,
  horizon_days int not null default 14 check (horizon_days between 1 and 60),
  max_per_slot int not null default 1 check (max_per_slot between 1 and 10),
  -- [{ "weekday": 0-6, "start_min": 540, "end_min": 1200 }]; empty = every day 9am–8pm
  windows jsonb not null default '[]',
  occupied boolean not null default false,
  access_instructions text,      -- lockbox/keys: shown to the assigned specialist only
  highlights text,               -- talking points for the specialist
  updated_at timestamptz not null default now()
);

create table if not exists fo_blackouts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists fo_blackouts_property on fo_blackouts(property_id, starts_at);

create table if not exists fo_booking_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  viewing_request_id uuid references viewing_requests(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  tenant_name text not null,
  tenant_phone text,
  tenant_email text,
  expires_at timestamptz not null,
  views int not null default 0,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists fo_booking_tokens_request on fo_booking_tokens(viewing_request_id);

create table if not exists fo_appointments (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  agent_id uuid references agents(id),
  booking_token_id uuid references fo_booking_tokens(id),
  viewing_request_id uuid references viewing_requests(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  status text not null default 'confirmed' check (status in
    ('confirmed', 'in_progress', 'completed', 'followed_up', 'cancelled', 'no_show', 'reassignment_pending', 'failed')),
  tenant_name text not null,
  tenant_phone text,
  tenant_email text,
  manage_token_hash text unique,
  assignment_reason text,
  created_by text not null default 'tenant' check (created_by in ('tenant', 'admin')),
  cancel_reason text,
  lease_signed_at timestamptz,
  acknowledged_at timestamptz,
  reminders_sent int[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fo_appointments_agent_time on fo_appointments(agent_id, starts_at);
create index if not exists fo_appointments_property_time on fo_appointments(property_id, starts_at);
create index if not exists fo_appointments_status on fo_appointments(status);

-- Safety net under the booking function: one specialist can never hold two
-- live appointments that overlap in time.
alter table fo_appointments drop constraint if exists fo_no_agent_overlap;
alter table fo_appointments add constraint fo_no_agent_overlap exclude using gist (
  agent_id with =, tstzrange(starts_at, ends_at, '[)') with &&
) where (status in ('confirmed', 'in_progress', 'reassignment_pending') and agent_id is not null);

-- One live booking per prospect per home.
create unique index if not exists fo_one_live_booking on fo_appointments(booking_token_id)
  where status in ('confirmed', 'in_progress', 'reassignment_pending');

create table if not exists fo_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references fo_appointments(id) on delete cascade,
  agent_id uuid references agents(id) on delete set null,
  kind text not null,              -- booked, reassigned, cancelled, rescheduled, status, unavailable, override, ...
  actor text not null,             -- admin | tenant | specialist:<id> | system
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists fo_events_appointment on fo_events(appointment_id, created_at);

create table if not exists fo_checklists (
  appointment_id uuid primary key references fo_appointments(id) on delete cascade,
  steps jsonb not null default '{}',     -- { "reviewed": iso, "arrived": iso, "prepared": iso, "shown": iso, "secured": iso, "followed_up": iso }
  outcome text check (outcome in ('showed', 'no_show', 'tenant_cancelled_on_site', 'could_not_access')),
  interest text check (interest in ('high', 'medium', 'low', 'none')),
  concerns text[] not null default '{}',
  secured boolean,
  issue text,
  notes text,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists fo_earnings (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id),
  appointment_id uuid references fo_appointments(id) on delete set null,
  kind text not null check (kind in ('showing', 'lease_bonus', 'adjustment')),
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'reversed')),
  rate_snapshot jsonb not null default '{}',
  note text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  paid_at timestamptz
);
-- Never pay the same appointment twice for the same thing.
create unique index if not exists fo_earnings_once on fo_earnings(appointment_id, kind) where kind <> 'adjustment' and status <> 'reversed';
create index if not exists fo_earnings_agent on fo_earnings(agent_id, created_at);

create table if not exists fo_messages (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references fo_appointments(id) on delete cascade,
  booking_token_id uuid references fo_booking_tokens(id) on delete cascade,
  channel text not null default 'email',
  recipient text not null,
  template text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  provider_id text,
  error text,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);
create index if not exists fo_messages_appointment on fo_messages(appointment_id);

alter table fo_settings enable row level security;
alter table fo_availability_rules enable row level security;
alter table fo_availability_exceptions enable row level security;
alter table fo_property_rules enable row level security;
alter table fo_blackouts enable row level security;
alter table fo_booking_tokens enable row level security;
alter table fo_appointments enable row level security;
alter table fo_events enable row level security;
alter table fo_checklists enable row level security;
alter table fo_earnings enable row level security;
alter table fo_messages enable row level security;

-- Atomic booking. Locks the specialist and the home, rechecks every clash
-- (including travel time between different homes), then inserts. Returns the
-- new id, or null if the time is no longer free for this specialist.
create or replace function fo_try_book(
  p_agent uuid, p_property uuid, p_start timestamptz, p_end timestamptz,
  p_travel_min int, p_max_per_slot int,
  p_token uuid, p_request uuid, p_name text, p_phone text, p_email text,
  p_manage_hash text, p_reason text, p_created_by text, p_max_per_day int
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('fo_agent:' || p_agent::text));
  perform pg_advisory_xact_lock(hashtext('fo_property:' || p_property::text));

  -- Specialist clash: same home needs no gap; a different home needs travel time.
  if exists (
    select 1 from fo_appointments a
    where a.agent_id = p_agent
      and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
      and tstzrange(a.starts_at, a.ends_at, '[)') &&
          case when a.property_id = p_property
               then tstzrange(p_start, p_end, '[)')
               else tstzrange(p_start - make_interval(mins => p_travel_min), p_end + make_interval(mins => p_travel_min), '[)')
          end
  ) then return null; end if;

  -- Daily cap for the specialist (Toronto calendar day).
  if (select count(*) from fo_appointments a
      where a.agent_id = p_agent and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and (a.starts_at at time zone 'America/Toronto')::date = (p_start at time zone 'America/Toronto')::date) >= p_max_per_day
  then return null; end if;

  -- Home capacity for this slot.
  if (select count(*) from fo_appointments a
      where a.property_id = p_property and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_start, p_end, '[)')) >= p_max_per_slot
  then return null; end if;

  insert into fo_appointments (property_id, agent_id, booking_token_id, viewing_request_id, starts_at, ends_at,
    tenant_name, tenant_phone, tenant_email, manage_token_hash, assignment_reason, created_by)
  values (p_property, p_agent, p_token, p_request, p_start, p_end, p_name, p_phone, p_email, p_manage_hash, p_reason, p_created_by)
  returning id into v_id;

  insert into fo_events (appointment_id, agent_id, kind, actor, detail)
  values (v_id, p_agent, 'booked', p_created_by, jsonb_build_object('reason', p_reason, 'starts_at', p_start));
  return v_id;
exception when exclusion_violation or unique_violation then
  return null;
end $$;

-- Move a live appointment to another specialist and/or time with the same checks.
create or replace function fo_try_move(
  p_id uuid, p_agent uuid, p_start timestamptz, p_end timestamptz, p_travel_min int, p_max_per_slot int,
  p_max_per_day int, p_actor text, p_reason text
) returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_old fo_appointments%rowtype;
begin
  select * into v_old from fo_appointments where id = p_id for update;
  if not found then return false; end if;
  perform pg_advisory_xact_lock(hashtext('fo_agent:' || p_agent::text));
  perform pg_advisory_xact_lock(hashtext('fo_property:' || v_old.property_id::text));

  if exists (
    select 1 from fo_appointments a
    where a.id <> p_id and a.agent_id = p_agent
      and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
      and tstzrange(a.starts_at, a.ends_at, '[)') &&
          case when a.property_id = v_old.property_id
               then tstzrange(p_start, p_end, '[)')
               else tstzrange(p_start - make_interval(mins => p_travel_min), p_end + make_interval(mins => p_travel_min), '[)')
          end
  ) then return false; end if;

  if (select count(*) from fo_appointments a
      where a.id <> p_id and a.agent_id = p_agent and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and (a.starts_at at time zone 'America/Toronto')::date = (p_start at time zone 'America/Toronto')::date) >= p_max_per_day
  then return false; end if;

  if (select count(*) from fo_appointments a
      where a.id <> p_id and a.property_id = v_old.property_id and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_start, p_end, '[)')) >= p_max_per_slot
  then return false; end if;

  update fo_appointments
     set agent_id = p_agent, starts_at = p_start, ends_at = p_end, status = 'confirmed',
         acknowledged_at = case when agent_id = p_agent then acknowledged_at else null end,
         reminders_sent = case when starts_at = p_start then reminders_sent else '{}' end,
         assignment_reason = coalesce(p_reason, assignment_reason), updated_at = now()
   where id = p_id;

  insert into fo_events (appointment_id, agent_id, kind, actor, detail)
  values (p_id, p_agent,
          case when v_old.agent_id is distinct from p_agent then 'reassigned' else 'rescheduled' end,
          p_actor,
          jsonb_build_object('from_agent', v_old.agent_id, 'to_agent', p_agent, 'from_start', v_old.starts_at, 'to_start', p_start, 'reason', p_reason));
  return true;
exception when exclusion_violation then
  return false;
end $$;

revoke all on function fo_try_book(uuid, uuid, timestamptz, timestamptz, int, int, uuid, uuid, text, text, text, text, text, text, int) from public, anon, authenticated;
revoke all on function fo_try_move(uuid, uuid, timestamptz, timestamptz, int, int, int, text, text) from public, anon, authenticated;
