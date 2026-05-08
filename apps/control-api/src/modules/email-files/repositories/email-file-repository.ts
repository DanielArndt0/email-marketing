import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import type { EmailFileKind } from "core";

export type RawEmailFileRow = {
  id: string;
  templateId: string;
  kind: EmailFileKind;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: string;
  storageKey: string;
  cid: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type CountRow = { total: string };

type EmailFileInsertInput = {
  templateId: string;
  kind: EmailFileKind;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  cid?: string | null | undefined;
};

const EMAIL_FILE_SELECT = `
  SELECT
    id,
    template_id AS "templateId",
    kind,
    original_name AS "originalName",
    stored_name AS "storedName",
    mime_type AS "mimeType",
    size_bytes::text AS "sizeBytes",
    storage_key AS "storageKey",
    cid,
    created_at AS "createdAt",
    updated_at AS "updatedAt"
  FROM email_files
`;

export async function templateExists(
  pgPool: Pool,
  templateId: string,
): Promise<boolean> {
  const result = await pgPool.query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM templates WHERE id = $1) AS exists`,
    [templateId],
  );
  return result.rows[0]?.exists ?? false;
}

export async function insertEmailFile(
  pgPool: Pool,
  input: EmailFileInsertInput,
): Promise<RawEmailFileRow> {
  const id = randomUUID();
  const result = await pgPool.query<RawEmailFileRow>(
    `
      INSERT INTO email_files (
        id, template_id, kind, original_name, stored_name, mime_type, size_bytes, storage_key, cid
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        template_id AS "templateId",
        kind,
        original_name AS "originalName",
        stored_name AS "storedName",
        mime_type AS "mimeType",
        size_bytes::text AS "sizeBytes",
        storage_key AS "storageKey",
        cid,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      id,
      input.templateId,
      input.kind,
      input.originalName,
      input.storedName,
      input.mimeType,
      input.sizeBytes,
      input.storageKey,
      input.cid ?? null,
    ],
  );
  return result.rows[0]!;
}

export async function listEmailFilesByTemplate(
  pgPool: Pool,
  input: {
    templateId: string;
    kind: EmailFileKind;
    page: number;
    pageSize: number;
  },
): Promise<{ items: RawEmailFileRow[]; total: number }> {
  const offset = (input.page - 1) * input.pageSize;
  const countResult = await pgPool.query<CountRow>(
    `SELECT COUNT(*)::text AS total FROM email_files WHERE template_id = $1 AND kind = $2`,
    [input.templateId, input.kind],
  );
  const listResult = await pgPool.query<RawEmailFileRow>(
    `${EMAIL_FILE_SELECT} WHERE template_id = $1 AND kind = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
    [input.templateId, input.kind, input.pageSize, offset],
  );
  return {
    items: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? "0"),
  };
}

export async function findEmailFileByTemplate(
  pgPool: Pool,
  input: { templateId: string; kind: EmailFileKind; fileId: string },
): Promise<RawEmailFileRow | null> {
  const result = await pgPool.query<RawEmailFileRow>(
    `${EMAIL_FILE_SELECT} WHERE template_id = $1 AND kind = $2 AND id = $3 LIMIT 1`,
    [input.templateId, input.kind, input.fileId],
  );
  return result.rows[0] ?? null;
}

export async function deleteEmailFileByTemplate(
  pgPool: Pool,
  input: { templateId: string; kind: EmailFileKind; fileId: string },
): Promise<boolean> {
  const result = await pgPool.query(
    `DELETE FROM email_files WHERE template_id = $1 AND kind = $2 AND id = $3`,
    [input.templateId, input.kind, input.fileId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function findTemplateInlineAssetByCid(
  pgPool: Pool,
  input: { templateId: string; cid: string },
): Promise<RawEmailFileRow | null> {
  const result = await pgPool.query<RawEmailFileRow>(
    `${EMAIL_FILE_SELECT} WHERE template_id = $1 AND kind = 'template_inline_asset' AND cid = $2 LIMIT 1`,
    [input.templateId, input.cid],
  );
  return result.rows[0] ?? null;
}
