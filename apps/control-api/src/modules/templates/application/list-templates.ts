import type { Pool } from "pg";

type ListTemplatesDependencies = {
  pgPool: Pool;
};

export type ListTemplatesFilters = {
  page: number;
  pageSize: number;
};

type RawTemplateListItem = {
  id: string;
  name: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type RawCountRow = {
  total: string;
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

function normalizeDateValue(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export async function listTemplates(
  dependencies: ListTemplatesDependencies,
  filters: ListTemplatesFilters,
): Promise<ListTemplatesResult> {
  const offset = (filters.page - 1) * filters.pageSize;

  const countResult = await dependencies.pgPool.query<RawCountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM templates
    `,
  );

  const total = Number(countResult.rows[0]?.total ?? "0");
  const totalPages = total === 0 ? 0 : Math.ceil(total / filters.pageSize);

  const result = await dependencies.pgPool.query<RawTemplateListItem>(
    `
      SELECT
        id,
        name,
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM templates
      ORDER BY created_at DESC
      LIMIT $1
      OFFSET $2
    `,
    [filters.pageSize, offset],
  );

  return {
    items: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      subject: row.subject,
      htmlContent: row.htmlContent,
      textContent: row.textContent,
      createdAt: normalizeDateValue(row.createdAt),
      updatedAt: normalizeDateValue(row.updatedAt),
    })),
    page: filters.page,
    pageSize: filters.pageSize,
    total,
    totalPages,
  };
}
