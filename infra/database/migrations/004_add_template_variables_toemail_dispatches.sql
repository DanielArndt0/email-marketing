ALTER TABLE email_dispatches
  ADD COLUMN IF NOT EXISTS template_variables JSONB NOT NULL DEFAULT '{}'::jsonb;