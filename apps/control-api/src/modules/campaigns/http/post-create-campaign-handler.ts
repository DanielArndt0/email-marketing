import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { createCampaignBodySchema } from "./campaign-schema.js";
import { createCampaign } from "../application/create-campaign.js";

type CreatePostCreateCampaignHandlerDependencies = {
  pgPool: Pool;
};

export function createPostCreateCampaignHandler(
  dependencies: CreatePostCreateCampaignHandlerDependencies,
) {
  return async function postCreateCampaignHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = createCampaignBodySchema.parse(request.body);

    const result = await createCampaign(dependencies, body);

    if (result.kind === "template_not_found") {
      return reply.status(404).send({
        message: "Template não encontrado.",
      });
    }

    if (result.kind === "audience_not_found") {
      return reply.status(404).send({
        message: "Audience não encontrada.",
      });
    }

    return reply.status(201).send(result.campaign);
  };
}
