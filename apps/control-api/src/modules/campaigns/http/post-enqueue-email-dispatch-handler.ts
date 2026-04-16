import type { FastifyReply, FastifyRequest } from "fastify";
import type { Queue } from "bullmq";
import type { Pool } from "pg";
import { z } from "zod";

import type { EmailDispatchJobData } from "shared";

import { enqueueEmailDispatch } from "../application/enqueue-email-dispatch.js";

const requestBodySchema = z
  .object({
    campaignId: z.string().min(1),
    campaignName: z.string().min(1),
    contactId: z.string().min(1),
    to: z.email(),
    templateId: z.string().min(1).optional(),
    subject: z.string().min(1).optional(),
    htmlContent: z.string().min(1).optional(),
    textContent: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.templateId) {
      return;
    }

    if (!data.subject) {
      ctx.addIssue({
        code: "custom",
        path: ["subject"],
        message:
          "É necessário informar subject quando templateId não for enviado.",
      });
    }

    if (!data.htmlContent && !data.textContent) {
      ctx.addIssue({
        code: "custom",
        path: ["htmlContent"],
        message:
          "É necessário informar htmlContent ou textContent quando templateId não for enviado.",
      });
    }
  });

type CreatePostEnqueueEmailDispatchHandlerDependencies = {
  pgPool: Pool;
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

    if (result.kind === "template_not_found") {
      return reply.status(404).send({
        message: "Template não encontrado.",
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
