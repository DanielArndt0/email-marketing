import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { updateCampaign } from "../application/update-campaign.js";
import { campaignParamsSchema, updateCampaignBodySchema } from "./campaign-schema.js";

type CreatePatchUpdateCampaignHandlerDependencies = {
  pgPool: Pool;
};

export function createPatchUpdateCampaignHandler(
  dependencies: CreatePatchUpdateCampaignHandlerDependencies,
) {
  return async function patchUpdateCampaignHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = campaignParamsSchema.parse(request.params);
    const body = updateCampaignBodySchema.parse(request.body);

    const result = await updateCampaign(dependencies, {
      id: params.id,
      name: body.name,
      goal: body.goal,
      subject: body.subject,
      status: body.status,
      templateId: body.templateId,
      audienceId: body.audienceId,
      scheduleAt: body.scheduleAt,
    });

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Campaign não encontrada.",
      });
    }

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

    return reply.status(200).send(result.campaign);
  };
}
