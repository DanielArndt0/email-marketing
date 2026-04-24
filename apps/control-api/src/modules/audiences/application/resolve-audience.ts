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
  page?: number | undefined;
};

export type ResolveAudienceResult = {
  items: LeadRecipient[];
  count: number;
  sourceType: LeadSourceType;
  requestedLimit: number;
  requestedPage: number;
};

export async function resolveAudience(
  dependencies: ResolveAudienceDependencies,
  input: ResolveAudienceInput,
): Promise<ResolveAudienceResult> {
  const limit = input.limit ?? systemConfig.api.preview.defaultRecipientsLimit;
  const boundedLimit = Math.min(limit, systemConfig.api.preview.maxRecipientsLimit);
  const sourceType = parseLeadSourceType(input.sourceType);
  const page = typeof input.page === "number" && input.page > 0 ? Math.trunc(input.page) : 1;

  const provider = dependencies.providerRegistry.get(sourceType);
  const items = await provider.resolveRecipients({
    filters: input.filters,
    limit: boundedLimit,
    page,
  });

  return {
    items,
    count: items.length,
    sourceType,
    requestedLimit: boundedLimit,
    requestedPage: page,
  };
}
