import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { deleteCampaign } from "../application/delete-campaign.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreateDeleteCampaignHandlerDependencies = {
  pgPool: Pool;
};

export function createDeleteCampaignHandler(
  dependencies: CreateDeleteCampaignHandlerDependencies,
) {
  return async function deleteCampaignHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);

    const result = await deleteCampaign(dependencies, params.id);

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Campaign não encontrada.",
      });
    }

    if (result.kind === "in_use") {
      return reply.status(409).send({
        message:
          "A campaign não pode ser excluída porque já possui email dispatches vinculados.",
        dispatchesCount: result.dispatchesCount,
      });
    }

    return reply.status(200).send({
      status: "deleted",
      id: result.id,
    });
  };
}
