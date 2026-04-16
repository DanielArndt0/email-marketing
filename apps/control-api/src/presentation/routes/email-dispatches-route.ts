import type { FastifyInstance } from "fastify";
import type { Queue } from "bullmq";
import type { Pool } from "pg";

import type { EmailDispatchJobData } from "shared";

import { createGetEmailDispatchByIdHandler } from "../../modules/email-dispatches/http/get-email-dispatch-by-id-handler.js";
import { createGetListEmailDispatchesHandler } from "../../modules/email-dispatches/http/get-list-email-dispatches-handler.js";
import { createPostRetryEmailDispatchHandler } from "../../modules/email-dispatches/http/post-retry-email-dispatch-handler.js";

type RegisterEmailDispatchesRouteDependencies = {
  pgPool: Pool;
  emailDispatchQueue: Queue<EmailDispatchJobData>;
};

export function registerEmailDispatchesRoute(
  app: FastifyInstance,
  dependencies: RegisterEmailDispatchesRouteDependencies,
): void {
  app.get(
    "/email-dispatches",
    createGetListEmailDispatchesHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/email-dispatches/:id",
    createGetEmailDispatchByIdHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.post(
    "/email-dispatches/:id/retry",
    createPostRetryEmailDispatchHandler({
      pgPool: dependencies.pgPool,
      queue: dependencies.emailDispatchQueue,
    }),
  );
}
