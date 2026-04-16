import { env } from "../config/index.js";
import { createMailTransporter } from "./create-mail-transporter.js";

export type SendEmailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const transporter = createMailTransporter();

  const result = await transporter.sendMail({
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return {
    messageId: result.messageId,
  };
}
