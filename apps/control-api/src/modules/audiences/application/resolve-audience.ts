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

export async function resolveAudience(
  dependencies: ResolveAudienceDependencies,
  input: ResolveAudienceInput,
): Promise<ResolveAudienceResult> {
  const limit = input.limit ?? systemConfig.api.preview.defaultRecipientsLimit;
  const boundedLimit = Math.min(
    limit,
    systemConfig.api.preview.maxRecipientsLimit,
  );
  const sourceType = parseLeadSourceType(input.sourceType);

  const provider = dependencies.providerRegistry.get(sourceType);
  const items = await provider.resolveRecipients({
    filters: input.filters,
    limit: boundedLimit,
  });

  return {
    items,
    count: items.length,
    sourceType,
    requestedLimit: boundedLimit,
  };
}
