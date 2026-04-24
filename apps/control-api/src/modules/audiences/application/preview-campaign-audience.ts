import type { Pool } from "pg";
import { systemConfig } from "shared";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { findAudienceById } from "../repositories/audience-repository.js";
import { resolveAudience, type ResolveAudienceResult } from "./resolve-audience.js";

type PreviewCampaignAudienceDependencies = {
  pgPool: Pool;
  providerRegistry: LeadSourceProviderRegistry;
};

type RawCampaignAudienceRow = {
  campaignId: string;
  audienceId: string | null;
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
  input: { campaignId: string; limit?: number | undefined; page?: number | undefined },
): Promise<PreviewCampaignAudienceResult> {
  const campaignResult = await dependencies.pgPool.query<RawCampaignAudienceRow>(
    `
      SELECT
        id AS "campaignId",
        audience_id AS "audienceId"
      FROM campaigns
      WHERE id = $1
      LIMIT 1
    `,
    [input.campaignId],
  );

  const campaign = campaignResult.rows[0];

  if (!campaign) {
    return { kind: "campaign_not_found" };
  }

  if (!campaign.audienceId) {
    return { kind: "campaign_without_audience" };
  }

  const audience = await findAudienceById(dependencies.pgPool, campaign.audienceId);

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
      limit: input.limit ?? systemConfig.api.preview.defaultRecipientsLimit,
      page: input.page ?? 1,
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
