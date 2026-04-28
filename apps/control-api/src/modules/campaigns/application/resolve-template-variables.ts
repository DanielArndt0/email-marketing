import type { LeadRecipient, TemplateVariableMappings } from "core";

import type { TemplateVariables } from "shared";

function getValueByPath(
  source: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, source);
}

function toTemplateVariableValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function buildLeadVariableSource(lead: LeadRecipient): Record<string, unknown> {
  return {
    email: lead.email,
    externalId: lead.externalId,
    sourceType: lead.sourceType,
    metadata: lead.metadata,
  };
}

function resolveLeadMappingValue(lead: LeadRecipient, path: string): unknown {
  const leadSource = buildLeadVariableSource(lead);

  return getValueByPath(leadSource, path);
}

export function resolveTemplateVariablesFromLead(
  mappings: TemplateVariableMappings,
  lead: LeadRecipient,
): TemplateVariables {
  const variables: TemplateVariables = {};

  for (const [variableKey, mapping] of Object.entries(mappings)) {
    if (mapping.source === "static") {
      variables[variableKey] = mapping.value;
      continue;
    }

    const value = toTemplateVariableValue(
      resolveLeadMappingValue(lead, mapping.path),
    );

    if (value !== undefined) {
      variables[variableKey] = value;
      continue;
    }

    if (mapping.fallback !== undefined) {
      variables[variableKey] = mapping.fallback;
    }
  }

  return variables;
}
