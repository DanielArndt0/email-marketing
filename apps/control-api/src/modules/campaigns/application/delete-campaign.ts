import type { Pool } from "pg";

import {
  countEmailDispatchesByCampaignId,
  deleteCampaignById,
  findCampaignById,
} from "../repositories/campaign-repository.js";

type DeleteCampaignDependencies = {
  pgPool: Pool;
};

export type DeleteCampaignResult =
  | { kind: "not_found" }
  | { kind: "in_use"; dispatchesCount: number }
  | { kind: "deleted"; id: string };

export async function deleteCampaign(
  dependencies: DeleteCampaignDependencies,
  id: string,
): Promise<DeleteCampaignResult> {
  const campaign = await findCampaignById(dependencies.pgPool, id);

  if (!campaign) {
    return { kind: "not_found" };
  }

  const dispatchesCount = await countEmailDispatchesByCampaignId(
    dependencies.pgPool,
    id,
  );

  if (dispatchesCount > 0) {
    return {
      kind: "in_use",
      dispatchesCount,
    };
  }

  await deleteCampaignById(dependencies.pgPool, id);

  return {
    kind: "deleted",
    id,
  };
}
