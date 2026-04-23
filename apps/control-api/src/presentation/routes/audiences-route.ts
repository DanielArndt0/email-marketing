import type { FastifyInstance, FastifySchema } from "fastify";
import type { Pool } from "pg";

import type { LeadSourceProviderRegistry } from "../../modules/audiences/adapters/lead-source-provider-registry.js";
import { createDeleteAudienceHandler } from "../../modules/audiences/http/delete-audience-handler.js";
import { createGetAudienceByIdHandler } from "../../modules/audiences/http/get-audience-by-id-handler.js";
import { createGetListAudiencesHandler } from "../../modules/audiences/http/get-list-audiences-handler.js";
import { createGetPreviewAudienceHandler } from "../../modules/audiences/http/get-preview-audience-handler.js";
import { createPatchUpdateAudienceHandler } from "../../modules/audiences/http/patch-update-audience-handler.js";
import { createPostCreateAudienceHandler } from "../../modules/audiences/http/post-create-audience-handler.js";
import { createPostResolveAudienceHandler } from "../../modules/audiences/http/post-resolve-audience-handler.js";
import {
  audienceCreateBodySchema,
  audienceListSchema,
  audienceParamsSchema,
  audiencePreviewQuerySchema,
  audiencePreviewSchema,
  audienceRecordSchema,
  audienceResolveBodySchema,
  audienceUpdateBodySchema,
  messageSchema,
} from "../schemas/audience-schemas.js";

type RegisterAudiencesRouteDependencies = {
  pgPool: Pool;
  providerRegistry: LeadSourceProviderRegistry;
};

const createAudienceRouteSchema = {
  tags: ["audiences"],
  summary: "Cria uma audience persistida e reutilizável",
  description:
    "Registra uma audience separadamente da campaign. Depois, a campaign pode apenas vincular o audienceId.",
  body: audienceCreateBodySchema,
  response: {
    201: audienceRecordSchema,
  },
} satisfies FastifySchema;

const listAudiencesRouteSchema = {
  tags: ["audiences"],
  summary: "Lista audiences cadastradas",
  response: {
    200: audienceListSchema,
  },
} satisfies FastifySchema;

const getAudienceByIdRouteSchema = {
  tags: ["audiences"],
  summary: "Consulta uma audience por id",
  params: audienceParamsSchema,
  response: {
    200: audienceRecordSchema,
    404: messageSchema,
  },
} satisfies FastifySchema;

const patchAudienceRouteSchema = {
  tags: ["audiences"],
  summary: "Atualiza parcialmente uma audience",
  params: audienceParamsSchema,
  body: audienceUpdateBodySchema,
  response: {
    200: audienceRecordSchema,
    404: messageSchema,
  },
} satisfies FastifySchema;

const deleteAudienceRouteSchema = {
  tags: ["audiences"],
  summary: "Exclui uma audience sem vínculos com campaigns",
  params: audienceParamsSchema,
  response: {
    200: {
      type: "object",
      required: ["status", "id"],
      properties: {
        status: { type: "string", examples: ["deleted"] },
        id: { type: "string", examples: ["audience-001"] },
      },
    },
    404: messageSchema,
    409: {
      type: "object",
      required: ["message", "campaignsCount"],
      properties: {
        message: { type: "string" },
        campaignsCount: { type: "integer", examples: [1] },
      },
    },
  },
} satisfies FastifySchema;

const resolveAudienceRouteSchema = {
  tags: ["audiences"],
  summary: "Resolve destinatários por sourceType e filtros",
  description:
    "Usa o provider configurado para o sourceType e retorna um preview direto dos destinatários. Para cnpj-api, consultar os exemplos em filters.",
  body: audienceResolveBodySchema,
  response: {
    200: audiencePreviewSchema,
  },
} satisfies FastifySchema;

const previewAudienceRouteSchema = {
  tags: ["audiences"],
  summary: "Gera preview de uma audience persistida",
  params: audienceParamsSchema,
  querystring: audiencePreviewQuerySchema,
  response: {
    200: audiencePreviewSchema,
    404: messageSchema,
  },
} satisfies FastifySchema;

export function registerAudiencesRoute(
  app: FastifyInstance,
  dependencies: RegisterAudiencesRouteDependencies,
): void {
  app.post(
    "/audiences",
    {
      schema: createAudienceRouteSchema,
    },
    createPostCreateAudienceHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/audiences",
    {
      schema: listAudiencesRouteSchema,
    },
    createGetListAudiencesHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/audiences/:id",
    {
      schema: getAudienceByIdRouteSchema,
    },
    createGetAudienceByIdHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.patch(
    "/audiences/:id",
    {
      schema: patchAudienceRouteSchema,
    },
    createPatchUpdateAudienceHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.delete(
    "/audiences/:id",
    {
      schema: deleteAudienceRouteSchema,
    },
    createDeleteAudienceHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.post(
    "/audiences/resolve",
    {
      schema: resolveAudienceRouteSchema,
    },
    createPostResolveAudienceHandler({
      providerRegistry: dependencies.providerRegistry,
    }),
  );

  app.get(
    "/audiences/:id/preview",
    {
      schema: previewAudienceRouteSchema,
    },
    createGetPreviewAudienceHandler({
      pgPool: dependencies.pgPool,
      providerRegistry: dependencies.providerRegistry,
    }),
  );
}
