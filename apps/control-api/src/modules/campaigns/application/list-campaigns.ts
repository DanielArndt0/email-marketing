import type { Pool } from "pg";

import type { CampaignStatus } from "core";

import { buildPaginationMeta } from "../../../shared/persistence/build-pagination-meta.js";
import { listCampaignsPage } from "../repositories/campaign-repository.js";
import { mapCampaign, type CampaignViewModel } from "./create-campaign.js";

type ListCampaignsDependencies = {
  pgPool: Pool;
};

export type ListCampaignsFilters = {
  page: number;
  pageSize: number;
  status?: CampaignStatus | undefined;
};

export type ListCampaignsResult = {
  items: CampaignViewModel[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function listCampaigns(
  dependencies: ListCampaignsDependencies,
  filters: ListCampaignsFilters,
): Promise<ListCampaignsResult> {
  const { items, total } = await listCampaignsPage(
    dependencies.pgPool,
    filters,
  );

  return {
    items: items.map(mapCampaign),
    ...buildPaginationMeta({
      page: filters.page,
      pageSize: filters.pageSize,
      total,
    }),
  };
}
