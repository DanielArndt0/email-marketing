import type { Pool } from "pg";

import type { EmailFileKind } from "core";

import { findEmailFileByTemplate } from "../repositories/email-file-repository.js";
import { mapEmailFileRow, type EmailFileRecord } from "./shared.js";

type GetEmailFileByIdDependencies = { pgPool: Pool };

export async function getEmailFileById(
  dependencies: GetEmailFileByIdDependencies,
  input: { templateId: string; kind: EmailFileKind; fileId: string },
): Promise<EmailFileRecord | null> {
  const row = await findEmailFileByTemplate(dependencies.pgPool, input);
  return row ? mapEmailFileRow(row) : null;
}
