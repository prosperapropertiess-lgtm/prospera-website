-- Group showings: one specialist may show the same home to several households at
-- the same time (when the home's "households at once" allows it). Still never two
-- different homes at once, and never overlapping times at the same home unless
-- it's the exact same slot.

alter table fo_appointments drop constraint if exists fo_no_agent_overlap;
alter table fo_appointments add constraint fo_no_agent_overlap exclude using gist (
  agent_id with =, property_id with <>, tstzrange(starts_at, ends_at, '[)') with &&
) where (status in ('confirmed', 'in_progress', 'reassignment_pending') and agent_id is not null);

create or replace function fo_agent_clash(p_agent uuid, p_property uuid, p_start timestamptz, p_end timestamptz, p_travel_min int, p_ignore uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from fo_appointments a
    where a.agent_id = p_agent and (p_ignore is null or a.id <> p_ignore)
      and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
      and (
        (a.property_id = p_property
          and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_start, p_end, '[)')
          and not (a.starts_at = p_start and a.ends_at = p_end))
        or
        (a.property_id <> p_property
          and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_start - make_interval(mins => p_travel_min), p_end + make_interval(mins => p_travel_min), '[)'))
      )
  );
$$;

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

  if fo_agent_clash(p_agent, p_property, p_start, p_end, p_travel_min, null) then return null; end if;

  if (select count(*) from fo_appointments a
      where a.agent_id = p_agent and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and (a.starts_at at time zone 'America/Toronto')::date = (p_start at time zone 'America/Toronto')::date) >= p_max_per_day
  then return null; end if;

  if (select count(*) from fo_appointments a
      where a.property_id = p_property and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_start, p_end, '[)')) >= p_max_per_slot
  then return null; end if;

  -- A group slot at a home is always run by one specialist.
  if exists (select 1 from fo_appointments a
      where a.property_id = p_property and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and a.starts_at = p_start and a.agent_id is distinct from p_agent)
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

  if fo_agent_clash(p_agent, v_old.property_id, p_start, p_end, p_travel_min, p_id) then return false; end if;

  if (select count(*) from fo_appointments a
      where a.id <> p_id and a.agent_id = p_agent and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and (a.starts_at at time zone 'America/Toronto')::date = (p_start at time zone 'America/Toronto')::date) >= p_max_per_day
  then return false; end if;

  if (select count(*) from fo_appointments a
      where a.id <> p_id and a.property_id = v_old.property_id and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_start, p_end, '[)')) >= p_max_per_slot
  then return false; end if;

  if exists (select 1 from fo_appointments a
      where a.id <> p_id and a.property_id = v_old.property_id and a.status in ('confirmed', 'in_progress', 'reassignment_pending')
        and a.starts_at = p_start and a.agent_id is distinct from p_agent)
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

revoke all on function fo_agent_clash(uuid, uuid, timestamptz, timestamptz, int, uuid) from public, anon, authenticated;
