import type { Pool } from "pg";

import {
  deriveCampaignStatusFromDispatchSummary,
  type CampaignStatus,
} from "core";

import {
  findCampaignStatusById,
  getCampaignDispatchStatusSummary,
  transitionCampaignStatusById,
} from "../repositories/campaign-repository.js";

type SyncCampaignStatusDependencies = {
  pgPool: Pool;
};

export type SyncCampaignStatusResult =
  | { kind: "not_found" }
  | { kind: "not_changed"; status: CampaignStatus }
  | {
      kind: "status_conflict";
      expectedStatus: CampaignStatus;
      requestedStatus: CampaignStatus;
    }
  | { kind: "updated"; status: CampaignStatus };

export async function syncCampaignStatusFromDispatches(
  dependencies: SyncCampaignStatusDependencies,
  campaignId: string,
): Promise<SyncCampaignStatusResult> {
  const currentStatus = await findCampaignStatusById(
    dependencies.pgPool,
    campaignId,
  );

  if (!currentStatus) {
    return { kind: "not_found" };
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
    return { kind: "not_changed", status: currentStatus };
  }

  const transitioned = await transitionCampaignStatusById(dependencies.pgPool, {
    campaignId,
    from: currentStatus,
    to: nextStatus,
  });

  if (!transitioned) {
    return {
      kind: "status_conflict",
      expectedStatus: currentStatus,
      requestedStatus: nextStatus,
    };
  }

  return { kind: "updated", status: nextStatus };
}
