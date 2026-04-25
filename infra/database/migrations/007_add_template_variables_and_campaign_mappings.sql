ALTER TABLE templates
  ADD COLUMN IF NOT EXISTS variables JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS template_variable_mappings JSONB NOT NULL DEFAULT '{}'::jsonb;
