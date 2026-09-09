-- PSN-DATA-001 — daily snapshot of the computed Business Numbers.
--
-- One row per calendar month; overwritten each time the snapshot cron runs
-- (/api/cron/ceo-snapshot). Gives the dashboard fast loads and real
-- month-over-month history — PUM, owner count, cash and unit economics were
-- previously frozen at "today" for every historical month.
--
-- Applied to project hwaroazxbzgmjjasgtdb on 2026-09-09.
--
-- NOTE: the other CEO / forecast tables (ceo_monthly_actuals, ceo_ue_config,
-- ceo_audit_log, forecast_scenarios, forecast_assumptions, forecast_results)
-- were created directly in the Supabase dashboard during PSN-DATA-001 and are
-- not reproduced here.

create table if not exists public.ceo_metric_snapshots (
  period        date primary key,          -- YYYY-MM-01 the snapshot describes
  snapshot_date date not null,             -- when it was last recomputed
  metrics       jsonb not null,            -- { pnl, unit_economics, counts, actual }
  brief         text,                      -- AI "CFO's Take" (current month only)
  created_at    timestamptz not null default now()
);

comment on table public.ceo_metric_snapshots is
  'Daily-recomputed Business Numbers snapshot, one row per month. Written by /api/cron/ceo-snapshot.';

alter table public.ceo_metric_snapshots enable row level security;
-- service-role only (all access via getSupabaseAdmin); no policies = deny all anon.
