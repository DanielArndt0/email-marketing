import type { FastifyInstance, FastifySchema } from "fastify";
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

const listEmailDispatchesRouteSchema = {
  tags: ["email-dispatches"],
  summary: "Lista email dispatches com filtros e paginação",
} satisfies FastifySchema;

const getEmailDispatchByIdRouteSchema = {
  tags: ["email-dispatches"],
  summary: "Consulta um email dispatch por id",
} satisfies FastifySchema;

const retryEmailDispatchRouteSchema = {
  tags: ["email-dispatches"],
  summary: "Reenfileira um email dispatch com status de erro",
} satisfies FastifySchema;

export function registerEmailDispatchesRoute(
  app: FastifyInstance,
  dependencies: RegisterEmailDispatchesRouteDependencies,
): void {
  app.get(
    "/email-dispatches",
    {
      schema: listEmailDispatchesRouteSchema,
    },
    createGetListEmailDispatchesHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/email-dispatches/:id",
    {
      schema: getEmailDispatchByIdRouteSchema,
    },
    createGetEmailDispatchByIdHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.post(
    "/email-dispatches/:id/retry",
    {
      schema: retryEmailDispatchRouteSchema,
    },
    createPostRetryEmailDispatchHandler({
      pgPool: dependencies.pgPool,
      queue: dependencies.emailDispatchQueue,
    }),
  );
}
