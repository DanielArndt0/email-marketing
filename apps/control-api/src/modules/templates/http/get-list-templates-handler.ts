import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { listTemplates } from "../application/list-templates.js";

const requestQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

type CreateGetListTemplatesHandlerDependencies = {
  pgPool: Pool;
};

export function createGetListTemplatesHandler(
  dependencies: CreateGetListTemplatesHandlerDependencies,
) {
  return async function getListTemplatesHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const query = requestQuerySchema.parse(request.query);

    const templates = await listTemplates(dependencies, query);

    return reply.status(200).send({
      items: templates,
      count: templates.length,
    });
  };
}
