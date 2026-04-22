import type { FastifyInstance, FastifySchema } from "fastify";
import type { Pool } from "pg";
import type RedisImport from "ioredis";

import { createGetHealthHandler } from "../../modules/health/http/get-health-handler.js";
import { healthCheckResponseSchema } from "../schemas/health-schemas.js";

type RegisterHealthRouteDependencies = {
  pgPool: Pool;
  redis: InstanceType<typeof RedisImport.default>;
};

const healthRouteSchema = {
  tags: ["health"],
  summary: "Verifica a saúde da API e suas dependências",
  response: {
    200: healthCheckResponseSchema,
    503: healthCheckResponseSchema,
  },
} satisfies FastifySchema;

export function registerHealthRoute(
  app: FastifyInstance,
  dependencies: RegisterHealthRouteDependencies,
): void {
  app.get(
    "/health",
    {
      schema: healthRouteSchema,
    },
    createGetHealthHandler(dependencies),
  );
}
