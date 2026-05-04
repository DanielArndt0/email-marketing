import type { Pool } from "pg";

import { deriveCampaignStatusFromDispatchSummary } from "core";

import {
  findCampaignStatusById,
  getCampaignDispatchStatusSummary,
  transitionCampaignStatusById,
} from "../repositories/campaign-status-repository.js";

type SyncCampaignStatusDependencies = {
  pgPool: Pool;
};

export async function syncCampaignStatusFromDispatches(
  dependencies: SyncCampaignStatusDependencies,
  campaignId: string,
): Promise<void> {
  const currentStatus = await findCampaignStatusById(
    dependencies.pgPool,
    campaignId,
  );

  if (!currentStatus) {
    return;
  }

  const summary = await getCampaignDispatchStatusSummary(
    dependencies.pgPool,
    campaignId,
  );

  const nextStatus = deriveCampaignStatusFromDispatchSummary({
    currentStatus,
    summary,
  });

  if (!nextStatus) {
    return;
  }

  await transitionCampaignStatusById(dependencies.pgPool, {
    campaignId,
    from: currentStatus,
    to: nextStatus,
  });
}
