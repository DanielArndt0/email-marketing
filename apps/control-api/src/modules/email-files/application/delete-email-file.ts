import type { Pool } from "pg";

import type { EmailFileKind } from "core";

import { deleteEmailFileByTemplate } from "../repositories/email-file-repository.js";

type DeleteEmailFileDependencies = { pgPool: Pool };

export type DeleteEmailFileResult =
  | { kind: "deleted"; id: string }
  | { kind: "not_found" };

export async function deleteEmailFile(
  dependencies: DeleteEmailFileDependencies,
  input: { templateId: string; kind: EmailFileKind; fileId: string },
): Promise<DeleteEmailFileResult> {
  const deleted = await deleteEmailFileByTemplate(dependencies.pgPool, input);
  return deleted
    ? { kind: "deleted", id: input.fileId }
    : { kind: "not_found" };
}
