-- Fields for the property brief (renter + showing agent versions).
alter table public.properties
  add column if not exists unit_number text,
  add column if not exists entrance text,              -- renter-facing: "Side door on the left"
  add column if not exists parking_spaces integer,
  add column if not exists storage_details text,
  add column if not exists other_costs text,           -- renter-facing extra costs, e.g. "Parking $50/mo"
  add column if not exists renter_notes text,          -- approved property-specific notes renters see
  add column if not exists access_instructions text,   -- agent only: lockbox, codes, keys
  add column if not exists occupancy text check (occupancy in ('vacant','occupied')), -- agent only
  add column if not exists showing_notes text;         -- agent only
