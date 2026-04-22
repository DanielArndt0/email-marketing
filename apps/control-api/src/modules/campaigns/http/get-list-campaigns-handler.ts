import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { CAMPAIGN_STATUSES } from "core";
import { systemConfig } from "shared";

import { listCampaigns } from "../application/list-campaigns.js";

const paginationConfig = systemConfig.api.pagination.campaigns;

const requestQuerySchema = z.object({
  status: z.enum(CAMPAIGN_STATUSES).optional(),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(paginationConfig.defaultPage),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(paginationConfig.maxPageSize)
    .default(paginationConfig.defaultPageSize),
});

type CreateGetListCampaignsHandlerDependencies = {
  pgPool: Pool;
};

export function createGetListCampaignsHandler(
  dependencies: CreateGetListCampaignsHandlerDependencies,
) {
  return async function getListCampaignsHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const query = requestQuerySchema.parse(request.query);

    const result = await listCampaigns(dependencies, query);

    return reply.status(200).send(result);
  };
}
