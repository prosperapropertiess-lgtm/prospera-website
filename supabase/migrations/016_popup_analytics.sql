-- 016_popup_analytics.sql
-- Tracks newsletter popup events (shown, closed, converted) for funnel analysis

CREATE TABLE IF NOT EXISTS popup_analytics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event       text        NOT NULL,
  page        text        NOT NULL,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for querying by event type and time
CREATE INDEX IF NOT EXISTS popup_analytics_event_idx      ON popup_analytics (event);
CREATE INDEX IF NOT EXISTS popup_analytics_created_at_idx ON popup_analytics (created_at DESC);
