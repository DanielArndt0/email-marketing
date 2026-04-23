import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { z } from "zod";

import { findUp } from "./find-up.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvironment(): void {
  const explicitEnvPath = process.env.ENV_FILE_PATH;

  if (explicitEnvPath) {
    dotenv.config({ path: explicitEnvPath });
    return;
  }

  const envPath = findUp(".env", process.cwd()) ?? findUp(".env", __dirname);

  if (envPath) {
    dotenv.config({ path: envPath });
    return;
  }

  dotenv.config();
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (["true", "1", "yes", "y", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "n", "off"].includes(normalized)) {
    return false;
  }

  return undefined;
}

loadEnvironment();

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  API_PORT: z.coerce.number().int().positive().default(3333),

  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().default("email_marketing"),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("postgres"),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),

  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z.preprocess(parseBoolean, z.boolean().default(false)),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_NAME: z.string().default("Mail Engine"),
  SMTP_FROM_EMAIL: z.string().email().default("no-reply@example.com"),

  CNPJ_API_BASE_URL: z.string().url().optional(),
  CNPJ_API_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  CNPJ_API_TOKEN: z.string().optional(),
});

export const env = environmentSchema.parse(process.env);

export type Environment = typeof env;
