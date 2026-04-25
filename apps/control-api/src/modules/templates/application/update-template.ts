import type { Pool } from "pg";

import type { TemplateVariable } from "core";

import { updateTemplateById } from "../repositories/template-repository.js";
import { mapTemplateRow, type TemplateRecord } from "./shared.js";

type UpdateTemplateDependencies = {
  pgPool: Pool;
};

export type UpdateTemplateInput = {
  id: string;
  name?: string | undefined;
  subject?: string | undefined;
  htmlContent?: string | null | undefined;
  textContent?: string | null | undefined;
  variables?: TemplateVariable[] | undefined;
};

export type UpdateTemplateResult =
  | {
      kind: "not_found";
    }
  | {
      kind: "updated";
      template: TemplateRecord;
    };

export async function updateTemplate(
  dependencies: UpdateTemplateDependencies,
  input: UpdateTemplateInput,
): Promise<UpdateTemplateResult> {
  const row = await updateTemplateById(dependencies.pgPool, input);

  if (!row) {
    return {
      kind: "not_found",
    };
  }

  return {
    kind: "updated",
    template: mapTemplateRow(row),
  };
}
