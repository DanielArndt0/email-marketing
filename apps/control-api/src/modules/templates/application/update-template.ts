import type { Pool } from "pg";

import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import { updateTemplateById } from "../repositories/template-repository.js";

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
    template: {
      id: row.id,
      name: row.name,
      subject: row.subject,
      htmlContent: row.htmlContent,
      textContent: row.textContent,
      createdAt: normalizeDateValue(row.createdAt) ?? "",
      updatedAt: normalizeDateValue(row.updatedAt) ?? "",
    },
  };
}
