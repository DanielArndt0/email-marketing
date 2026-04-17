import type { Pool } from "pg";

import { buildPaginationMeta } from "../../../shared/persistence/build-pagination-meta.js";
import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import { listTemplatesPage } from "../repositories/template-repository.js";

type ListTemplatesDependencies = {
  pgPool: Pool;
};

export type ListTemplatesFilters = {
  page: number;
  pageSize: number;
};

export type TemplateListItem = {
  id: string;
  name: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListTemplatesResult = {
  items: TemplateListItem[];
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
    items: items.map((row) => ({
      id: row.id,
      name: row.name,
      subject: row.subject,
      htmlContent: row.htmlContent,
      textContent: row.textContent,
      createdAt: normalizeDateValue(row.createdAt) ?? "",
      updatedAt: normalizeDateValue(row.updatedAt) ?? "",
    })),
    ...buildPaginationMeta({
      page: filters.page,
      pageSize: filters.pageSize,
      total,
    }),
  };
}
