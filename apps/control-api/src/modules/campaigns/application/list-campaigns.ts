import type { Pool } from "pg";

import type { CampaignStatus, LeadSourceType } from "core";

import { buildCampaignListResult, type CampaignListResult } from "./shared.js";
import { listCampaignsPage } from "../repositories/campaign-repository.js";

type ListCampaignsDependencies = {
  pgPool: Pool;
};

export type ListCampaignsFilters = {
  page: number;
  pageSize: number;
  status?: CampaignStatus | undefined;
  sourceType?: LeadSourceType | undefined;
};

export async function listCampaigns(
  dependencies: ListCampaignsDependencies,
  filters: ListCampaignsFilters,
): Promise<CampaignListResult> {
  const result = await listCampaignsPage(dependencies.pgPool, filters);

  return buildCampaignListResult({
    rows: result.items,
    page: filters.page,
    pageSize: filters.pageSize,
    total: result.total,
  });
}
