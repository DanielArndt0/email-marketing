import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { listCampaigns } from "../application/list-campaigns.js";
import { listCampaignsQuerySchema } from "./campaign-schema.js";

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
    const query = listCampaignsQuerySchema.parse(request.query);

    const result = await listCampaigns(dependencies, query);

    return reply.status(200).send(result);
  };
}
