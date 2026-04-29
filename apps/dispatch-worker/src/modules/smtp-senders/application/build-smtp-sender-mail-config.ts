import { decryptSecret, env, type SendEmailSenderConfig } from "shared";

import type { RawWorkerSmtpSenderRow } from "../repositories/smtp-sender-repository.js";

export function buildSmtpSenderMailConfig(
  sender: RawWorkerSmtpSenderRow,
): SendEmailSenderConfig {
  const password =
    sender.passwordEncrypted && sender.username
      ? decryptSecret(sender.passwordEncrypted, env.SMTP_SENDER_ENCRYPTION_KEY)
      : null;

  return {
    host: sender.host,
    port: sender.port,
    secure: sender.secure,
    username: sender.username,
    password,
    fromName: sender.fromName,
    fromEmail: sender.fromEmail,
    replyToEmail: sender.replyToEmail,
  };
}
