import type { FastifyInstance } from "fastify";
import type { Queue } from "bullmq";
import type RedisImport from "ioredis";
import type { Pool } from "pg";

import type { EmailDispatchJobData } from "shared";

import type { LeadSourceProviderRegistry } from "../../modules/audiences/adapters/lead-source-provider-registry.js";
import { registerAudiencesRoute } from "./audiences-route.js";
import { registerCampaignsRoute } from "./campaigns-route.js";
import { registerEmailDispatchesRoute } from "./email-dispatches-route.js";
import { registerHealthRoute } from "./health-route.js";
import { registerTemplatesRoute } from "./templates-route.js";

type RegisterRoutesDependencies = {
  pgPool: Pool;
  redis: InstanceType<typeof RedisImport.default>;
  emailDispatchQueue: Queue<EmailDispatchJobData>;
  leadSourceRegistry: LeadSourceProviderRegistry;
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
    pgPool: dependencies.pgPool,
    emailDispatchQueue: dependencies.emailDispatchQueue,
    leadSourceRegistry: dependencies.leadSourceRegistry,
  });

  registerAudiencesRoute(app, {
    registry: dependencies.leadSourceRegistry,
  });

  registerEmailDispatchesRoute(app, {
    pgPool: dependencies.pgPool,
    emailDispatchQueue: dependencies.emailDispatchQueue,
  });

  registerTemplatesRoute(app, {
    pgPool: dependencies.pgPool,
  });
}
