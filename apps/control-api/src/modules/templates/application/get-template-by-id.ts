import type { Pool } from "pg";

type GetTemplateByIdDependencies = {
  pgPool: Pool;
};

type RawTemplateRow = {
  id: string;
  name: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type TemplateDetails = {
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

export async function getTemplateById(
  dependencies: GetTemplateByIdDependencies,
  id: string,
): Promise<TemplateDetails | null> {
  const result = await dependencies.pgPool.query<RawTemplateRow>(
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
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    htmlContent: row.htmlContent,
    textContent: row.textContent,
    createdAt: normalizeDateValue(row.createdAt),
    updatedAt: normalizeDateValue(row.updatedAt),
  };
}
