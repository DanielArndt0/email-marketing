import type { FastifyReply, FastifyRequest } from "fastify";
import type { Queue } from "bullmq";
import type { Pool } from "pg";
import { z } from "zod";

import type { EmailDispatchJobData } from "shared";

import type { LeadSourceProviderRegistry } from "../../audiences/adapters/lead-source-provider-registry.js";
import { dispatchCampaign } from "../application/dispatch-campaign.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

const requestBodySchema = z
  .object({
    limit: z.number().int().positive().optional(),
  })
  .optional();

type CreatePostDispatchCampaignHandlerDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
  providerRegistry: LeadSourceProviderRegistry;
};

export function createPostDispatchCampaignHandler(
  dependencies: CreatePostDispatchCampaignHandlerDependencies,
) {
  return async function postDispatchCampaignHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const body = requestBodySchema.parse(request.body) ?? {};

    const result = await dispatchCampaign(dependencies, {
      campaignId: params.id,
      limit: body.limit,
    });

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Campaign não encontrada.",
      });
    }

    if (result.kind === "missing_template") {
      return reply.status(409).send({
        message: "A campaign não possui template vinculado.",
      });
    }

    if (result.kind === "missing_audience") {
      return reply.status(409).send({
        message: "A campaign não possui audience vinculada.",
      });
    }

    if (result.kind === "missing_smtp_sender") {
      return reply.status(409).send({
        message: "A campaign não possui SMTP sender vinculado.",
      });
    }

    if (result.kind === "inactive_smtp_sender") {
      return reply.status(409).send({
        message: "O SMTP sender vinculado à campaign está inativo.",
      });
    }

    return reply.status(202).send(result);
  };
}
