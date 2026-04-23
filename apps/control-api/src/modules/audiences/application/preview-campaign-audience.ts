import type { Pool } from "pg";

// import { systemConfig } from "shared";

import { findCampaignById } from "../../campaigns/repositories/campaign-repository.js";
import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import type { AudiencePreviewResult } from "./shared.js";

type PreviewCampaignAudienceDependencies = {
  pgPool: Pool;
  registry: LeadSourceProviderRegistry;
};

export type PreviewCampaignAudienceInput = {
  campaignId: string;
  limit: number;
};

export type PreviewCampaignAudienceResult =
  | { kind: "not_found" }
  | { kind: "audience_not_defined" }
  | { kind: "resolved"; preview: AudiencePreviewResult };

export async function previewCampaignAudience(
  dependencies: PreviewCampaignAudienceDependencies,
  input: PreviewCampaignAudienceInput,
): Promise<PreviewCampaignAudienceResult> {
  const campaign = await findCampaignById(
    dependencies.pgPool,
    input.campaignId,
  );

  if (!campaign) {
    return { kind: "not_found" };
  }

  if (!campaign.audienceSourceType) {
    return { kind: "audience_not_defined" };
  }

  const items = await dependencies.registry.resolveRecipients({
    sourceType: campaign.audienceSourceType,
    filters: campaign.audienceFilters ?? {},
    limit: input.limit,
  });

  return {
    kind: "resolved",
    preview: {
      items,
      count: items.length,
      sourceType: campaign.audienceSourceType,
      appliedLimit: input.limit,
    },
  };
}
