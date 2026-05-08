import { z } from "zod";

export const createEmailFileBodySchema = z.object({
  originalName: z.string().trim().min(1),
  storedName: z.string().trim().min(1).optional(),
  mimeType: z.string().trim().min(1),
  sizeBytes: z.coerce.number().int().nonnegative(),
  storageKey: z.string().trim().min(1),
  cid: z.string().trim().min(1).optional(),
});

export const templateFileParamsSchema = z.object({
  templateId: z.string().min(1),
});

export const emailFileParamsSchema = z.object({
  templateId: z.string().min(1),
  fileId: z.string().min(1),
});

export const emailFilePaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
