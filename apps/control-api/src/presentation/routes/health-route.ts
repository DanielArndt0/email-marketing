import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import type RedisImport from "ioredis";

import { createGetHealthHandler } from "../../modules/health/http/get-health-handler.js";

type RegisterHealthRouteDependencies = {
  pgPool: Pool;
  redis: InstanceType<typeof RedisImport.default>;
};

export function registerHealthRoute(
  app: FastifyInstance,
  dependencies: RegisterHealthRouteDependencies,
): void {
  app.get("/health", createGetHealthHandler(dependencies));
}
