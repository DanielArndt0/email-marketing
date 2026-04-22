import type { FastifyInstance, FastifySchema } from "fastify";
import type { Pool } from "pg";

import { createDeleteTemplateHandler } from "../../modules/templates/http/delete-template-handler.js";
import { createGetListTemplatesHandler } from "../../modules/templates/http/get-list-templates-handler.js";
import { createGetTemplateByIdHandler } from "../../modules/templates/http/get-template-by-id-handler.js";
import { createPatchUpdateTemplateHandler } from "../../modules/templates/http/patch-update-template-handler.js";
import { createPostCreateTemplateHandler } from "../../modules/templates/http/post-create-template-handler.js";

type RegisterTemplatesRouteDependencies = {
  pgPool: Pool;
};

const createTemplateRouteSchema = {
  tags: ["templates"],
  summary: "Cria um template",
} satisfies FastifySchema;

const listTemplatesRouteSchema = {
  tags: ["templates"],
  summary: "Lista templates com paginação",
} satisfies FastifySchema;

const getTemplateByIdRouteSchema = {
  tags: ["templates"],
  summary: "Consulta um template por id",
} satisfies FastifySchema;

const patchTemplateRouteSchema = {
  tags: ["templates"],
  summary: "Atualiza parcialmente um template",
} satisfies FastifySchema;

const deleteTemplateRouteSchema = {
  tags: ["templates"],
  summary: "Exclui um template quando não houver dispatches vinculados",
} satisfies FastifySchema;

export function registerTemplatesRoute(
  app: FastifyInstance,
  dependencies: RegisterTemplatesRouteDependencies,
): void {
  app.post(
    "/templates",
    {
      schema: createTemplateRouteSchema,
    },
    createPostCreateTemplateHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/templates",
    {
      schema: listTemplatesRouteSchema,
    },
    createGetListTemplatesHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/templates/:id",
    {
      schema: getTemplateByIdRouteSchema,
    },
    createGetTemplateByIdHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.patch(
    "/templates/:id",
    {
      schema: patchTemplateRouteSchema,
    },
    createPatchUpdateTemplateHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.delete(
    "/templates/:id",
    {
      schema: deleteTemplateRouteSchema,
    },
    createDeleteTemplateHandler({
      pgPool: dependencies.pgPool,
    }),
  );
}
