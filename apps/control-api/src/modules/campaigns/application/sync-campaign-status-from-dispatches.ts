import type { Pool } from "pg";

import type { CampaignStatus } from "core";

import {
  findCampaignStatusById,
  getCampaignDispatchStatusSummary,
  updateCampaignStatusById,
} from "../repositories/campaign-repository.js";

type SyncCampaignStatusDependencies = {
  pgPool: Pool;
};

export type SyncCampaignStatusResult =
  | {
      kind: "not_found";
    }
  | {
      kind: "not_changed";
      status: CampaignStatus;
    }
  | {
      kind: "updated";
      status: CampaignStatus;
    };

export async function syncCampaignStatusFromDispatches(
  dependencies: SyncCampaignStatusDependencies,
  campaignId: string,
): Promise<SyncCampaignStatusResult> {
  const currentStatus = await findCampaignStatusById(
    dependencies.pgPool,
    campaignId,
  );

  if (!currentStatus) {
    return {
      kind: "not_found",
    };
  }

  if (currentStatus !== "running") {
    return {
      kind: "not_changed",
      status: currentStatus,
    };
  }

  const summary = await getCampaignDispatchStatusSummary(
    dependencies.pgPool,
    campaignId,
  );

  if (summary.total === 0) {
    return {
      kind: "not_changed",
      status: currentStatus,
    };
  }

  const activeCount = summary.pending + summary.queued + summary.processing;

  if (activeCount > 0) {
    return {
      kind: "not_changed",
      status: currentStatus,
    };
  }

  const nextStatus: CampaignStatus = summary.sent > 0 ? "completed" : "failed";

  await updateCampaignStatusById(dependencies.pgPool, campaignId, nextStatus);

  return {
    kind: "updated",
    status: nextStatus,
  };
}
