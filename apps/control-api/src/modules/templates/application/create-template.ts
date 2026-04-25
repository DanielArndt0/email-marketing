import type { Pool } from "pg";

import type { TemplateVariable } from "core";

import { insertTemplate } from "../repositories/template-repository.js";
import { mapTemplateRow, type TemplateRecord } from "./shared.js";

type CreateTemplateDependencies = {
  pgPool: Pool;
};

export type CreateTemplateInput = {
  name: string;
  subject: string;
  htmlContent?: string | undefined;
  textContent?: string | undefined;
  variables?: TemplateVariable[] | undefined;
};

export async function createTemplate(
  dependencies: CreateTemplateDependencies,
  input: CreateTemplateInput,
): Promise<TemplateRecord> {
  const row = await insertTemplate(dependencies.pgPool, input);

  return mapTemplateRow(row);
}
