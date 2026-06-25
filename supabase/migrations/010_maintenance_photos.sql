-- Add photo_urls to maintenance requests
ALTER TABLE tenant_maintenance_requests
  ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';

-- Storage bucket for maintenance photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'maintenance-photos',
  'maintenance-photos',
  false,
  20971520,
  ARRAY['image/jpeg','image/png','image/webp','image/heic']
)
ON CONFLICT (id) DO NOTHING;
