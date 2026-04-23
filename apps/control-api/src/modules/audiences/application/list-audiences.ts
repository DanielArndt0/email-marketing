import type { Pool } from "pg";

import type { LeadSourceType } from "core";
import { systemConfig } from "shared";

import { listAudiencesPage } from "../repositories/audience-repository.js";
import { buildAudienceListResult, type AudienceListResult } from "./shared.js";

const paginationConfig = systemConfig.api.pagination.audiences;

type ListAudiencesDependencies = {
  pgPool: Pool;
};

export type ListAudiencesInput = {
  page?: number | undefined;
  pageSize?: number | undefined;
  sourceType?: LeadSourceType | undefined;
};

export async function listAudiences(
  dependencies: ListAudiencesDependencies,
  input: ListAudiencesInput,
): Promise<AudienceListResult> {
  const page = input.page ?? paginationConfig.defaultPage;
  const pageSize = input.pageSize ?? paginationConfig.defaultPageSize;
  const result = await listAudiencesPage(dependencies.pgPool, {
    page,
    pageSize,
    sourceType: input.sourceType,
  });

  return buildAudienceListResult({
    rows: result.items,
    page,
    pageSize,
    total: result.total,
  });
}
