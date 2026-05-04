-- Email Marketing database schema

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_name
  ON templates (name);

CREATE TABLE IF NOT EXISTS audiences (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audiences_name
  ON audiences (name);

CREATE INDEX IF NOT EXISTS idx_audiences_source_type
  ON audiences (source_type);

CREATE TABLE IF NOT EXISTS smtp_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to_email TEXT,

  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  secure BOOLEAN NOT NULL DEFAULT false,

  username TEXT,
  password_encrypted TEXT,

  is_active BOOLEAN NOT NULL DEFAULT true,

  last_tested_at TIMESTAMPTZ,
  last_test_status TEXT,
  last_test_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smtp_senders_is_active
  ON smtp_senders (is_active);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  template_id TEXT REFERENCES templates(id),
  audience_id TEXT REFERENCES audiences(id),
  audience_source_type TEXT,
  audience_filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  template_variable_mappings JSONB NOT NULL DEFAULT '{}'::jsonb,
  smtp_sender_id UUID REFERENCES smtp_senders(id),
  schedule_at TIMESTAMPTZ,
  last_execution_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT campaigns_status_check
    CHECK (
      status IN (
        'draft',
        'ready',
        'scheduled',
        'running',
        'paused',
        'completed',
        'canceled',
        'failed'
      )
    )
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status
  ON campaigns (status);

CREATE INDEX IF NOT EXISTS idx_campaigns_template_id
  ON campaigns (template_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_audience_id
  ON campaigns (audience_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_audience_source_type
  ON campaigns (audience_source_type);

CREATE INDEX IF NOT EXISTS idx_campaigns_smtp_sender_id
  ON campaigns (smtp_sender_id);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_dispatches (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  contact_id TEXT NOT NULL REFERENCES contacts(id),
  template_id TEXT REFERENCES templates(id),
  smtp_sender_id UUID REFERENCES smtp_senders(id),

  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,

  status TEXT NOT NULL,
  provider_message_id TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_dispatches_campaign_id
  ON email_dispatches (campaign_id);

CREATE INDEX IF NOT EXISTS idx_email_dispatches_contact_id
  ON email_dispatches (contact_id);

CREATE INDEX IF NOT EXISTS idx_email_dispatches_template_id
  ON email_dispatches (template_id);

CREATE INDEX IF NOT EXISTS idx_email_dispatches_smtp_sender_id
  ON email_dispatches (smtp_sender_id);

CREATE INDEX IF NOT EXISTS idx_email_dispatches_status
  ON email_dispatches (status);
