import type { Pool } from "pg";

import { findCampaignById } from "../repositories/campaign-repository.js";
import { mapCampaignRow, type CampaignRecord } from "./shared.js";

type GetCampaignByIdDependencies = {
  pgPool: Pool;
};

export async function getCampaignById(
  dependencies: GetCampaignByIdDependencies,
  id: string,
): Promise<CampaignRecord | null> {
  const row = await findCampaignById(dependencies.pgPool, id);
  return row ? mapCampaignRow(row) : null;
}
