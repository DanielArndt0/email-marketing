import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { previewCampaignAudience } from "../application/preview-campaign-audience.js";
import { sendAudienceResolutionError } from "./audience-error-response.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
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

    try {
      const result = await previewCampaignAudience(dependencies, {
        campaignId: params.id,
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
      const handledError = sendAudienceResolutionError(reply, error);

      if (handledError) {
        return handledError;
      }

      throw error;
    }
  };
}
