ALTER TABLE email_dispatches
  ADD COLUMN IF NOT EXISTS template_id TEXT REFERENCES templates(id);

ALTER TABLE email_dispatches
  ADD COLUMN IF NOT EXISTS html_content TEXT;

ALTER TABLE email_dispatches
  ADD COLUMN IF NOT EXISTS text_content TEXT;

CREATE INDEX IF NOT EXISTS idx_email_dispatches_template_id
  ON email_dispatches (template_id);