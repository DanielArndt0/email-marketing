import type { Pool } from "pg";

type ListTemplatesDependencies = {
  pgPool: Pool;
};

export type ListTemplatesFilters = {
  limit: number;
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

export type TemplateListItem = {
  id: string;
  name: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  createdAt: string;
  updatedAt: string;
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
): Promise<TemplateListItem[]> {
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
    `,
    [filters.limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    subject: row.subject,
    htmlContent: row.htmlContent,
    textContent: row.textContent,
    createdAt: normalizeDateValue(row.createdAt),
    updatedAt: normalizeDateValue(row.updatedAt),
  }));
}
