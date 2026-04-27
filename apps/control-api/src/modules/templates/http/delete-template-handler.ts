import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { deleteTemplate } from "../application/delete-template.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreateDeleteTemplateHandlerDependencies = {
  pgPool: Pool;
};

export function createDeleteTemplateHandler(
  dependencies: CreateDeleteTemplateHandlerDependencies,
) {
  return async function deleteTemplateHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);

    const result = await deleteTemplate(dependencies, params.id);

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Template não encontrado.",
      });
    }

    if (result.kind === "in_use") {
      return reply.status(409).send({
        message:
          "O template não pode ser excluído porque já possui email dispatches vinculados.",
        campaignsCount: result.campaignsCount,
      });
    }

    return reply.status(200).send({
      status: "deleted",
      id: result.id,
    });
  };
}
