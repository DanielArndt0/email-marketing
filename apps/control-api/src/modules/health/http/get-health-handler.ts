import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import type RedisImport from "ioredis";

import { checkHealth } from "../application/check-health.js";

type CreateGetHealthHandlerDependencies = {
  pgPool: Pool;
  redis: InstanceType<typeof RedisImport.default>;
};

export function createGetHealthHandler(
  dependencies: CreateGetHealthHandlerDependencies,
) {
  return async function getHealthHandler(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const result = await checkHealth(dependencies);

    const statusCode = result.status === "ok" ? 200 : 503;

    return reply.status(statusCode).send(result);
  };
}
