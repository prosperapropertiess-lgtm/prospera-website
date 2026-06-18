-- Seed demo home guide and schedule data for Sheba's tenant portal
-- Dynamically looks up property_id from tenant_access by tenant name

DO $$
DECLARE
  prop_id TEXT;
BEGIN
  SELECT property_id INTO prop_id
  FROM tenant_access
  WHERE tenant_name ILIKE '%sheba%'
  LIMIT 1;

  IF prop_id IS NULL THEN
    RAISE NOTICE 'No tenant found with name containing "sheba" — skipping seed';
    RETURN;
  END IF;

  RAISE NOTICE 'Seeding demo data for property_id: %', prop_id;

  -- -----------------------------------------------------------------------
  -- Home guide sections
  -- Unique constraint is on (property_id, section)
  -- ON CONFLICT updates content and sort_order so re-runs are safe
  -- -----------------------------------------------------------------------
  INSERT INTO property_home_guide (property_id, section, title, content, sort_order) VALUES

  (prop_id,
   'garbage-recycling',
   'Garbage & Recycling',
   '**Garbage:** Put out Tuesday evening for Wednesday morning pickup. Use the black bin at the side of the house.

**Recycling:** Blue bin — every other Wednesday. Check the City of London schedule for your week.

**Green bin (organics):** Weekly, same day as garbage.

**Large items:** Book a bulk pickup through the City of London at london.ca or call 519-661-2489.',
   1),

  (prop_id,
   'main-water-shutoff',
   'Main Water Shutoff',
   'The main water shutoff valve is located in the **basement utility room**, on the wall to your left as you come down the stairs.

It''s a red-handled ball valve — turn it clockwise (right) to shut off water to the entire unit.

In a water emergency (burst pipe, major leak), shut this off immediately and call Ebin: **(519) 697-1227**.',
   2),

  (prop_id,
   'electrical-panel',
   'Electrical Panel',
   'The electrical panel (breaker box) is on the **north wall of the basement** near the utility room door.

If a circuit trips, locate the tripped breaker (it will be in the middle position, not fully ON or OFF), flip it fully OFF, then back ON.

**Do not reset a breaker more than once** — if it trips again, call Ebin. Never overload a circuit with multiple high-draw appliances.',
   3),

  (prop_id,
   'furnace-heating',
   'Furnace & Heating',
   '**Furnace filter:** Located in the furnace intake (lower basement). Replace every **3 months** — 1-inch filters available at Home Depot or Canadian Tire (~$10). A dirty filter is the #1 cause of furnace issues.

**Thermostat:** Ecobee smart thermostat in the hallway. Set your preferred temperature — it will learn your schedule.

**If the furnace stops:** Check the filter first. If clear, check the power switch on the unit (looks like a light switch on the wall nearby). If still no heat, call Ebin immediately — do not go without heat.',
   4),

  (prop_id,
   'appliances',
   'Appliances',
   '**Washer/Dryer:** Located in the basement laundry room. Always clean the dryer lint trap after every load — this is a fire hazard if ignored.

**Dishwasher:** Run with hot water. If dishes aren''t clean, check and clean the filter at the bottom of the unit monthly.

**Fridge:** The temperature controls are on the inside back wall. If the fridge isn''t cooling, make sure the coils at the back have air circulation.

**Stove:** Gas range — if you smell gas, do not use any switches. Open windows, leave the unit, and call 911 then Ebin.',
   5),

  (prop_id,
   'emergency-contacts',
   'Emergency Contacts',
   '**Ebin Jaison — Prospera Properties**
📞 (519) 697-1227
📧 ebin@prosperaproperties.co

**Fire / Police / Ambulance:** 911

**Enbridge Gas (gas leak/emergency):** 1-866-763-5427

**London Hydro (power outage):** 519-661-5503

**City of London (water/roads/noise):** 519-661-2489

For non-emergency maintenance, always submit through your portal so there''s a record.',
   6)

  ON CONFLICT (property_id, section) DO UPDATE
    SET content    = EXCLUDED.content,
        title      = EXCLUDED.title,
        sort_order = EXCLUDED.sort_order,
        updated_at = now();

  -- -----------------------------------------------------------------------
  -- Schedule events
  -- No unique constraint on property_schedule — use ON CONFLICT DO NOTHING
  -- (no-op since there is no conflict target, so we guard with a NOT EXISTS
  -- check instead to avoid duplicate rows on re-runs)
  -- event_type allowed values: inspection | maintenance | reminder | garbage | other
  -- -----------------------------------------------------------------------

  -- Annual Property Inspection
  INSERT INTO property_schedule (property_id, title, event_type, event_date, description, recurring)
  SELECT prop_id,
         'Annual Property Inspection',
         'inspection',
         '2026-07-15',
         'Ebin will do a walk-through inspection of the property. Takes about 30–45 minutes. Please ensure access to all rooms, basement, and appliances.',
         NULL
  WHERE NOT EXISTS (
    SELECT 1 FROM property_schedule
    WHERE property_id = prop_id
      AND title = 'Annual Property Inspection'
      AND event_date = '2026-07-15'
  );

  -- Garbage Pickup (weekly reminder)
  INSERT INTO property_schedule (property_id, title, event_type, event_date, description, recurring)
  SELECT prop_id,
         'Garbage Pickup',
         'garbage',
         '2026-06-25',
         'Put garbage and green bin out Tuesday evening for Wednesday morning pickup.',
         'weekly'
  WHERE NOT EXISTS (
    SELECT 1 FROM property_schedule
    WHERE property_id = prop_id
      AND title = 'Garbage Pickup'
      AND event_date = '2026-06-25'
  );

  -- Recycling Day (biweekly reminder)
  INSERT INTO property_schedule (property_id, title, event_type, event_date, description, recurring)
  SELECT prop_id,
         'Recycling Day',
         'reminder',
         '2026-06-24',
         'Blue bin recycling — every other Wednesday. Check City of London schedule for your week.',
         'biweekly'
  WHERE NOT EXISTS (
    SELECT 1 FROM property_schedule
    WHERE property_id = prop_id
      AND title = 'Recycling Day'
      AND event_date = '2026-06-24'
  );

  -- Furnace Filter Change (quarterly reminder)
  INSERT INTO property_schedule (property_id, title, event_type, event_date, description, recurring)
  SELECT prop_id,
         'Furnace Filter Change',
         'reminder',
         '2026-09-01',
         'Time to replace the furnace filter. Pick up a 1-inch filter at Home Depot or Canadian Tire (~$10). The filter is in the furnace intake in the basement.',
         'quarterly'
  WHERE NOT EXISTS (
    SELECT 1 FROM property_schedule
    WHERE property_id = prop_id
      AND title = 'Furnace Filter Change'
      AND event_date = '2026-09-01'
  );

  -- Lease Renewal Discussion (one-off notice — stored as event_type 'other')
  INSERT INTO property_schedule (property_id, title, event_type, event_date, description, recurring)
  SELECT prop_id,
         'Lease Renewal Discussion',
         'other',
         '2026-11-01',
         'Your lease is up for renewal in January. Ebin will reach out before this date to discuss renewal terms. No action needed — just a heads up.',
         NULL
  WHERE NOT EXISTS (
    SELECT 1 FROM property_schedule
    WHERE property_id = prop_id
      AND title = 'Lease Renewal Discussion'
      AND event_date = '2026-11-01'
  );

  RAISE NOTICE 'Demo seed complete for property_id: %', prop_id;

END $$;
