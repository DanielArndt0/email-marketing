import type { Pool } from "pg";

import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import { insertTemplate } from "../repositories/template-repository.js";

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

export async function createTemplate(
  dependencies: CreateTemplateDependencies,
  input: CreateTemplateInput,
): Promise<CreateTemplateResult> {
  const row = await insertTemplate(dependencies.pgPool, input);

  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    htmlContent: row.htmlContent,
    textContent: row.textContent,
    createdAt: normalizeDateValue(row.createdAt) ?? "",
    updatedAt: normalizeDateValue(row.updatedAt) ?? "",
  };
}
