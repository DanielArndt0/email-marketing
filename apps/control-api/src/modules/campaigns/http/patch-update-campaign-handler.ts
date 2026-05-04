import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { updateCampaign } from "../application/update-campaign.js";
import {
  campaignParamsSchema,
  updateCampaignBodySchema,
} from "./campaign-schema.js";

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
      smtpSenderId: body.smtpSenderId,
      templateVariableMappings: body.templateVariableMappings,
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

    if (result.kind === "smtp_sender_not_found") {
      return reply.status(404).send({
        message: "SMTP sender não encontrado.",
      });
    }

    if (result.kind === "invalid_status_configuration") {
      return reply.status(409).send({
        message: `A campaign não pode permanecer como ${result.status} com a configuração atual.`,
        status: result.status,
        reason: result.reason,
      });
    }

    if (result.kind === "invalid_status_transition") {
      return reply.status(409).send({
        message: `Transição de status inválida: ${result.from} -> ${result.to}.`,
        from: result.from,
        to: result.to,
        allowedTransitions: result.allowedTransitions,
      });
    }

    if (result.kind === "status_conflict") {
      return reply.status(409).send({
        message:
          "O status da campaign foi alterado por outro fluxo. Recarregue a campaign e tente novamente.",
        expectedStatus: result.expectedStatus,
        requestedStatus: result.requestedStatus,
      });
    }

    return reply.status(200).send(result.campaign);
  };
}
