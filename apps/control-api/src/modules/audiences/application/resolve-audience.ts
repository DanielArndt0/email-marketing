// import type { LeadRecipient } from "core";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import type { AudiencePreviewResult } from "./shared.js";

type ResolveAudienceDependencies = {
  registry: LeadSourceProviderRegistry;
};

export type ResolveAudienceInput = {
  sourceType: string;
  filters: Record<string, unknown>;
  limit: number;
};

export async function resolveAudience(
  dependencies: ResolveAudienceDependencies,
  input: ResolveAudienceInput,
): Promise<AudiencePreviewResult> {
  const items = await dependencies.registry.resolveRecipients({
    sourceType: input.sourceType,
    filters: input.filters,
    limit: input.limit,
  });

  return {
    items,
    count: items.length,
    sourceType: input.sourceType,
    appliedLimit: input.limit,
  };
}
