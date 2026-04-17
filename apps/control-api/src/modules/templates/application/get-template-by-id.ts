import type { Pool } from "pg";

import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import { findTemplateById } from "../repositories/template-repository.js";

type GetTemplateByIdDependencies = {
  pgPool: Pool;
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

export async function getTemplateById(
  dependencies: GetTemplateByIdDependencies,
  id: string,
): Promise<TemplateDetails | null> {
  const row = await findTemplateById(dependencies.pgPool, id);

  if (!row) {
    return null;
  }

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
