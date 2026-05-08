import type { EmailFileKind } from "core";

import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import type { RawEmailFileRow } from "../repositories/email-file-repository.js";

export type EmailFileRecord = {
  id: string;
  templateId: string;
  kind: EmailFileKind;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  cid: string | null;
  createdAt: string;
  updatedAt: string;
};

export function mapEmailFileRow(row: RawEmailFileRow): EmailFileRecord {
  return {
    id: row.id,
    templateId: row.templateId,
    kind: row.kind,
    originalName: row.originalName,
    storedName: row.storedName,
    mimeType: row.mimeType,
    sizeBytes: Number(row.sizeBytes),
    storageKey: row.storageKey,
    cid: row.cid,
    createdAt: normalizeDateValue(row.createdAt) ?? "",
    updatedAt: normalizeDateValue(row.updatedAt) ?? "",
  };
}
