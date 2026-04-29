import type { Pool } from "pg";

import { encryptSecret, env } from "shared";

import { insertSmtpSender } from "../repositories/smtp-sender-repository.js";
import { mapSmtpSenderRow, type SmtpSenderRecord } from "./shared.js";

type CreateSmtpSenderDependencies = {
  pgPool: Pool;
};

export type CreateSmtpSenderInput = {
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string | null | undefined;
  host: string;
  port: number;
  secure: boolean;
  username?: string | null | undefined;
  password?: string | null | undefined;
  isActive?: boolean | undefined;
};

export async function createSmtpSender(
  dependencies: CreateSmtpSenderDependencies,
  input: CreateSmtpSenderInput,
): Promise<SmtpSenderRecord> {
  const row = await insertSmtpSender(dependencies.pgPool, {
    name: input.name,
    fromName: input.fromName,
    fromEmail: input.fromEmail,
    replyToEmail: input.replyToEmail,
    host: input.host,
    port: input.port,
    secure: input.secure,
    username: input.username ?? null,
    passwordEncrypted: input.password
      ? encryptSecret(input.password, env.SMTP_SENDER_ENCRYPTION_KEY)
      : null,
    isActive: input.isActive ?? true,
  });

  return mapSmtpSenderRow(row);
}
