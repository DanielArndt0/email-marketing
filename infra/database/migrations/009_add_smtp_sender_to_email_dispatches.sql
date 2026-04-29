ALTER TABLE smtp_senders
  ALTER COLUMN username DROP NOT NULL;

ALTER TABLE smtp_senders
  ALTER COLUMN password_encrypted DROP NOT NULL;

ALTER TABLE email_dispatches
  ADD COLUMN IF NOT EXISTS smtp_sender_id UUID NULL;

DO $$
BEGIN
  ALTER TABLE email_dispatches
    ADD CONSTRAINT email_dispatches_smtp_sender_id_fkey
    FOREIGN KEY (smtp_sender_id)
    REFERENCES smtp_senders(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_dispatches_smtp_sender_id
  ON email_dispatches (smtp_sender_id);