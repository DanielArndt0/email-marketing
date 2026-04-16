import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

type CreateTemplateDependencies = {
  pgPool: Pool;
};

export type CreateTemplateInput = {
  name: string;
  subject: string;
  htmlContent?: string | undefined;
  textContent?: string | undefined;
};

export type CreateTemplateResult = {
  id: string;
  name: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  createdAt: string;
  updatedAt: string;
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

function normalizeDateValue(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export async function createTemplate(
  dependencies: CreateTemplateDependencies,
  input: CreateTemplateInput,
): Promise<CreateTemplateResult> {
  const id = randomUUID();

  const result = await dependencies.pgPool.query<RawTemplateRow>(
    `
      INSERT INTO templates (
        id,
        name,
        subject,
        html_content,
        text_content
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        name,
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      id,
      input.name,
      input.subject,
      input.htmlContent ?? null,
      input.textContent ?? null,
    ],
  );

  const row = result.rows[0]!;

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
