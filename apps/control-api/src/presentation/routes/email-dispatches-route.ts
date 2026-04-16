import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";

import { createGetEmailDispatchByIdHandler } from "../../modules/email-dispatches/http/get-email-dispatch-by-id-handler.js";
import { createGetListEmailDispatchesHandler } from "../../modules/email-dispatches/http/get-list-email-dispatches-handler.js";

type RegisterEmailDispatchesRouteDependencies = {
  pgPool: Pool;
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
}
