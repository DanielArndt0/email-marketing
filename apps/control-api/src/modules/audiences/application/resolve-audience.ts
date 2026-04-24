import type { LeadRecipient, LeadSourceType } from "core";
import { parseLeadSourceType } from "core";
import { systemConfig } from "shared";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";

type ResolveAudienceDependencies = {
  providerRegistry: LeadSourceProviderRegistry;
};

export type ResolveAudienceInput = {
  sourceType: LeadSourceType;
  filters: Record<string, unknown>;
  limit?: number | undefined;
};

export type ResolveAudienceResult = {
  items: LeadRecipient[];
  count: number;
  sourceType: LeadSourceType;
  requestedLimit: number;
};

function getPositiveInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number(value);
    return parsed > 0 ? parsed : undefined;
  }

  return undefined;
}

function resolveRequestedLimit(input: ResolveAudienceInput): number {
  const configuredLimit =
    input.limit ??
    getPositiveInteger(input.filters.limit) ??
    systemConfig.api.preview.defaultRecipientsLimit;

  return Math.min(configuredLimit, systemConfig.api.preview.maxRecipientsLimit);
}

export async function resolveAudience(
  dependencies: ResolveAudienceDependencies,
  input: ResolveAudienceInput,
): Promise<ResolveAudienceResult> {
  const requestedLimit = resolveRequestedLimit(input);
  const sourceType = parseLeadSourceType(input.sourceType);
  const provider = dependencies.providerRegistry.get(sourceType);

  const items = await provider.resolveRecipients({
    filters: input.filters,
    limit: requestedLimit,
  });

  return {
    items,
    count: items.length,
    sourceType,
    requestedLimit,
  };
}
