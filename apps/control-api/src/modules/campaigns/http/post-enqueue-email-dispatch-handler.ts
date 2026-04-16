import type { FastifyReply, FastifyRequest } from "fastify";
import type { Queue } from "bullmq";
import { z } from "zod";

import type { EmailDispatchJobData } from "shared";

import { enqueueEmailDispatch } from "../application/enqueue-email-dispatch.js";

const requestBodySchema = z.object({
  campaignId: z.string().min(1),
  contactId: z.string().min(1),
  to: z.email(),
  subject: z.string().min(1),
});

type CreatePostEnqueueEmailDispatchHandlerDependencies = {
  queue: Queue<EmailDispatchJobData>;
};

export function createPostEnqueueEmailDispatchHandler(
  dependencies: CreatePostEnqueueEmailDispatchHandlerDependencies,
) {
  return async function postEnqueueEmailDispatchHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = requestBodySchema.parse(request.body);

    const result = await enqueueEmailDispatch(dependencies, body);

    return reply.status(202).send({
      status: "accepted",
      ...result,
    });
  };
}
