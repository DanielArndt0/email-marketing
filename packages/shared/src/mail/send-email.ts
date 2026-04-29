import { env } from "../config/index.js";
import {
  createMailTransporter,
  type MailTransportConfig,
} from "./create-mail-transporter.js";

export type SendEmailInput = {
  to: string;
  subject: string;
  text?: string | undefined;
  html?: string | undefined;
};

export type SendEmailSenderConfig = MailTransportConfig & {
  fromName: string;
  fromEmail: string;
  replyToEmail?: string | null | undefined;
};

function buildFrom(input: { fromName: string; fromEmail: string }): string {
  const safeFromName = input.fromName.replaceAll('"', "");

  return `"${safeFromName}" <${input.fromEmail}>`;
}

export async function sendEmail(
  input: SendEmailInput,
  senderConfig?: SendEmailSenderConfig,
) {
  const transporter = createMailTransporter(senderConfig);

  const result = await transporter.sendMail({
    from: senderConfig
      ? buildFrom({
          fromName: senderConfig.fromName,
          fromEmail: senderConfig.fromEmail,
        })
      : buildFrom({
          fromName: env.SMTP_FROM_NAME,
          fromEmail: env.SMTP_FROM_EMAIL,
        }),
    to: input.to,
    replyTo: senderConfig?.replyToEmail ?? undefined,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return {
    messageId: result.messageId,
  };
}
