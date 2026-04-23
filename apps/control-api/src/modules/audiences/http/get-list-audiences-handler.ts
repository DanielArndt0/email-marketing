import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { LEAD_SOURCE_TYPES } from "core";
import { z } from "zod";

import { listAudiences } from "../application/list-audiences.js";

const requestQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  sourceType: z.enum(LEAD_SOURCE_TYPES).optional(),
});

type CreateGetListAudiencesHandlerDependencies = {
  pgPool: Pool;
};

export function createGetListAudiencesHandler(
  dependencies: CreateGetListAudiencesHandlerDependencies,
) {
  return async function getListAudiencesHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const query = requestQuerySchema.parse(request.query);
    const result = await listAudiences(dependencies, query);
    return reply.status(200).send(result);
  };
}
