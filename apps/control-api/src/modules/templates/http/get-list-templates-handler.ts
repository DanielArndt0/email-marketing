import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { systemConfig } from "shared";

import { listTemplates } from "../application/list-templates.js";

const paginationConfig = systemConfig.api.pagination.templates;

const requestQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(paginationConfig.defaultPage),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(paginationConfig.maxPageSize)
    .default(paginationConfig.defaultPageSize),
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

    const result = await listTemplates(dependencies, {
      page: query.page,
      pageSize: query.pageSize,
    });

    return reply.status(200).send(result);
  };
}
