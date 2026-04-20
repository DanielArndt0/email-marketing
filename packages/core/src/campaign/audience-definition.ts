import type { LeadSourceType } from "./lead-source-type.js";

export type AudienceFilters = Record<string, unknown>;

export type AudienceDefinition = {
  sourceType: LeadSourceType | null;
  filters: AudienceFilters;
};

export function createAudienceDefinition(input?: {
  sourceType?: LeadSourceType | null | undefined;
  filters?: AudienceFilters | null | undefined;
}): AudienceDefinition {
  return {
    sourceType: input?.sourceType ?? null,
    filters: input?.filters ?? {},
  };
}
