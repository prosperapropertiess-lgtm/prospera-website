-- Agent run log — every cron writes a row when it completes
create table if not exists agent_runs (
  id          uuid default gen_random_uuid() primary key,
  agent       text not null,
  status      text not null check (status in ('success', 'error', 'skipped')),
  summary     jsonb,
  error_msg   text,
  duration_ms int,
  ran_at      timestamptz default now()
);
create index if not exists agent_runs_agent_ran_at on agent_runs (agent, ran_at desc);
create index if not exists agent_runs_ran_at on agent_runs (ran_at desc);
