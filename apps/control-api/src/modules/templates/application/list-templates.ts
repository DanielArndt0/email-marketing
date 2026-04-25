import type { Pool } from "pg";

import { buildPaginationMeta } from "../../../shared/persistence/build-pagination-meta.js";
import { listTemplatesPage } from "../repositories/template-repository.js";
import { mapTemplateRow, type TemplateRecord } from "./shared.js";

type ListTemplatesDependencies = {
  pgPool: Pool;
};

export type ListTemplatesFilters = {
  page: number;
  pageSize: number;
};

export type ListTemplatesResult = {
  items: TemplateRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function listTemplates(
  dependencies: ListTemplatesDependencies,
  filters: ListTemplatesFilters,
): Promise<ListTemplatesResult> {
  const { items, total } = await listTemplatesPage(
    dependencies.pgPool,
    filters,
  );

  return {
    items: items.map(mapTemplateRow),
    ...buildPaginationMeta({
      page: filters.page,
      pageSize: filters.pageSize,
      total,
    }),
  };
}
