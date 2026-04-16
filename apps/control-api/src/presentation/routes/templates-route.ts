import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";

import { createGetListTemplatesHandler } from "../../modules/templates/http/get-list-templates-handler.js";
import { createGetTemplateByIdHandler } from "../../modules/templates/http/get-template-by-id-handler.js";
import { createPostCreateTemplateHandler } from "../../modules/templates/http/post-create-template-handler.js";

type RegisterTemplatesRouteDependencies = {
  pgPool: Pool;
};

export function registerTemplatesRoute(
  app: FastifyInstance,
  dependencies: RegisterTemplatesRouteDependencies,
): void {
  app.post(
    "/templates",
    createPostCreateTemplateHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/templates",
    createGetListTemplatesHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/templates/:id",
    createGetTemplateByIdHandler({
      pgPool: dependencies.pgPool,
    }),
  );
}
