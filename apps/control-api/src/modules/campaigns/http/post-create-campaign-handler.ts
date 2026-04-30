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

    const result = await createCampaign(dependencies, {
      name: body.name,
      goal: body.goal,
      subject: body.subject,
      status: body.status,
      templateId: body.templateId,
      audienceId: body.audienceId,
      smtpSenderId: body.smtpSenderId,
      templateVariableMappings: body.templateVariableMappings,
      scheduleAt: body.scheduleAt,
    });

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

    if (result.kind === "smtp_sender_not_found") {
      return reply.status(404).send({
        message: "SMTP sender não encontrado.",
      });
    }

    return reply.status(201).send(result.campaign);
  };
}
