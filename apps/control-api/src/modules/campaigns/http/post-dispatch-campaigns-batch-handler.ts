import type { FastifyReply, FastifyRequest } from "fastify";
import type { Queue } from "bullmq";
import type { Pool } from "pg";
import { z } from "zod";

import type { EmailDispatchJobData } from "shared";

import type { LeadSourceProviderRegistry } from "../../audiences/adapters/lead-source-provider-registry.js";
import { dispatchCampaignsBatch } from "../application/dispatch-campaigns-batch.js";

const requestBodySchema = z.object({
  campaignIds: z.array(z.string().min(1)).min(1),
  limitPerCampaign: z.number().int().positive().optional(),
});

type CreatePostDispatchCampaignsBatchHandlerDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
  providerRegistry: LeadSourceProviderRegistry;
};

export function createPostDispatchCampaignsBatchHandler(
  dependencies: CreatePostDispatchCampaignsBatchHandlerDependencies,
) {
  return async function postDispatchCampaignsBatchHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = requestBodySchema.parse(request.body);

    const result = await dispatchCampaignsBatch(dependencies, {
      campaignIds: body.campaignIds,
      limitPerCampaign: body.limitPerCampaign,
    });

    return reply.status(202).send(result);
  };
}
