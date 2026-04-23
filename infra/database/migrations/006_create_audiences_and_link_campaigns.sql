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

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS audience_id TEXT REFERENCES audiences(id);

CREATE INDEX IF NOT EXISTS idx_campaigns_audience_id
  ON campaigns (audience_id);

INSERT INTO audiences (
  id,
  name,
  description,
  source_type,
  filters,
  created_at,
  updated_at
)
SELECT
  'aud-' || id,
  'Audience vinculada à campanha ' || name,
  'Gerada automaticamente a partir da configuração legada da campanha.',
  audience_source_type,
  audience_filters,
  NOW(),
  NOW()
FROM campaigns
WHERE audience_source_type IS NOT NULL
  AND audience_id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM audiences a
    WHERE a.id = 'aud-' || campaigns.id
  );

UPDATE campaigns
SET audience_id = 'aud-' || id
WHERE audience_id IS NULL
  AND audience_source_type IS NOT NULL;
