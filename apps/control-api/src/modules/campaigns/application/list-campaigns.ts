import type { Pool } from "pg";

import type { CampaignStatus } from "core";
import { systemConfig } from "shared";

import { listCampaignsPage } from "../repositories/campaign-repository.js";
import { buildCampaignListResult, type CampaignListResult } from "./shared.js";

const paginationConfig = systemConfig.api.pagination.campaigns;

type ListCampaignsDependencies = {
  pgPool: Pool;
};

export type ListCampaignsInput = {
  page?: number | undefined;
  pageSize?: number | undefined;
  status?: CampaignStatus | undefined;
  audienceId?: string | undefined;
};

export async function listCampaigns(
  dependencies: ListCampaignsDependencies,
  input: ListCampaignsInput,
): Promise<CampaignListResult> {
  const page = input.page ?? paginationConfig.defaultPage;
  const pageSize = input.pageSize ?? paginationConfig.defaultPageSize;

  const result = await listCampaignsPage(dependencies.pgPool, {
    page,
    pageSize,
    status: input.status,
    audienceId: input.audienceId,
  });

  return buildCampaignListResult({
    rows: result.items,
    page,
    pageSize,
    total: result.total,
  });
}
