import type { Pool } from "pg";

type GetEmailDispatchByIdDependencies = {
  pgPool: Pool;
};

type RawEmailDispatch = {
  id: string;
  campaignId: string;
  contactId: string;
  templateId: string | null;
  templateVariables: Record<string, string>;
  recipientEmail: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  status: string;
  providerMessageId: string | null;
  errorMessage: string | null;
  createdAt: Date | string;
  sentAt: Date | string | null;
};

export type EmailDispatchDetails = {
  id: string;
  campaignId: string;
  contactId: string;
  templateId: string | null;
  templateVariables: Record<string, string>;
  recipientEmail: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
  status: string;
  providerMessageId: string | null;
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
};

function normalizeDateValue(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export async function getEmailDispatchById(
  dependencies: GetEmailDispatchByIdDependencies,
  id: string,
): Promise<EmailDispatchDetails | null> {
  const result = await dependencies.pgPool.query<RawEmailDispatch>(
    `
      SELECT
        id,
        campaign_id AS "campaignId",
        contact_id AS "contactId",
        recipient_email AS "recipientEmail",
        subject,
        status,
        template_id AS "templateId",
        template_variables AS "templateVariables",
        html_content AS "htmlContent",
        text_content AS "textContent",
        provider_message_id AS "providerMessageId",
        error_message AS "errorMessage",
        created_at AS "createdAt",
        sent_at AS "sentAt"
      FROM email_dispatches
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    campaignId: row.campaignId,
    contactId: row.contactId,
    recipientEmail: row.recipientEmail,
    subject: row.subject,
    status: row.status,
    templateId: row.templateId,
    templateVariables: row.templateVariables,
    htmlContent: row.htmlContent,
    textContent: row.textContent,
    providerMessageId: row.providerMessageId,
    errorMessage: row.errorMessage,
    createdAt: normalizeDateValue(row.createdAt) ?? "",
    sentAt: normalizeDateValue(row.sentAt),
  };
}
