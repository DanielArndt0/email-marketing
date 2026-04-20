ALTER TABLE campaigns
  ALTER COLUMN subject DROP NOT NULL;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS goal TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS template_id TEXT REFERENCES templates(id),
  ADD COLUMN IF NOT EXISTS audience_source_type TEXT,
  ADD COLUMN IF NOT EXISTS audience_filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS schedule_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_execution_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_campaigns_status
  ON campaigns (status);

CREATE INDEX IF NOT EXISTS idx_campaigns_template_id
  ON campaigns (template_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_audience_source_type
  ON campaigns (audience_source_type);
