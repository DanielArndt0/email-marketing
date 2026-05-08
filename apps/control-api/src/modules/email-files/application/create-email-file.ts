import type { Pool } from "pg";

import { emailFileKind, normalizeContentId, type EmailFileKind } from "core";

import {
  findTemplateInlineAssetByCid,
  insertEmailFile,
  templateExists,
} from "../repositories/email-file-repository.js";
import { mapEmailFileRow, type EmailFileRecord } from "./shared.js";

type CreateEmailFileDependencies = { pgPool: Pool };

export type CreateEmailFileInput = {
  templateId: string;
  kind: EmailFileKind;
  originalName: string;
  storedName?: string | undefined;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  cid?: string | null | undefined;
};

export type CreateEmailFileResult =
  | { kind: "created"; file: EmailFileRecord }
  | { kind: "template_not_found"; templateId: string }
  | { kind: "missing_cid" }
  | { kind: "unexpected_cid" }
  | { kind: "cid_conflict"; cid: string };

export async function createEmailFile(
  dependencies: CreateEmailFileDependencies,
  input: CreateEmailFileInput,
): Promise<CreateEmailFileResult> {
  const normalizedCid = input.cid ? normalizeContentId(input.cid) : null;

  if (input.kind === emailFileKind.templateInlineAsset && !normalizedCid)
    return { kind: "missing_cid" };
  if (input.kind === emailFileKind.templateAttachment && normalizedCid)
    return { kind: "unexpected_cid" };

  if (!(await templateExists(dependencies.pgPool, input.templateId))) {
    return { kind: "template_not_found", templateId: input.templateId };
  }

  if (input.kind === emailFileKind.templateInlineAsset && normalizedCid) {
    const existingAsset = await findTemplateInlineAssetByCid(
      dependencies.pgPool,
      { templateId: input.templateId, cid: normalizedCid },
    );
    if (existingAsset) return { kind: "cid_conflict", cid: normalizedCid };
  }

  const row = await insertEmailFile(dependencies.pgPool, {
    templateId: input.templateId,
    kind: input.kind,
    originalName: input.originalName,
    storedName: input.storedName ?? input.originalName,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    storageKey: input.storageKey,
    cid:
      input.kind === emailFileKind.templateInlineAsset ? normalizedCid : null,
  });

  return { kind: "created", file: mapEmailFileRow(row) };
}
