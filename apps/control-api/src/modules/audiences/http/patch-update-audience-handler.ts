import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { LEAD_SOURCE_TYPES } from "core";
import { z } from "zod";

import { updateAudience } from "../application/update-audience.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

const requestBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.union([z.string().min(1), z.null()]).optional(),
    sourceType: z.enum(LEAD_SOURCE_TYPES).optional(),
    filters: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.sourceType !== undefined ||
      data.filters !== undefined,
    { message: "É necessário informar ao menos um campo para atualização." },
  );

type CreatePatchUpdateAudienceHandlerDependencies = {
  pgPool: Pool;
};

export function createPatchUpdateAudienceHandler(
  dependencies: CreatePatchUpdateAudienceHandlerDependencies,
) {
  return async function patchUpdateAudienceHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const body = requestBodySchema.parse(request.body);

    const result = await updateAudience(dependencies, {
      id: params.id,
      name: body.name,
      description: body.description,
      sourceType: body.sourceType,
      filters: body.filters,
    });

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Audience não encontrada.",
      });
    }

    return reply.status(200).send(result.audience);
  };
}
