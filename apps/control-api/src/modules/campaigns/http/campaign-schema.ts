import { CAMPAIGN_STATUSES } from "core";
import { z } from "zod";

const audienceSummarySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    sourceType: z.string().min(1),
    filters: z.record(z.string(), z.unknown()).default({}),
  })
  .nullable();

export const createCampaignBodySchema = z.object({
  name: z.string().min(1),
  subject: z.union([z.string().min(1), z.null()]).optional(),
  goal: z.string().min(1).optional(),
  status: z.enum(CAMPAIGN_STATUSES).default("draft"),
  templateId: z.string().min(1).nullable().optional(),
  audienceId: z.string().min(1).nullable().optional(),
  scheduleAt: z.iso.datetime().nullable().optional(),
});

export const updateCampaignBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    subject: z.union([z.string().min(1), z.null()]).optional(),
    goal: z.union([z.string().min(1), z.null()]).optional(),
    status: z.enum(CAMPAIGN_STATUSES).optional(),
    templateId: z.union([z.string().min(1), z.null()]).optional(),
    audienceId: z.union([z.string().min(1), z.null()]).optional(),
    scheduleAt: z.union([z.iso.datetime(), z.null()]).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.subject !== undefined ||
      data.goal !== undefined ||
      data.status !== undefined ||
      data.templateId !== undefined ||
      data.audienceId !== undefined ||
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
  audienceId: z.string().min(1).optional(),
});

export const campaignSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  subject: z.string().nullable(),
  goal: z.string().nullable(),
  status: z.enum(CAMPAIGN_STATUSES),
  templateId: z.string().nullable(),
  audienceId: z.string().nullable(),
  audience: audienceSummarySchema,
  scheduleAt: z.string().nullable(),
  lastExecutionAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const campaignPaginationResponseSchema = z.object({
  items: z.array(campaignSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const notFoundMessageSchema = z.object({
  message: z.string(),
});
