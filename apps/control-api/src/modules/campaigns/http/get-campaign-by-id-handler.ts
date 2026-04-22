import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { getCampaignById } from "../application/get-campaign-by-id.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreateGetCampaignByIdHandlerDependencies = {
  pgPool: Pool;
};

export function createGetCampaignByIdHandler(
  dependencies: CreateGetCampaignByIdHandlerDependencies,
) {
  return async function getCampaignByIdHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);

    const campaign = await getCampaignById(dependencies, params.id);

    if (!campaign) {
      return reply.status(404).send({
        message: "Campaign não encontrada.",
      });
    }

    return reply.status(200).send(campaign);
  };
}
