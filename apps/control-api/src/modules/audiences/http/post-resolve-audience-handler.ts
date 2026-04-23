import type { FastifyReply, FastifyRequest } from "fastify";
import { LEAD_SOURCE_TYPES } from "core";
import { z } from "zod";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { resolveAudience } from "../application/resolve-audience.js";

const requestBodySchema = z.object({
  sourceType: z.enum(LEAD_SOURCE_TYPES),
  filters: z.record(z.string(), z.unknown()).default({}),
  limit: z.coerce.number().int().positive().max(100).optional(),
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
    const result = await resolveAudience(dependencies, body);
    return reply.status(200).send(result);
  };
}
