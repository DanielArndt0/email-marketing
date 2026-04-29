import type { Pool } from "pg";

import { encryptSecret, env } from "shared";

import { updateSmtpSenderById } from "../repositories/smtp-sender-repository.js";
import { mapSmtpSenderRow, type SmtpSenderRecord } from "./shared.js";

type UpdateSmtpSenderDependencies = {
  pgPool: Pool;
};

export type UpdateSmtpSenderInput = {
  id: string;
  name?: string | undefined;
  fromName?: string | undefined;
  fromEmail?: string | undefined;
  replyToEmail?: string | null | undefined;
  host?: string | undefined;
  port?: number | undefined;
  secure?: boolean | undefined;
  username?: string | null | undefined;
  password?: string | null | undefined;
  isActive?: boolean | undefined;
};

export type UpdateSmtpSenderResult =
  | { kind: "not_found" }
  | { kind: "updated"; smtpSender: SmtpSenderRecord };

export async function updateSmtpSender(
  dependencies: UpdateSmtpSenderDependencies,
  input: UpdateSmtpSenderInput,
): Promise<UpdateSmtpSenderResult> {
  const row = await updateSmtpSenderById(dependencies.pgPool, {
    id: input.id,
    name: input.name,
    fromName: input.fromName,
    fromEmail: input.fromEmail,
    replyToEmail: input.replyToEmail,
    host: input.host,
    port: input.port,
    secure: input.secure,
    username: input.username,
    passwordEncrypted:
      input.password === undefined
        ? undefined
        : input.password
          ? encryptSecret(input.password, env.SMTP_SENDER_ENCRYPTION_KEY)
          : null,
    isActive: input.isActive,
  });

  if (!row) {
    return { kind: "not_found" };
  }

  return {
    kind: "updated",
    smtpSender: mapSmtpSenderRow(row),
  };
}
