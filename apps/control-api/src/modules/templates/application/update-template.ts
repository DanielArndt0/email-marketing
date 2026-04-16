import type { Pool } from "pg";

type UpdateTemplateDependencies = {
  pgPool: Pool;
};

export type UpdateTemplateInput = {
  id: string;
  name?: string | undefined;
  subject?: string | undefined;
  htmlContent?: string | null | undefined;
  textContent?: string | null | undefined;
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

export type UpdateTemplateResult =
  | {
      kind: "not_found";
    }
  | {
      kind: "updated";
      template: {
        id: string;
        name: string;
        subject: string;
        htmlContent: string | null;
        textContent: string | null;
        createdAt: string;
        updatedAt: string;
      };
    };

function normalizeDateValue(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export async function updateTemplate(
  dependencies: UpdateTemplateDependencies,
  input: UpdateTemplateInput,
): Promise<UpdateTemplateResult> {
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

  fields.push(`updated_at = NOW()`);

  values.push(input.id);

  const result = await dependencies.pgPool.query<RawTemplateRow>(
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
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values,
  );

  const row = result.rows[0];

  if (!row) {
    return {
      kind: "not_found",
    };
  }

  return {
    kind: "updated",
    template: {
      id: row.id,
      name: row.name,
      subject: row.subject,
      htmlContent: row.htmlContent,
      textContent: row.textContent,
      createdAt: normalizeDateValue(row.createdAt),
      updatedAt: normalizeDateValue(row.updatedAt),
    },
  };
}
