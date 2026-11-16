-- Staff can add documents to an application after it's submitted (e.g. a pay stub
-- the applicant emailed later), then re-run the AI review.
-- Also widens the doc_type check: the form already asks for credit reports, which
-- the old check rejected.

alter table application_documents add column if not exists uploaded_by text not null default 'applicant'
  check (uploaded_by in ('applicant', 'staff'));
alter table application_documents add column if not exists file_name text;

alter table application_documents drop constraint if exists application_documents_doc_type_check;
alter table application_documents add constraint application_documents_doc_type_check
  check (doc_type in (
    'paystub', 'bank_statement', 'employment_letter', 'id', 'notice_of_assessment', 'income_proof',
    'credit_report', 'singlekey_report', 'reference_letter', 'other'
  ));
