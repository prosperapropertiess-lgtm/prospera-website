-- Fit-check link: landlord self-serves the fit questionnaire after the call.
alter table discovery_calls
  add column if not exists fit_token text unique,
  add column if not exists source text not null default 'call',
  add column if not exists fit_sent_at timestamptz,
  add column if not exists fit_submitted_at timestamptz,
  add column if not exists area text,
  add column if not exists address_disclosed boolean,
  add column if not exists rent_expectation text,
  add column if not exists rent_basis text,
  add column if not exists rent_flexibility text,
  add column if not exists maintenance_level text,
  add column if not exists resources_sent_at timestamptz;
