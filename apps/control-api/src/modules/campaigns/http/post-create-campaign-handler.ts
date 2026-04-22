import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { CAMPAIGN_STATUSES, LEAD_SOURCE_TYPES } from "core";

import { createCampaign } from "../application/create-campaign.js";

const requestBodySchema = z.object({
  name: z.string().min(1),
  goal: z.string().min(1).optional(),
  subject: z.string().min(1),
  status: z.enum(CAMPAIGN_STATUSES).default("draft"),
  templateId: z.string().min(1).nullable().optional(),
  audience: z
    .object({
      sourceType: z.enum(LEAD_SOURCE_TYPES),
      filters: z.record(z.string(), z.unknown()).default({}),
    })
    .optional(),
  scheduleAt: z.iso.datetime().nullable().optional(),
});

type CreatePostCreateCampaignHandlerDependencies = {
  pgPool: Pool;
};

export function createPostCreateCampaignHandler(
  dependencies: CreatePostCreateCampaignHandlerDependencies,
) {
  return async function postCreateCampaignHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = requestBodySchema.parse(request.body);

    const result = await createCampaign(dependencies, body);

    if (result.kind === "template_not_found") {
      return reply.status(404).send({
        message: "Template não encontrado.",
      });
    }

    return reply.status(201).send(result.campaign);
  };
}
