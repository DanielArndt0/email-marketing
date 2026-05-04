import type { LeadRecipient, TemplateVariableMappings } from "core";

import type { TemplateVariables } from "shared";

const variableKeyRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;

const rootLeadPaths = new Set(["email", "externalId", "sourceType"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidVariableKey(key: string): boolean {
  return variableKeyRegex.test(key);
}

function isValidLeadPath(path: string): boolean {
  if (rootLeadPaths.has(path)) {
    return true;
  }

  return /^metadata\.[a-zA-Z][a-zA-Z0-9_]*$/.test(path);
}

function getRootLeadValue(lead: LeadRecipient, path: string): unknown {
  if (path === "email") {
    return lead.email;
  }

  if (path === "externalId") {
    return lead.externalId;
  }

  if (path === "sourceType") {
    return lead.sourceType;
  }

  return undefined;
}

function getMetadataValue(lead: LeadRecipient, path: string): unknown {
  if (!isRecord(lead.metadata)) {
    return undefined;
  }

  const metadataKey = path.replace("metadata.", "");

  return lead.metadata[metadataKey];
}

function resolveLeadMappingValue(lead: LeadRecipient, path: string): unknown {
  const normalizedPath = path.trim();

  if (!isValidLeadPath(normalizedPath)) {
    return undefined;
  }

  if (rootLeadPaths.has(normalizedPath)) {
    return getRootLeadValue(lead, normalizedPath);
  }

  return getMetadataValue(lead, normalizedPath);
}

function toTemplateVariableValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

export function resolveTemplateVariablesFromLead(
  mappings: TemplateVariableMappings,
  lead: LeadRecipient,
): TemplateVariables {
  const variables: TemplateVariables = {};

  for (const [rawVariableKey, mapping] of Object.entries(mappings)) {
    const variableKey = rawVariableKey.trim();

    if (!isValidVariableKey(variableKey)) {
      continue;
    }

    if (mapping.source === "static") {
      const value = toTemplateVariableValue(mapping.value);

      if (value !== undefined) {
        variables[variableKey] = value;
      }

      continue;
    }

    const value = toTemplateVariableValue(
      resolveLeadMappingValue(lead, mapping.path),
    );

    if (value !== undefined) {
      variables[variableKey] = value;
      continue;
    }

    const fallback = toTemplateVariableValue(mapping.fallback);

    if (fallback !== undefined) {
      variables[variableKey] = fallback;
    }
  }

  return variables;
}
