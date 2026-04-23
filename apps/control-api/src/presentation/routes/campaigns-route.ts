import type { FastifyInstance, FastifySchema } from "fastify";
import type { Queue } from "bullmq";
import type { Pool } from "pg";

import type { EmailDispatchJobData } from "shared";

import type { LeadSourceProviderRegistry } from "../../modules/audiences/adapters/lead-source-provider-registry.js";
import { createGetCampaignAudiencePreviewHandler } from "../../modules/audiences/http/get-campaign-audience-preview-handler.js";
import { createGetCampaignByIdHandler } from "../../modules/campaigns/http/get-campaign-by-id-handler.js";
import { createGetListCampaignsHandler } from "../../modules/campaigns/http/get-list-campaigns-handler.js";
import { createPatchUpdateCampaignHandler } from "../../modules/campaigns/http/patch-update-campaign-handler.js";
import { createPostCreateCampaignHandler } from "../../modules/campaigns/http/post-create-campaign-handler.js";
import { createPostEnqueueEmailDispatchHandler } from "../../modules/campaigns/http/post-enqueue-email-dispatch-handler.js";
import {
  audiencePreviewQuerySchema,
  audiencePreviewResponseSchema,
  notConfiguredMessageSchema,
} from "../schemas/audience-schemas.js";
import {
  campaignCreateBodySchema,
  campaignListQuerySchema,
  campaignPaginationResponseSchema,
  campaignParamsSchema,
  campaignSchema,
  campaignUpdateBodySchema,
  notFoundMessageSchema,
} from "../schemas/campaign-schemas.js";

type RegisterCampaignsRouteDependencies = {
  pgPool: Pool;
  emailDispatchQueue: Queue<EmailDispatchJobData>;
  leadSourceRegistry: LeadSourceProviderRegistry;
};

const createCampaignRouteSchema = {
  tags: ["campaigns"],
  summary: "Cria uma campanha",
  body: campaignCreateBodySchema,
  response: {
    201: campaignSchema,
    404: notFoundMessageSchema,
  },
} satisfies FastifySchema;

const listCampaignsRouteSchema = {
  tags: ["campaigns"],
  summary: "Lista campanhas com paginação",
  querystring: campaignListQuerySchema,
  response: {
    200: campaignPaginationResponseSchema,
  },
} satisfies FastifySchema;

const getCampaignByIdRouteSchema = {
  tags: ["campaigns"],
  summary: "Consulta uma campanha por id",
  params: campaignParamsSchema,
  response: {
    200: campaignSchema,
    404: notFoundMessageSchema,
  },
} satisfies FastifySchema;

const patchCampaignRouteSchema = {
  tags: ["campaigns"],
  summary: "Atualiza parcialmente uma campanha",
  params: campaignParamsSchema,
  body: campaignUpdateBodySchema,
  response: {
    200: campaignSchema,
    404: notFoundMessageSchema,
  },
} satisfies FastifySchema;

const enqueueEmailDispatchRouteSchema = {
  tags: ["campaigns"],
  summary: "Cria e enfileira um email dispatch",
} satisfies FastifySchema;

const campaignAudiencePreviewRouteSchema = {
  tags: ["campaigns"],
  summary:
    "Pré-visualiza os destinatários resolvidos para a audiência da campanha",
  params: campaignParamsSchema,
  querystring: audiencePreviewQuerySchema,
  response: {
    200: audiencePreviewResponseSchema,
    404: notFoundMessageSchema,
    409: notConfiguredMessageSchema,
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

  app.get(
    "/campaigns/:id/audience-preview",
    {
      schema: campaignAudiencePreviewRouteSchema,
    },
    createGetCampaignAudiencePreviewHandler({
      pgPool: dependencies.pgPool,
      registry: dependencies.leadSourceRegistry,
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
}
