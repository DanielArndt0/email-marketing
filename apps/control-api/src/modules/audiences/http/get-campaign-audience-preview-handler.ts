import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { systemConfig } from "shared";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { previewCampaignAudience } from "../application/preview-campaign-audience.js";

const previewConfig = systemConfig.leadSources.preview;

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

const requestQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(previewConfig.maxLimit)
    .default(previewConfig.defaultLimit),
});

type CreateGetCampaignAudiencePreviewHandlerDependencies = {
  pgPool: Pool;
  registry: LeadSourceProviderRegistry;
};

export function createGetCampaignAudiencePreviewHandler(
  dependencies: CreateGetCampaignAudiencePreviewHandlerDependencies,
) {
  return async function getCampaignAudiencePreviewHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const query = requestQuerySchema.parse(request.query);

    const result = await previewCampaignAudience(dependencies, {
      campaignId: params.id,
      limit: query.limit,
    });

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Campaign não encontrada.",
      });
    }

    if (result.kind === "audience_not_defined") {
      return reply.status(409).send({
        message: "Campaign não possui audiência definida.",
      });
    }

    return reply.status(200).send(result.preview);
  };
}
