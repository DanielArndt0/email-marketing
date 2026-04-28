import type { Queue } from "bullmq";
import type { Pool } from "pg";

import type { EmailDispatchJobData } from "shared";

import type { LeadSourceProviderRegistry } from "../../audiences/adapters/lead-source-provider-registry.js";
import {
  dispatchCampaign,
  type DispatchCampaignResult,
} from "./dispatch-campaign.js";

type DispatchCampaignsBatchDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
  providerRegistry: LeadSourceProviderRegistry;
};

export type DispatchCampaignsBatchInput = {
  campaignIds: string[];
  limitPerCampaign?: number | undefined;
};

export type DispatchCampaignsBatchResult = {
  status: "accepted";
  items: DispatchCampaignResult[];
};

export async function dispatchCampaignsBatch(
  dependencies: DispatchCampaignsBatchDependencies,
  input: DispatchCampaignsBatchInput,
): Promise<DispatchCampaignsBatchResult> {
  const items: DispatchCampaignResult[] = [];

  for (const campaignId of input.campaignIds) {
    const result = await dispatchCampaign(dependencies, {
      campaignId,
      limit: input.limitPerCampaign,
    });

    items.push(result);
  }

  return {
    status: "accepted",
    items,
  };
}
