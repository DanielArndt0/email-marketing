import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import type { TemplateVariable } from "core";

import {
  addUpdateAssignment,
  readCount,
} from "../../../shared/persistence/sql-builders.js";

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

const TEMPLATE_COLUMNS = `
  id,
  name,
  subject,
  html_content AS "htmlContent",
  text_content AS "textContent",
  variables,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

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
      RETURNING ${TEMPLATE_COLUMNS}
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
      SELECT ${TEMPLATE_COLUMNS}
      FROM templates
      ORDER BY created_at DESC
      LIMIT $1
      OFFSET $2
    `,
    [input.pageSize, offset],
  );

  return {
    items: listResult.rows,
    total: readCount(countResult.rows[0]),
  };
}

export async function findTemplateById(
  pgPool: Pool,
  id: string,
): Promise<RawTemplateRow | null> {
  const result = await pgPool.query<RawTemplateRow>(
    `
      SELECT ${TEMPLATE_COLUMNS}
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
  const assignments: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "name",
      value: input.name,
    });
  }

  if (input.subject !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "subject",
      value: input.subject,
    });
  }

  if (input.htmlContent !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "html_content",
      value: input.htmlContent,
    });
  }

  if (input.textContent !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "text_content",
      value: input.textContent,
    });
  }

  if (input.variables !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "variables",
      value: JSON.stringify(input.variables),
      cast: "::jsonb",
    });
  }

  if (assignments.length === 0) {
    return findTemplateById(pgPool, input.id);
  }

  assignments.push("updated_at = NOW()");
  values.push(input.id);

  const result = await pgPool.query<RawTemplateRow>(
    `
      UPDATE templates
      SET ${assignments.join(", ")}
      WHERE id = $${values.length}
      RETURNING ${TEMPLATE_COLUMNS}
    `,
    values,
  );

  return result.rows[0] ?? null;
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

export async function countCampaignsByTemplateId(
  pgPool: Pool,
  templateId: string,
): Promise<number> {
  const result = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM campaigns
      WHERE template_id = $1
    `,
    [templateId],
  );

  return readCount(result.rows[0]);
}
