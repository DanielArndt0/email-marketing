import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { listSmtpSendersUseCase } from "../application/list-smtp-senders.js";

const booleanQuerySchema = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    return value === "true";
  });

const requestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  isActive: booleanQuerySchema.optional(),
});

type CreateGetListSmtpSendersHandlerDependencies = {
  pgPool: Pool;
};

export function createGetListSmtpSendersHandler(
  dependencies: CreateGetListSmtpSendersHandlerDependencies,
) {
  return async function getListSmtpSendersHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const query = requestQuerySchema.parse(request.query);

    const result = await listSmtpSendersUseCase(dependencies, {
      page: query.page,
      pageSize: query.pageSize,
      isActive: query.isActive,
    });

    return reply.status(200).send(result);
  };
}
