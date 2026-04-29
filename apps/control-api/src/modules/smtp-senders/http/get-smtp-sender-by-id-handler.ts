import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { getSmtpSenderById } from "../application/get-smtp-sender-by-id.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreateGetSmtpSenderByIdHandlerDependencies = {
  pgPool: Pool;
};

export function createGetSmtpSenderByIdHandler(
  dependencies: CreateGetSmtpSenderByIdHandlerDependencies,
) {
  return async function getSmtpSenderByIdHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);

    const smtpSender = await getSmtpSenderById(dependencies, params.id);

    if (!smtpSender) {
      return reply.status(404).send({
        message: "SMTP sender não encontrado.",
      });
    }

    return reply.status(200).send(smtpSender);
  };
}
