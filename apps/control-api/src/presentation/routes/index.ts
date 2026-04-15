import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import type RedisImport from "ioredis";

import { registerHealthRoute } from "./health-route.js";

type RegisterRoutesDependencies = {
  pgPool: Pool;
  redis: InstanceType<typeof RedisImport.default>;
};

export function registerRoutes(
  app: FastifyInstance,
  dependencies: RegisterRoutesDependencies,
): void {
  registerHealthRoute(app, dependencies);
}
