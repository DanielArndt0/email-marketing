import type { Pool } from "pg";

import { findCampaignAudienceLinkById } from "../../campaigns/repositories/campaign-repository.js";
import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { findAudienceById } from "../repositories/audience-repository.js";
import {
  resolveAudience,
  type ResolveAudienceResult,
} from "./resolve-audience.js";

type PreviewCampaignAudienceDependencies = {
  pgPool: Pool;
  providerRegistry: LeadSourceProviderRegistry;
};

export type PreviewCampaignAudienceResult =
  | { kind: "campaign_not_found" }
  | { kind: "campaign_without_audience" }
  | { kind: "audience_not_found" }
  | {
      kind: "resolved";
      preview: ResolveAudienceResult & {
        campaignId: string;
        audienceId: string;
      };
    };

export async function previewCampaignAudience(
  dependencies: PreviewCampaignAudienceDependencies,
  input: { campaignId: string },
): Promise<PreviewCampaignAudienceResult> {
  const campaign = await findCampaignAudienceLinkById(
    dependencies.pgPool,
    input.campaignId,
  );

  if (!campaign) {
    return { kind: "campaign_not_found" };
  }

  if (!campaign.audienceId) {
    return { kind: "campaign_without_audience" };
  }

  const audience = await findAudienceById(
    dependencies.pgPool,
    campaign.audienceId,
  );

  if (!audience) {
    return { kind: "audience_not_found" };
  }

  const preview = await resolveAudience(
    {
      providerRegistry: dependencies.providerRegistry,
    },
    {
      sourceType: audience.sourceType as never,
      filters: audience.filters,
    },
  );

  return {
    kind: "resolved",
    preview: {
      campaignId: campaign.campaignId,
      audienceId: audience.id,
      ...preview,
    },
  };
}
