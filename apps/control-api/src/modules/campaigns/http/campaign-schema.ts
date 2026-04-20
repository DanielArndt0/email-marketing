import { CAMPAIGN_STATUSES, LEAD_SOURCE_TYPES } from "core";
import { z } from "zod";

const audienceSchema = z.object({
  sourceType: z.enum(LEAD_SOURCE_TYPES).nullable().optional(),
  filters: z.record(z.string(), z.unknown()).default({}),
});

export const createCampaignBodySchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1).nullable().optional(),
  goal: z.string().min(1).nullable().optional(),
  status: z.enum(CAMPAIGN_STATUSES).default("draft"),
  templateId: z.string().min(1).nullable().optional(),
  audience: audienceSchema.optional(),
  scheduleAt: z.iso.datetime().nullable().optional(),
});

export const updateCampaignBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    subject: z.union([z.string().min(1), z.null()]).optional(),
    goal: z.union([z.string().min(1), z.null()]).optional(),
    status: z.enum(CAMPAIGN_STATUSES).optional(),
    templateId: z.union([z.string().min(1), z.null()]).optional(),
    audience: audienceSchema.optional(),
    scheduleAt: z.union([z.iso.datetime(), z.null()]).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.subject !== undefined ||
      data.goal !== undefined ||
      data.status !== undefined ||
      data.templateId !== undefined ||
      data.audience !== undefined ||
      data.scheduleAt !== undefined,
    { message: "É necessário informar ao menos um campo para atualização." },
  );

export const campaignParamsSchema = z.object({
  id: z.string().min(1),
});

export const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(CAMPAIGN_STATUSES).optional(),
  sourceType: z.enum(LEAD_SOURCE_TYPES).optional(),
});
