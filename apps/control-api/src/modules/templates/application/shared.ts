import {
  extractTemplateVariablesFromContent,
  validateTemplateVariables,
  type TemplateVariable,
  type TemplateVariableValidation,
} from "core";

import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import type { RawTemplateRow } from "../repositories/template-repository.js";

export type TemplateRecord = {
  id: string;
  name: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  variables: TemplateVariable[];
  detectedVariables: string[];
  variableValidation: TemplateVariableValidation;
  createdAt: string;
  updatedAt: string;
};

function normalizeTemplateVariables(value: unknown): TemplateVariable[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => {
      return typeof item === "object" && item !== null;
    })
    .map((item) => ({
      key: typeof item.key === "string" ? item.key.trim() : "",
      label: typeof item.label === "string" ? item.label : undefined,
      required: typeof item.required === "boolean" ? item.required : undefined,
      description:
        typeof item.description === "string" ? item.description : undefined,
      example: typeof item.example === "string" ? item.example : undefined,
    }))
    .filter((variable) => variable.key.length > 0);
}

export function mapTemplateRow(row: RawTemplateRow): TemplateRecord {
  const variables = normalizeTemplateVariables(row.variables);
  const detectedVariables = extractTemplateVariablesFromContent([
    row.subject,
    row.htmlContent,
    row.textContent,
  ]);

  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    htmlContent: row.htmlContent,
    textContent: row.textContent,
    variables,
    detectedVariables,
    variableValidation: validateTemplateVariables({
      declaredVariables: variables,
      detectedVariables,
    }),
    createdAt: normalizeDateValue(row.createdAt) ?? "",
    updatedAt: normalizeDateValue(row.updatedAt) ?? "",
  };
}
