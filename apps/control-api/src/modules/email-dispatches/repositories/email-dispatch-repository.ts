import type { Pool } from "pg";

export type RawEmailDispatchListItem = {
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

type CountRow = { total: string };

type RetryCandidateRow = { id: string; status: string };

export async function listEmailDispatchesPage(
  pgPool: Pool,
  filters: {
    campaignId?: string | undefined;
    contactId?: string | undefined;
    status?: "pending" | "queued" | "processing" | "sent" | "error" | undefined;
    page: number;
    pageSize: number;
  },
): Promise<{ items: RawEmailDispatchListItem[]; total: number }> {
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

  const countResult = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM email_dispatches
      ${whereClause}
    `,
    values,
  );

  const listValues = [...values, filters.pageSize, offset];

  const listResult = await pgPool.query<RawEmailDispatchListItem>(
    `
      SELECT
        id,
        campaign_id AS "campaignId",
        contact_id AS "contactId",
        template_id AS "templateId",
        template_variables AS "templateVariables",
        recipient_email AS "recipientEmail",
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent",
        status,
        provider_message_id AS "providerMessageId",
        error_message AS "errorMessage",
        created_at AS "createdAt",
        sent_at AS "sentAt"
      FROM email_dispatches
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${listValues.length - 1}
      OFFSET $${listValues.length}
    `,
    listValues,
  );

  return {
    items: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? "0"),
  };
}

export async function findEmailDispatchById(
  pgPool: Pool,
  id: string,
): Promise<RawEmailDispatchListItem | null> {
  const result = await pgPool.query<RawEmailDispatchListItem>(
    `
      SELECT
        id,
        campaign_id AS "campaignId",
        contact_id AS "contactId",
        template_id AS "templateId",
        template_variables AS "templateVariables",
        recipient_email AS "recipientEmail",
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent",
        status,
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

  return result.rows[0] ?? null;
}

export async function findRetryCandidateById(
  pgPool: Pool,
  dispatchId: string,
): Promise<RetryCandidateRow | null> {
  const result = await pgPool.query<RetryCandidateRow>(
    `
      SELECT
        id,
        status
      FROM email_dispatches
      WHERE id = $1
      LIMIT 1
    `,
    [dispatchId],
  );

  return result.rows[0] ?? null;
}

export async function resetEmailDispatchForRetry(
  pgPool: Pool,
  dispatchId: string,
): Promise<void> {
  await pgPool.query(
    `
      UPDATE email_dispatches
      SET status = $2,
          error_message = NULL,
          provider_message_id = NULL,
          sent_at = NULL
      WHERE id = $1
    `,
    [dispatchId, "queued"],
  );
}
