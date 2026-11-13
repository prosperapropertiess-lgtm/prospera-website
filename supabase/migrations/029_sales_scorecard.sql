-- Daily sales scorecard: one row per Toronto day. The admin Scorecard app writes here
-- and mirrors each row to a Google Sheet.

create table if not exists sales_scorecard (
  day date primary key,
  target int not null default 10 check (target > 0),
  outreaches int not null default 0 check (outreaches >= 0),
  followups int not null default 0 check (followups >= 0),
  updated_at timestamptz not null default now(),
  sheet_synced_at timestamptz
);

alter table sales_scorecard enable row level security;
