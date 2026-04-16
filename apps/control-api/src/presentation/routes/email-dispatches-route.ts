import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";

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
}
