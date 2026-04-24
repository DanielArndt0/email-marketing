import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { deleteAudience } from "../application/delete-audience.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreateDeleteAudienceHandlerDependencies = {
  pgPool: Pool;
};

export function createDeleteAudienceHandler(
  dependencies: CreateDeleteAudienceHandlerDependencies,
) {
  return async function deleteAudienceHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const result = await deleteAudience(dependencies, params.id);

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Audience não encontrada.",
      });
    }

    if (result.kind === "in_use") {
      return reply.status(409).send({
        message:
          "A audience não pode ser excluída porque já está vinculada a campanhas.",
        campaignsCount: result.campaignsCount,
      });
    }

    return reply.status(200).send({
      status: "deleted",
      id: result.id,
    });
  };
}
