import type { FastifyInstance, FastifySchema } from "fastify";
import type { Pool } from "pg";

import { createDeleteTemplateHandler } from "../../modules/templates/http/delete-template-handler.js";
import { createGetListTemplatesHandler } from "../../modules/templates/http/get-list-templates-handler.js";
import { createGetTemplateByIdHandler } from "../../modules/templates/http/get-template-by-id-handler.js";
import { createPatchUpdateTemplateHandler } from "../../modules/templates/http/patch-update-template-handler.js";
import { createPostCreateTemplateHandler } from "../../modules/templates/http/post-create-template-handler.js";
import {
  createTemplateBodySchema,
  templateListSchema,
  templateMessageSchema,
  templateParamsSchema,
  templateSchema,
  updateTemplateBodySchema,
} from "../schemas/template-schemas.js";

type RegisterTemplatesRouteDependencies = {
  pgPool: Pool;
};

const createTemplateRouteSchema = {
  tags: ["templates"],
  summary: "Cria um template",
  body: createTemplateBodySchema,
  response: {
    201: templateSchema,
  },
} satisfies FastifySchema;

const listTemplatesRouteSchema = {
  tags: ["templates"],
  summary: "Lista templates com paginação",
  response: {
    200: templateListSchema,
  },
} satisfies FastifySchema;

const getTemplateByIdRouteSchema = {
  tags: ["templates"],
  summary: "Consulta um template por id",
  params: templateParamsSchema,
  response: {
    200: templateSchema,
    404: templateMessageSchema,
  },
} satisfies FastifySchema;

const patchTemplateRouteSchema = {
  tags: ["templates"],
  summary: "Atualiza parcialmente um template",
  params: templateParamsSchema,
  body: updateTemplateBodySchema,
  response: {
    200: templateSchema,
    404: templateMessageSchema,
  },
} satisfies FastifySchema;

const deleteTemplateRouteSchema = {
  tags: ["templates"],
  summary: "Exclui um template quando não houver dispatches vinculados",
  params: templateParamsSchema,
  response: {
    200: {
      type: "object",
      required: ["status", "id"],
      properties: {
        status: { type: "string", examples: ["deleted"] },
        id: { type: "string" },
      },
    },
    404: templateMessageSchema,
    409: {
      type: "object",
      required: ["message", "dispatchesCount"],
      properties: {
        message: { type: "string" },
        dispatchesCount: { type: "integer" },
      },
    },
  },
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
