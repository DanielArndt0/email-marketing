import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import type { TemplateVariable } from "core";

export type RawTemplateRow = {
  id: string;
  name: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  variables: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type CountRow = { total: string };

type TemplateMutationInput = {
  name: string;
  subject: string;
  htmlContent?: string | undefined;
  textContent?: string | undefined;
  variables?: TemplateVariable[] | undefined;
};

export async function insertTemplate(
  pgPool: Pool,
  input: TemplateMutationInput,
): Promise<RawTemplateRow> {
  const id = randomUUID();

  const result = await pgPool.query<RawTemplateRow>(
    `
      INSERT INTO templates (
        id,
        name,
        subject,
        html_content,
        text_content,
        variables
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      RETURNING
        id,
        name,
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent",
        variables,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      id,
      input.name,
      input.subject,
      input.htmlContent ?? null,
      input.textContent ?? null,
      JSON.stringify(input.variables ?? []),
    ],
  );

  return result.rows[0]!;
}

export async function listTemplatesPage(
  pgPool: Pool,
  input: { page: number; pageSize: number },
): Promise<{ items: RawTemplateRow[]; total: number }> {
  const offset = (input.page - 1) * input.pageSize;

  const countResult = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM templates
    `,
  );

  const listResult = await pgPool.query<RawTemplateRow>(
    `
      SELECT
        id,
        name,
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent",
        variables,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM templates
      ORDER BY created_at DESC
      LIMIT $1
      OFFSET $2
    `,
    [input.pageSize, offset],
  );

  return {
    items: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? "0"),
  };
}

export async function findTemplateById(
  pgPool: Pool,
  id: string,
): Promise<RawTemplateRow | null> {
  const result = await pgPool.query<RawTemplateRow>(
    `
      SELECT
        id,
        name,
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent",
        variables,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM templates
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function updateTemplateById(
  pgPool: Pool,
  input: {
    id: string;
    name?: string | undefined;
    subject?: string | undefined;
    htmlContent?: string | null | undefined;
    textContent?: string | null | undefined;
    variables?: TemplateVariable[] | undefined;
  },
): Promise<RawTemplateRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    values.push(input.name);
    fields.push(`name = $${values.length}`);
  }

  if (input.subject !== undefined) {
    values.push(input.subject);
    fields.push(`subject = $${values.length}`);
  }

  if (input.htmlContent !== undefined) {
    values.push(input.htmlContent);
    fields.push(`html_content = $${values.length}`);
  }

  if (input.textContent !== undefined) {
    values.push(input.textContent);
    fields.push(`text_content = $${values.length}`);
  }

  if (input.variables !== undefined) {
    values.push(JSON.stringify(input.variables));
    fields.push(`variables = $${values.length}::jsonb`);
  }

  fields.push(`updated_at = NOW()`);
  values.push(input.id);

  const result = await pgPool.query<RawTemplateRow>(
    `
      UPDATE templates
      SET ${fields.join(", ")}
      WHERE id = $${values.length}
      RETURNING
        id,
        name,
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent",
        variables,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values,
  );

  return result.rows[0] ?? null;
}

export async function countTemplateDispatchLinks(
  pgPool: Pool,
  templateId: string,
): Promise<number> {
  const result = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM email_dispatches
      WHERE template_id = $1
    `,
    [templateId],
  );

  return Number(result.rows[0]?.total ?? "0");
}

export async function deleteTemplateById(
  pgPool: Pool,
  id: string,
): Promise<boolean> {
  const result = await pgPool.query(
    `
      DELETE FROM templates
      WHERE id = $1
    `,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}
