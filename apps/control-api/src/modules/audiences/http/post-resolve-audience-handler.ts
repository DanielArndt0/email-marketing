import type { FastifyReply, FastifyRequest } from "fastify";
import { LEAD_SOURCE_TYPES } from "core";
import { z } from "zod";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { resolveAudience } from "../application/resolve-audience.js";
import { sendAudienceResolutionError } from "./audience-error-response.js";

const requestBodySchema = z.object({
  sourceType: z.enum(LEAD_SOURCE_TYPES),
  filters: z.record(z.string(), z.unknown()).default({}),
});

type CreatePostResolveAudienceHandlerDependencies = {
  providerRegistry: LeadSourceProviderRegistry;
};

export function createPostResolveAudienceHandler(
  dependencies: CreatePostResolveAudienceHandlerDependencies,
) {
  return async function postResolveAudienceHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = requestBodySchema.parse(request.body);

    try {
      const result = await resolveAudience(dependencies, body);
      return reply.status(200).send(result);
    } catch (error) {
      const handledError = sendAudienceResolutionError(reply, error);

      if (handledError) {
        return handledError;
      }

      throw error;
    }
  };
}
