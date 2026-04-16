import type { Pool } from "pg";

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

type RawEmailDispatchListItem = {
  id: string;
  campaignId: string;
  contactId: string;
  templateId: string | null;
  recipientEmail: string;
  subject: string;
  status: string;
  providerMessageId: string | null;
  errorMessage: string | null;
  createdAt: Date | string;
  sentAt: Date | string | null;
};

type RawCountRow = {
  total: string;
};

export type EmailDispatchListItem = {
  id: string;
  campaignId: string;
  contactId: string;
  templateId: string | null;
  recipientEmail: string;
  subject: string;
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

function normalizeDateValue(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export async function listEmailDispatches(
  dependencies: ListEmailDispatchesDependencies,
  filters: ListEmailDispatchesFilters,
): Promise<ListEmailDispatchesResult> {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (filters.campaignId) {
    values.push(filters.campaignId);
    conditions.push(`campaign_id = $${values.length}`);
  }

  if (filters.contactId) {
    values.push(filters.contactId);
    conditions.push(`contact_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const offset = (filters.page - 1) * filters.pageSize;

  const countResult = await dependencies.pgPool.query<RawCountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM email_dispatches
      ${whereClause}
    `,
    values,
  );

  const total = Number(countResult.rows[0]?.total ?? "0");
  const totalPages = total === 0 ? 0 : Math.ceil(total / filters.pageSize);

  const paginatedValues = [...values, filters.pageSize, offset];

  const query = `
    SELECT
      id,
      campaign_id AS "campaignId",
      contact_id AS "contactId",
      template_id AS "templateId",
      recipient_email AS "recipientEmail",
      subject,
      status,
      provider_message_id AS "providerMessageId",
      error_message AS "errorMessage",
      created_at AS "createdAt",
      sent_at AS "sentAt"
    FROM email_dispatches
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paginatedValues.length - 1}
    OFFSET $${paginatedValues.length}
  `;

  const result = await dependencies.pgPool.query<RawEmailDispatchListItem>(
    query,
    paginatedValues,
  );

  return {
    items: result.rows.map((row) => ({
      id: row.id,
      campaignId: row.campaignId,
      contactId: row.contactId,
      templateId: row.templateId,
      recipientEmail: row.recipientEmail,
      subject: row.subject,
      status: row.status,
      providerMessageId: row.providerMessageId,
      errorMessage: row.errorMessage,
      createdAt: normalizeDateValue(row.createdAt) ?? "",
      sentAt: normalizeDateValue(row.sentAt),
    })),
    page: filters.page,
    pageSize: filters.pageSize,
    total,
    totalPages,
  };
}
