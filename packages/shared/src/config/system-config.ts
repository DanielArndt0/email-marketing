import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

import { z } from "zod";

import { findUp } from "./find-up.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const paginationSchema = z.object({
  defaultPage: z.number().int().positive(),
  defaultPageSize: z.number().int().positive(),
  maxPageSize: z.number().int().positive(),
});

const systemConfigSchema = z.object({
  api: z.object({
    pagination: z.object({
      campaigns: paginationSchema,
      templates: paginationSchema,
      emailDispatches: paginationSchema,
      audiences: paginationSchema,
    }),
    preview: z.object({
      defaultRecipientsLimit: z.number().int().positive(),
      maxRecipientsLimit: z.number().int().positive(),
    }),
  }),
  queues: z.object({
    emailDispatch: z.object({
      name: z.string().min(1),
      enqueueJobName: z.string().min(1),
      retryJobName: z.string().min(1),
    }),
  }),
  mail: z.object({
    fallbackText: z.string().min(1),
  }),
  leadSources: z.object({
    cnpjApi: z.object({
      listByCnaePath: z.string().min(1),
      listByCompanyNamePath: z.string().min(1),
      listByPartnerNamePath: z.string().min(1),
    }),
    csvImport: z.object({
      defaultDelimiter: z.string().min(1),
      defaultEmailColumn: z.string().min(1),
    }),
  }),
});

function loadSystemConfig() {
  const configPath =
    findUp("config/system.config.json", process.cwd()) ??
    findUp("config/system.config.json", __dirname);

  if (!configPath) {
    throw new Error(
      "Não foi possível localizar o arquivo config/system.config.json.",
    );
  }

  const fileContents = readFileSync(configPath, "utf-8");
  const parsedConfig = JSON.parse(fileContents);

  return systemConfigSchema.parse(parsedConfig);
}

export const systemConfig = loadSystemConfig();
export type SystemConfig = typeof systemConfig;
