import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { CAMPAIGN_STATUSES, LEAD_SOURCE_TYPES } from "core";

import { updateCampaign } from "../application/update-campaign.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

const requestBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    goal: z.union([z.string().min(1), z.null()]).optional(),
    subject: z.string().min(1).optional(),
    status: z.enum(CAMPAIGN_STATUSES).optional(),
    templateId: z.union([z.string().min(1), z.null()]).optional(),
    audience: z
      .union([
        z.object({
          sourceType: z.enum(LEAD_SOURCE_TYPES),
          filters: z.record(z.string(), z.unknown()).default({}),
        }),
        z.null(),
      ])
      .optional(),
    scheduleAt: z.union([z.iso.datetime(), z.null()]).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.goal !== undefined ||
      data.subject !== undefined ||
      data.status !== undefined ||
      data.templateId !== undefined ||
      data.audience !== undefined ||
      data.scheduleAt !== undefined,
    { message: "É necessário informar ao menos um campo para atualização." },
  );

type CreatePatchUpdateCampaignHandlerDependencies = {
  pgPool: Pool;
};

export function createPatchUpdateCampaignHandler(
  dependencies: CreatePatchUpdateCampaignHandlerDependencies,
) {
  return async function patchUpdateCampaignHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const body = requestBodySchema.parse(request.body);

    const result = await updateCampaign(dependencies, {
      id: params.id,
      name: body.name,
      goal: body.goal,
      subject: body.subject,
      status: body.status,
      templateId: body.templateId,
      audience: body.audience,
      scheduleAt: body.scheduleAt,
    });

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Campaign não encontrada.",
      });
    }

    if (result.kind === "template_not_found") {
      return reply.status(404).send({
        message: "Template não encontrado.",
      });
    }

    return reply.status(200).send(result.campaign);
  };
}
