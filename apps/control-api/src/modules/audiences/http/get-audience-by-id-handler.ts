import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { getAudienceById } from "../application/get-audience-by-id.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreateGetAudienceByIdHandlerDependencies = {
  pgPool: Pool;
};

export function createGetAudienceByIdHandler(
  dependencies: CreateGetAudienceByIdHandlerDependencies,
) {
  return async function getAudienceByIdHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const audience = await getAudienceById(dependencies, params.id);

    if (!audience) {
      return reply.status(404).send({
        message: "Audience não encontrada.",
      });
    }

    return reply.status(200).send(audience);
  };
}
