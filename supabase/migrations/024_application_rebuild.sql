-- Tenant application rebuild: adaptive income, move details, rental history,
-- consent, and a structured AI summary.

alter table applications
  add column if not exists income_source text
    check (income_source in ('employed', 'self_employed', 'student', 'retired', 'other')),
  add column if not exists income_notes text,
  add column if not exists move_in_date date,
  add column if not exists occupants integer,
  add column if not exists co_applicants jsonb not null default '[]'::jsonb,
  add column if not exists pets text,
  add column if not exists smokes boolean,
  add column if not exists vehicles integer,
  add column if not exists time_at_address text,
  add column if not exists current_rent numeric,
  add column if not exists reason_for_moving text,
  add column if not exists consent_at timestamptz,
  add column if not exists ai_summary jsonb,
  add column if not exists ai_error text,
  add column if not exists ai_completed_at timestamptz;

alter table application_documents drop constraint if exists application_documents_doc_type_check;
alter table application_documents add constraint application_documents_doc_type_check
  check (doc_type in (
    'paystub', 'bank_statement', 'employment_letter', 'id',
    'notice_of_assessment', 'income_proof'
  ));
