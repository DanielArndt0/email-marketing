import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { previewAudience } from "../application/preview-audience.js";
import { sendAudienceResolutionError } from "./audience-error-response.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
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

    try {
      const result = await previewAudience(dependencies, {
        audienceId: params.id,
      });

      if (result.kind === "not_found") {
        return reply.status(404).send({
          message: "Audience não encontrada.",
        });
      }

      return reply.status(200).send(result.preview);
    } catch (error) {
      const handledError = sendAudienceResolutionError(reply, error);

      if (handledError) {
        return handledError;
      }

      throw error;
    }
  };
}
