import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { listEmailDispatches } from "../application/list-email-dispatches.js";

const requestQuerySchema = z.object({
  campaignId: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  status: z
    .enum(["pending", "queued", "processing", "sent", "error"])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

type CreateGetListEmailDispatchesHandlerDependencies = {
  pgPool: Pool;
};

export function createGetListEmailDispatchesHandler(
  dependencies: CreateGetListEmailDispatchesHandlerDependencies,
) {
  return async function getListEmailDispatchesHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const query = requestQuerySchema.parse(request.query);

    const result = await listEmailDispatches(dependencies, {
      campaignId: query.campaignId,
      contactId: query.contactId,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });

    return reply.status(200).send(result);
  };
}
