-- Add service type to onboarding sessions
-- "placement" = tenant placement only
-- "management" = placement + full ongoing management

alter table onboarding_sessions
  add column if not exists service_type text not null default 'placement'
    check (service_type in ('placement', 'management')),
  add column if not exists placement_completed_at timestamptz;
