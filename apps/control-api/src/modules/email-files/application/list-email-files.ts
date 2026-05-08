import type { Pool } from "pg";

import type { EmailFileKind } from "core";

import { buildPaginationMeta } from "../../../shared/persistence/build-pagination-meta.js";
import { listEmailFilesByTemplate } from "../repositories/email-file-repository.js";
import { mapEmailFileRow, type EmailFileRecord } from "./shared.js";

type ListEmailFilesDependencies = { pgPool: Pool };

export type ListEmailFilesInput = {
  templateId: string;
  kind: EmailFileKind;
  page: number;
  pageSize: number;
};
export type ListEmailFilesResult = {
  items: EmailFileRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function listEmailFiles(
  dependencies: ListEmailFilesDependencies,
  input: ListEmailFilesInput,
): Promise<ListEmailFilesResult> {
  const { items, total } = await listEmailFilesByTemplate(
    dependencies.pgPool,
    input,
  );
  return {
    items: items.map(mapEmailFileRow),
    ...buildPaginationMeta({
      page: input.page,
      pageSize: input.pageSize,
      total,
    }),
  };
}
