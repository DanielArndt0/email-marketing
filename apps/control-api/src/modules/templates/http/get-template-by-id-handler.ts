import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { getTemplateById } from "../application/get-template-by-id.js";
import { templateParamsSchema } from "./template-schema.js";

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
    const params = templateParamsSchema.parse(request.params);

    const template = await getTemplateById(dependencies, params.id);

    if (!template) {
      return reply.status(404).send({
        message: "Template não encontrado.",
      });
    }

    return reply.status(200).send(template);
  };
}
