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

    return reply.status(202).send({
      status: "accepted",
      dispatchId: result.dispatchId,
      jobId: result.jobId,
      queueName: result.queueName,
    });
  };
}
