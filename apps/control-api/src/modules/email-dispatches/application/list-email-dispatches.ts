import type { Pool } from "pg";

import { buildPaginationMeta } from "../../../shared/persistence/build-pagination-meta.js";
import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import { listEmailDispatchesPage } from "../repositories/email-dispatch-repository.js";

type ListEmailDispatchesDependencies = {
  pgPool: Pool;
};

export type ListEmailDispatchesFilters = {
  campaignId?: string | undefined;
  contactId?: string | undefined;
  status?: "pending" | "queued" | "processing" | "sent" | "error" | undefined;
  page: number;
  pageSize: number;
};

export type EmailDispatchListItem = {
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

export type ListEmailDispatchesResult = {
  items: EmailDispatchListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function listEmailDispatches(
  dependencies: ListEmailDispatchesDependencies,
  filters: ListEmailDispatchesFilters,
): Promise<ListEmailDispatchesResult> {
  const { items, total } = await listEmailDispatchesPage(
    dependencies.pgPool,
    filters,
  );

  return {
    items: items.map((row) => ({
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
    })),
    ...buildPaginationMeta({
      page: filters.page,
      pageSize: filters.pageSize,
      total,
    }),
  };
}
