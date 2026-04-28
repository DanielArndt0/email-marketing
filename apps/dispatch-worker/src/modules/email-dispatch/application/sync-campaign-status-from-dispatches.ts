import type { Pool } from "pg";

import type { CampaignStatus } from "core";

import {
  findCampaignStatusById,
  getCampaignDispatchStatusSummary,
  updateCampaignStatusById,
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

  if (currentStatus !== "running") {
    return;
  }

  const summary = await getCampaignDispatchStatusSummary(
    dependencies.pgPool,
    campaignId,
  );

  if (summary.total === 0) {
    return;
  }

  const activeCount = summary.pending + summary.queued + summary.processing;

  if (activeCount > 0) {
    return;
  }

  const nextStatus: CampaignStatus = summary.sent > 0 ? "completed" : "failed";

  await updateCampaignStatusById(dependencies.pgPool, campaignId, nextStatus);
}
