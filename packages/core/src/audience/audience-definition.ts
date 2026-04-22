import type { LeadSourceType } from "./lead-source-type.js";

export type AudienceFilters = Record<string, unknown>;

export type AudienceDefinition = {
  sourceType: LeadSourceType;
  filters: AudienceFilters;
};

export function createAudienceDefinition(input: {
  sourceType: LeadSourceType;
  filters?: AudienceFilters;
}): AudienceDefinition {
  return {
    sourceType: input.sourceType,
    filters: input.filters ?? {},
  };
}
