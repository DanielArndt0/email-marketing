import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { LEAD_SOURCE_TYPES } from "core";
import { z } from "zod";

import { createAudience } from "../application/create-audience.js";

const requestBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).nullable().optional(),
  sourceType: z.enum(LEAD_SOURCE_TYPES),
  filters: z.record(z.string(), z.unknown()).default({}),
});

type CreatePostCreateAudienceHandlerDependencies = {
  pgPool: Pool;
};

export function createPostCreateAudienceHandler(
  dependencies: CreatePostCreateAudienceHandlerDependencies,
) {
  return async function postCreateAudienceHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = requestBodySchema.parse(request.body);
    const audience = await createAudience(dependencies, body);
    return reply.status(201).send(audience);
  };
}
