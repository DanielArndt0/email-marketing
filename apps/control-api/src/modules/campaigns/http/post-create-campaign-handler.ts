import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { createCampaign } from "../application/create-campaign.js";
import { createCampaignBodySchema } from "./campaign-schema.js";

type CreatePostCreateCampaignHandlerDependencies = { pgPool: Pool };

export function createPostCreateCampaignHandler(
  dependencies: CreatePostCreateCampaignHandlerDependencies,
) {
  return async function postCreateCampaignHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = createCampaignBodySchema.parse(request.body);

    const result = await createCampaign(dependencies, {
      name: body.name,
      subject: body.subject,
      goal: body.goal,
      status: body.status,
      templateId: body.templateId,
      audienceSourceType: body.audience?.sourceType,
      audienceFilters: body.audience?.filters,
      scheduleAt: body.scheduleAt,
    });

    if (result.kind === "template_not_found") {
      return reply.status(404).send({ message: "Template não encontrado." });
    }

    return reply.status(201).send(result.campaign);
  };
}
