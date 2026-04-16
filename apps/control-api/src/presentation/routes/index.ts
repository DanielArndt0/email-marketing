import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import type RedisImport from "ioredis";
import type { Queue } from "bullmq";

import type { EmailDispatchJobData } from "shared";

import { registerHealthRoute } from "./health-route.js";
import { registerCampaignsRoute } from "./campaigns-route.js";

type RegisterRoutesDependencies = {
  pgPool: Pool;
  redis: InstanceType<typeof RedisImport.default>;
  emailDispatchQueue: Queue<EmailDispatchJobData>;
};

export function registerRoutes(
  app: FastifyInstance,
  dependencies: RegisterRoutesDependencies,
): void {
  registerHealthRoute(app, {
    pgPool: dependencies.pgPool,
    redis: dependencies.redis,
  });

  registerCampaignsRoute(app, {
    emailDispatchQueue: dependencies.emailDispatchQueue,
  });
}
