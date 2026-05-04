import type { FastifyReply, FastifyRequest } from "fastify";
import type { Queue } from "bullmq";
import type { Pool } from "pg";
import { z } from "zod";

import type { EmailDispatchJobData } from "shared";

import { retryEmailDispatch } from "../application/retry-email-dispatch.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreatePostRetryEmailDispatchHandlerDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
};

export function createPostRetryEmailDispatchHandler(
  dependencies: CreatePostRetryEmailDispatchHandlerDependencies,
) {
  return async function postRetryEmailDispatchHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);

    const result = await retryEmailDispatch(dependencies, params.id);

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Email dispatch não encontrado.",
      });
    }

    if (result.kind === "invalid_status") {
      return reply.status(409).send({
        message: "O email dispatch não pode ser reenfileirado no status atual.",
        currentStatus: result.currentStatus,
      });
    }

    if (result.kind === "campaign_not_found") {
      return reply.status(404).send({
        message: "Campaign vinculada ao email dispatch não encontrada.",
        campaignId: result.campaignId,
      });
    }

    if (result.kind === "campaign_canceled") {
      return reply.status(409).send({
        message:
          "Não é possível reenfileirar dispatches de uma campaign cancelada.",
        campaignId: result.campaignId,
      });
    }

    if (result.kind === "campaign_invalid_status") {
      return reply.status(409).send({
        message:
          "A campaign vinculada não pode ser reaberta para retry no status atual.",
        campaignId: result.campaignId,
        currentStatus: result.currentStatus,
        allowedTransitions: result.allowedTransitions,
      });
    }

    if (result.kind === "campaign_status_conflict") {
      return reply.status(409).send({
        message:
          "O status da campaign foi alterado por outro fluxo antes do retry. Recarregue e tente novamente.",
        campaignId: result.campaignId,
        expectedStatus: result.expectedStatus,
        requestedStatus: result.requestedStatus,
      });
    }

    return reply.status(202).send({
      status: "accepted",
      dispatchId: result.dispatchId,
      campaignId: result.campaignId,
      jobId: result.jobId,
      queueName: result.queueName,
    });
  };
}
