import nodemailer from "nodemailer";

import { env } from "../config/index.js";

export type MailTransportConfig = {
  host: string;
  port: number;
  secure: boolean;
  username?: string | null | undefined;
  password?: string | null | undefined;
};

export function createMailTransporter(config?: MailTransportConfig) {
  const host = config?.host ?? env.SMTP_HOST;
  const port = config?.port ?? env.SMTP_PORT;
  const secure = config?.secure ?? env.SMTP_SECURE;

  const username = config?.username ?? env.SMTP_USER;
  const password = config?.password ?? env.SMTP_PASSWORD;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth:
      username && password
        ? {
            user: username,
            pass: password,
          }
        : undefined,
  });
}
