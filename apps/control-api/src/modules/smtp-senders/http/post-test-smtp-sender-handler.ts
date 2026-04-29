import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { testSmtpSender } from "../application/test-smtp-sender.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

const requestBodySchema = z
  .object({
    to: z.string().email().optional(),
  })
  .optional();

type CreatePostTestSmtpSenderHandlerDependencies = {
  pgPool: Pool;
};

export function createPostTestSmtpSenderHandler(
  dependencies: CreatePostTestSmtpSenderHandlerDependencies,
) {
  return async function postTestSmtpSenderHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const body = requestBodySchema.parse(request.body) ?? {};

    const result = await testSmtpSender(dependencies, {
      id: params.id,
      to: body.to,
    });

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "SMTP sender não encontrado.",
      });
    }

    if (result.kind === "error") {
      return reply.status(200).send({
        status: "error",
        message: result.message,
        testedAt: result.testedAt,
      });
    }

    return reply.status(200).send({
      status: "success",
      message: "SMTP sender testado com sucesso.",
      testedAt: result.testedAt,
    });
  };
}
