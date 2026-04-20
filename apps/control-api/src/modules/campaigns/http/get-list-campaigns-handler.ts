import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { systemConfig } from "shared";

import { listCampaigns } from "../application/list-campaigns.js";
import { listCampaignsQuerySchema } from "./campaign-schema.js";

type CreateGetListCampaignsHandlerDependencies = { pgPool: Pool };

export function createGetListCampaignsHandler(
  dependencies: CreateGetListCampaignsHandlerDependencies,
) {
  return async function getListCampaignsHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const parsed = listCampaignsQuerySchema.safeParse(request.query);
    const query = parsed.success
      ? parsed.data
      : {
          page: systemConfig.api.pagination.campaigns.defaultPage,
          pageSize: systemConfig.api.pagination.campaigns.defaultPageSize,
          status: undefined,
          sourceType: undefined,
        };

    const result = await listCampaigns(dependencies, query);

    return reply.status(200).send(result);
  };
}
