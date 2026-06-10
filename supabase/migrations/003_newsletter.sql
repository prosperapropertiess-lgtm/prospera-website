-- Newsletter log — tracks which blog has been sent each week (broadcast)
create table if not exists newsletter_log (
  id               uuid default gen_random_uuid() primary key,
  blog_slug        text not null unique,
  blog_title       text,
  subject_line     text,
  recipient_count  int default 0,
  sent_at          timestamptz default now()
);

-- Unsubscribe support — add column to subscribers if not present
alter table subscribers add column if not exists unsubscribed boolean default false;
alter table subscribers add column if not exists unsubscribed_at timestamptz;
