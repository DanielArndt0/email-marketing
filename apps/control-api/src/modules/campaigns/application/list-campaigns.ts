import type { Pool } from "pg";

import type { CampaignStatus } from "core";

import { listCampaignsPage } from "../repositories/campaign-repository.js";
import { buildCampaignListResult, type CampaignListResult } from "./shared.js";

type ListCampaignsDependencies = {
  pgPool: Pool;
};

export type ListCampaignsFilters = {
  page: number;
  pageSize: number;
  status?: CampaignStatus | undefined;
};

export type ListCampaignsResult = CampaignListResult;

export async function listCampaigns(
  dependencies: ListCampaignsDependencies,
  filters: ListCampaignsFilters,
): Promise<ListCampaignsResult> {
  const { items, total } = await listCampaignsPage(
    dependencies.pgPool,
    filters,
  );

  return buildCampaignListResult({
    rows: items,
    page: filters.page,
    pageSize: filters.pageSize,
    total,
  });
}
