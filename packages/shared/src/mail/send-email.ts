import { env } from "../config/index.js";
import {
  createMailTransporter,
  type MailTransportConfig,
} from "./create-mail-transporter.js";

export type SendEmailAttachmentInput = {
  filename: string;
  path: string;
  contentType?: string | undefined;
  cid?: string | undefined;
  contentDisposition?: "inline" | "attachment" | undefined;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  text?: string | undefined;
  html?: string | undefined;
  attachments?: SendEmailAttachmentInput[] | undefined;
};

export type SendEmailSenderConfig = MailTransportConfig & {
  fromName: string;
  fromEmail: string;
  replyToEmail?: string | null | undefined;
};

type NodemailerAttachment = {
  filename: string;
  path: string;
  contentType?: string | undefined;
  cid?: string | undefined;
  contentDisposition?: "inline" | "attachment" | undefined;
};

function buildFrom(input: { fromName: string; fromEmail: string }): string {
  const safeFromName = input.fromName.replaceAll('"', "");

  return `"${safeFromName}" <${input.fromEmail}>`;
}

function mapAttachment(
  attachment: SendEmailAttachmentInput,
): NodemailerAttachment {
  const result: NodemailerAttachment = {
    filename: attachment.filename,
    path: attachment.path,
  };

  if (attachment.contentType) {
    result.contentType = attachment.contentType;
  }

  if (attachment.cid) {
    result.cid = attachment.cid;
  }

  if (attachment.contentDisposition) {
    result.contentDisposition = attachment.contentDisposition;
  }

  return result;
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
    attachments: input.attachments?.map(mapAttachment),
  });

  return {
    messageId: result.messageId,
  };
}
