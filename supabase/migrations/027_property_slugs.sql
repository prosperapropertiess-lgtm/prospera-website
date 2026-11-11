-- Every property gets a readable, unique web address (e.g. 1531-mclarenwood-terrace-london)
-- the first time it's saved without one. Existing slugs never change, so links stay valid.
create or replace function properties_set_slug() returns trigger language plpgsql as $$
declare
  base text;
  candidate text;
  n int := 1;
begin
  if new.slug is not null and new.slug <> '' then return new; end if;
  base := trim(both '-' from regexp_replace(lower(coalesce(new.address, '') || ' ' || coalesce(new.city, '')), '[^a-z0-9]+', '-', 'g'));
  if base = '' then base := 'home'; end if;
  candidate := base;
  while exists (select 1 from properties where slug = candidate and id <> new.id) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  new.slug := candidate;
  return new;
end $$;

drop trigger if exists properties_set_slug on properties;
create trigger properties_set_slug before insert or update on properties
  for each row execute function properties_set_slug();

update properties set slug = null where slug = '';
update properties set slug = slug where slug is null;
