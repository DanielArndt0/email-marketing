import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { getTemplateById } from "../application/get-template-by-id.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreateGetTemplateByIdHandlerDependencies = {
  pgPool: Pool;
};

export function createGetTemplateByIdHandler(
  dependencies: CreateGetTemplateByIdHandlerDependencies,
) {
  return async function getTemplateByIdHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);

    const template = await getTemplateById(dependencies, params.id);

    if (!template) {
      return reply.status(404).send({
        message: "Template não encontrado.",
      });
    }

    return reply.status(200).send(template);
  };
}
