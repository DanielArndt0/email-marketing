CREATE TABLE IF NOT EXISTS smtp_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to_email TEXT NULL,

  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  secure BOOLEAN NOT NULL DEFAULT false,

  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,

  last_tested_at TIMESTAMPTZ NULL,
  last_test_status TEXT NULL,
  last_test_error TEXT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS smtp_sender_id UUID NULL REFERENCES smtp_senders(id);

CREATE INDEX IF NOT EXISTS idx_smtp_senders_is_active
  ON smtp_senders (is_active);

CREATE INDEX IF NOT EXISTS idx_campaigns_smtp_sender_id
  ON campaigns (smtp_sender_id);