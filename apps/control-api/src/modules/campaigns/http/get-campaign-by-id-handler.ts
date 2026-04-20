import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { getCampaignById } from "../application/get-campaign-by-id.js";
import { campaignParamsSchema } from "./campaign-schema.js";

type CreateGetCampaignByIdHandlerDependencies = { pgPool: Pool };

export function createGetCampaignByIdHandler(
  dependencies: CreateGetCampaignByIdHandlerDependencies,
) {
  return async function getCampaignByIdHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = campaignParamsSchema.parse(request.params);
    const campaign = await getCampaignById(dependencies, params.id);

    if (!campaign) {
      return reply.status(404).send({ message: "Campanha não encontrada." });
    }

    return reply.status(200).send(campaign);
  };
}
