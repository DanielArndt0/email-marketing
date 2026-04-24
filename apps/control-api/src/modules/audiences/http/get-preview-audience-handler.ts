import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { previewAudience } from "../application/preview-audience.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

const requestQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

type CreateGetPreviewAudienceHandlerDependencies = {
  pgPool: Pool;
  providerRegistry: LeadSourceProviderRegistry;
};

export function createGetPreviewAudienceHandler(
  dependencies: CreateGetPreviewAudienceHandlerDependencies,
) {
  return async function getPreviewAudienceHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const query = requestQuerySchema.parse(request.query);

    try {
      const result = await previewAudience(dependencies, {
        audienceId: params.id,
        page: query.page,
        limit: query.limit,
      });

      if (result.kind === "not_found") {
        return reply.status(404).send({
          message: "Audience não encontrada.",
        });
      }

      return reply.status(200).send(result.preview);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : "Falha ao gerar preview da audience.",
      });
    }
  };
}
