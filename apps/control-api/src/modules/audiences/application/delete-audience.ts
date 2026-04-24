import type { Pool } from "pg";

import {
  countAudienceCampaignLinks,
  deleteAudienceById,
  findAudienceById,
} from "../repositories/audience-repository.js";

type DeleteAudienceDependencies = {
  pgPool: Pool;
};

export type DeleteAudienceResult =
  | { kind: "not_found" }
  | { kind: "in_use"; campaignsCount: number }
  | { kind: "deleted"; id: string };

export async function deleteAudience(
  dependencies: DeleteAudienceDependencies,
  id: string,
): Promise<DeleteAudienceResult> {
  const audience = await findAudienceById(dependencies.pgPool, id);

  if (!audience) {
    return { kind: "not_found" };
  }

  const campaignsCount = await countAudienceCampaignLinks(
    dependencies.pgPool,
    id,
  );

  if (campaignsCount > 0) {
    return {
      kind: "in_use",
      campaignsCount,
    };
  }

  await deleteAudienceById(dependencies.pgPool, id);

  return {
    kind: "deleted",
    id,
  };
}
