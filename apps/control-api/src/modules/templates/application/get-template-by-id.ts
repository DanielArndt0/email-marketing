import type { Pool } from "pg";

import { findTemplateById } from "../repositories/template-repository.js";
import { mapTemplateRow, type TemplateRecord } from "./shared.js";

type GetTemplateByIdDependencies = {
  pgPool: Pool;
};

export async function getTemplateById(
  dependencies: GetTemplateByIdDependencies,
  id: string,
): Promise<TemplateRecord | null> {
  const row = await findTemplateById(dependencies.pgPool, id);

  return row ? mapTemplateRow(row) : null;
}
