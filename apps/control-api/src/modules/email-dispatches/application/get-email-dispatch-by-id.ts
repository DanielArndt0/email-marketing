import type { Pool } from "pg";

import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import { findEmailDispatchById } from "../repositories/email-dispatch-repository.js";

type GetEmailDispatchByIdDependencies = {
  pgPool: Pool;
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

export async function getEmailDispatchById(
  dependencies: GetEmailDispatchByIdDependencies,
  id: string,
): Promise<EmailDispatchDetails | null> {
  const row = await findEmailDispatchById(dependencies.pgPool, id);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    campaignId: row.campaignId,
    contactId: row.contactId,
    templateId: row.templateId,
    templateVariables: row.templateVariables,
    recipientEmail: row.recipientEmail,
    subject: row.subject,
    htmlContent: row.htmlContent,
    textContent: row.textContent,
    status: row.status,
    providerMessageId: row.providerMessageId,
    errorMessage: row.errorMessage,
    createdAt: normalizeDateValue(row.createdAt) ?? "",
    sentAt: normalizeDateValue(row.sentAt),
  };
}
