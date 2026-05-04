-- Adds database-level protection for future campaign status writes.
-- NOT VALID keeps the migration safe for existing databases that may contain
-- legacy rows while still enforcing the constraint for new/updated rows.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'campaigns_status_check'
  ) THEN
    ALTER TABLE campaigns
      ADD CONSTRAINT campaigns_status_check
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
      ) NOT VALID;
  END IF;
END $$;
