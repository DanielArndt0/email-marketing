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

const campaignSmtpSenderSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    fromName: z.string().min(1),
    fromEmail: z.string().min(1),
    replyToEmail: z.string().nullable(),
    isActive: z.boolean(),
  })
  .nullable();

const templateVariableMappingSchema = z.union([
  z.object({
    source: z.literal("lead"),
    path: z.string().min(1),
    fallback: z.string().optional(),
  }),
  z.object({
    source: z.literal("static"),
    value: z.string(),
  }),
]);

const templateVariableMappingsSchema = z
  .record(z.string(), templateVariableMappingSchema)
  .default({});

export const createCampaignBodySchema = z.object({
  name: z.string().min(1),
  subject: z.union([z.string().min(1), z.null()]).optional(),
  goal: z.union([z.string().min(1), z.null()]).optional(),
  status: z.enum(CAMPAIGN_STATUSES).default("draft"),
  templateId: z.string().min(1).nullable().optional(),
  audienceId: z.string().min(1).nullable().optional(),
  smtpSenderId: z.string().min(1).nullable().optional(),
  templateVariableMappings: templateVariableMappingsSchema.optional(),
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
    smtpSenderId: z.union([z.string().min(1), z.null()]).optional(),
    templateVariableMappings: templateVariableMappingsSchema.optional(),
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
      data.smtpSenderId !== undefined ||
      data.templateVariableMappings !== undefined ||
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
  smtpSenderId: z.string().nullable(),
  smtpSender: campaignSmtpSenderSchema,
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
