import type { Pool } from "pg";

import { findCampaignById } from "../repositories/campaign-repository.js";
import { mapCampaign, type CampaignViewModel } from "./create-campaign.js";

type GetCampaignByIdDependencies = {
  pgPool: Pool;
};

export async function getCampaignById(
  dependencies: GetCampaignByIdDependencies,
  id: string,
): Promise<CampaignViewModel | null> {
  const campaign = await findCampaignById(dependencies.pgPool, id);

  return campaign ? mapCampaign(campaign) : null;
}
