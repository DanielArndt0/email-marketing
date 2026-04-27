import type { FastifyInstance, FastifySchema } from "fastify";
import type { Queue } from "bullmq";
import type { Pool } from "pg";

import type { EmailDispatchJobData } from "shared";

import type { LeadSourceProviderRegistry } from "../../modules/audiences/adapters/lead-source-provider-registry.js";
import { createGetPreviewCampaignAudienceHandler } from "../../modules/audiences/http/get-preview-campaign-audience-handler.js";
import { createGetCampaignByIdHandler } from "../../modules/campaigns/http/get-campaign-by-id-handler.js";
import { createGetListCampaignsHandler } from "../../modules/campaigns/http/get-list-campaigns-handler.js";
import { createPatchUpdateCampaignHandler } from "../../modules/campaigns/http/patch-update-campaign-handler.js";
import { createPostCreateCampaignHandler } from "../../modules/campaigns/http/post-create-campaign-handler.js";
import { createPostEnqueueEmailDispatchHandler } from "../../modules/campaigns/http/post-enqueue-email-dispatch-handler.js";
import { createDeleteCampaignHandler } from "../../modules/campaigns/http/delete-campaign-handler.js";
import {
  campaignPaginationResponseSchema,
  campaignParamsSchema,
  campaignSchema,
  createCampaignBodySchema,
  listCampaignsQuerySchema,
  notFoundMessageSchema,
  updateCampaignBodySchema,
} from "../schemas/campaign-schemas.js";
import {
  audiencePreviewSchema,
  messageSchema,
} from "../schemas/audience-schemas.js";

type RegisterCampaignsRouteDependencies = {
  pgPool: Pool;
  emailDispatchQueue: Queue<EmailDispatchJobData>;
  providerRegistry: LeadSourceProviderRegistry;
};

const createCampaignRouteSchema = {
  tags: ["campaigns"],
  summary: "Cria uma campaign",
  description:
    "Cria uma campaign e vincula templateId e audienceId quando informados.",
  body: createCampaignBodySchema,
  response: {
    201: campaignSchema,
    404: notFoundMessageSchema,
  },
} satisfies FastifySchema;

const listCampaignsRouteSchema = {
  tags: ["campaigns"],
  summary: "Lista campaigns com paginação",
  querystring: listCampaignsQuerySchema,
  response: {
    200: campaignPaginationResponseSchema,
  },
} satisfies FastifySchema;

const getCampaignByIdRouteSchema = {
  tags: ["campaigns"],
  summary: "Consulta uma campaign por id",
  params: campaignParamsSchema,
  response: {
    200: campaignSchema,
    404: notFoundMessageSchema,
  },
} satisfies FastifySchema;

const patchCampaignRouteSchema = {
  tags: ["campaigns"],
  summary: "Atualiza parcialmente uma campaign",
  params: campaignParamsSchema,
  body: updateCampaignBodySchema,
  response: {
    200: campaignSchema,
    404: notFoundMessageSchema,
  },
} satisfies FastifySchema;

const previewCampaignAudienceRouteSchema = {
  tags: ["campaigns"],
  summary: "Gera preview da audience vinculada à campaign",
  params: campaignParamsSchema,
  response: {
    200: audiencePreviewSchema,
    400: messageSchema,
    404: messageSchema,
    409: messageSchema,
    502: messageSchema,
  },
} satisfies FastifySchema;

const enqueueEmailDispatchRouteSchema = {
  tags: ["campaigns"],
  summary: "Cria e enfileira um email dispatch",
} satisfies FastifySchema;

const deleteCampaignRouteSchema = {
  tags: ["campaigns"],
  summary: "Exclui uma campaign quando não houver dispatches vinculados",
  params: campaignParamsSchema,
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string", example: "deleted" },
        id: { type: "string" },
      },
      required: ["status", "id"],
    },
    404: notFoundMessageSchema,
    409: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example:
            "A campaign não pode ser excluída porque já possui email dispatches vinculados.",
        },
        dispatchesCount: {
          type: "number",
          example: 3,
        },
      },
      required: ["message", "dispatchesCount"],
    },
  },
} satisfies FastifySchema;

export function registerCampaignsRoute(
  app: FastifyInstance,
  dependencies: RegisterCampaignsRouteDependencies,
): void {
  app.post(
    "/campaigns",
    {
      schema: createCampaignRouteSchema,
    },
    createPostCreateCampaignHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/campaigns",
    {
      schema: listCampaignsRouteSchema,
    },
    createGetListCampaignsHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/campaigns/:id",
    {
      schema: getCampaignByIdRouteSchema,
    },
    createGetCampaignByIdHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.patch(
    "/campaigns/:id",
    {
      schema: patchCampaignRouteSchema,
    },
    createPatchUpdateCampaignHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/campaigns/:id/audience-preview",
    {
      schema: previewCampaignAudienceRouteSchema,
    },
    createGetPreviewCampaignAudienceHandler({
      pgPool: dependencies.pgPool,
      providerRegistry: dependencies.providerRegistry,
    }),
  );

  app.post(
    "/campaigns/email-dispatch",
    {
      schema: enqueueEmailDispatchRouteSchema,
    },
    createPostEnqueueEmailDispatchHandler({
      pgPool: dependencies.pgPool,
      queue: dependencies.emailDispatchQueue,
    }),
  );

  app.delete(
    "/campaigns/:id",
    {
      schema: deleteCampaignRouteSchema,
    },
    createDeleteCampaignHandler({
      pgPool: dependencies.pgPool,
    }),
  );
}
