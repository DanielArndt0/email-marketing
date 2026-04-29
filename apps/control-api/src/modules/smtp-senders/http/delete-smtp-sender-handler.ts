import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { deleteSmtpSender } from "../application/delete-smtp-sender.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreateDeleteSmtpSenderHandlerDependencies = {
  pgPool: Pool;
};

export function createDeleteSmtpSenderHandler(
  dependencies: CreateDeleteSmtpSenderHandlerDependencies,
) {
  return async function deleteSmtpSenderHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);

    const result = await deleteSmtpSender(dependencies, params.id);

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "SMTP sender não encontrado.",
      });
    }

    if (result.kind === "in_use") {
      return reply.status(409).send({
        message:
          "O SMTP sender não pode ser excluído porque possui campaigns vinculadas.",
        campaignsCount: result.campaignsCount,
      });
    }

    return reply.status(200).send({
      status: "deleted",
      id: result.id,
    });
  };
}
