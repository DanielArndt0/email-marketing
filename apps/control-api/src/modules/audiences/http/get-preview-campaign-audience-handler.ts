import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { previewCampaignAudience } from "../application/preview-campaign-audience.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

const requestQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

type CreateGetPreviewCampaignAudienceHandlerDependencies = {
  pgPool: Pool;
  providerRegistry: LeadSourceProviderRegistry;
};

export function createGetPreviewCampaignAudienceHandler(
  dependencies: CreateGetPreviewCampaignAudienceHandlerDependencies,
) {
  return async function getPreviewCampaignAudienceHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const query = requestQuerySchema.parse(request.query);

    try {
      const result = await previewCampaignAudience(dependencies, {
        campaignId: params.id,
        page: query.page,
        limit: query.limit,
      });

      if (result.kind === "campaign_not_found") {
        return reply.status(404).send({
          message: "Campaign não encontrada.",
        });
      }

      if (result.kind === "campaign_without_audience") {
        return reply.status(409).send({
          message: "A campaign ainda não possui uma audience vinculada.",
        });
      }

      if (result.kind === "audience_not_found") {
        return reply.status(404).send({
          message: "Audience vinculada à campaign não encontrada.",
        });
      }

      return reply.status(200).send(result.preview);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : "Falha ao gerar preview da audience da campaign.",
      });
    }
  };
}
