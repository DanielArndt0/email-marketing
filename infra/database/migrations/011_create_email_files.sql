CREATE TABLE IF NOT EXISTS email_files (
  id TEXT PRIMARY KEY,

  template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,

  kind TEXT NOT NULL,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_key TEXT NOT NULL,
  cid TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT email_files_kind_check
    CHECK (kind IN ('template_inline_asset', 'template_attachment')),

  CONSTRAINT email_files_size_bytes_check
    CHECK (size_bytes >= 0),

  CONSTRAINT email_files_inline_assets_require_cid_check
    CHECK (
      kind <> 'template_inline_asset'
      OR cid IS NOT NULL
    ),

  CONSTRAINT email_files_template_attachments_without_cid_check
    CHECK (
      kind <> 'template_attachment'
      OR cid IS NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_email_files_template_id
  ON email_files (template_id);

CREATE INDEX IF NOT EXISTS idx_email_files_kind
  ON email_files (kind);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_files_template_inline_cid
  ON email_files (template_id, cid)
  WHERE kind = 'template_inline_asset';
