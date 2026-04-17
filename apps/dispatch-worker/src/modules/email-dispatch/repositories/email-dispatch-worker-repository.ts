import type { Pool } from "pg";

import { emailDispatchStatus } from "core";

export type RawEmailDispatchRow = {
  id: string;
  campaignId: string;
  contactId: string;
  recipientEmail: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
};

export async function findEmailDispatchById(
  pgPool: Pool,
  dispatchId: string,
): Promise<RawEmailDispatchRow | null> {
  const result = await pgPool.query<RawEmailDispatchRow>(
    `
      SELECT
        id,
        campaign_id AS "campaignId",
        contact_id AS "contactId",
        recipient_email AS "recipientEmail",
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent"
      FROM email_dispatches
      WHERE id = $1
      LIMIT 1
    `,
    [dispatchId],
  );

  return result.rows[0] ?? null;
}

export async function markEmailDispatchProcessing(
  pgPool: Pool,
  dispatchId: string,
): Promise<void> {
  await pgPool.query(
    `
      UPDATE email_dispatches
      SET status = $2,
          error_message = NULL
      WHERE id = $1
    `,
    [dispatchId, emailDispatchStatus.processing],
  );
}

export async function markEmailDispatchSent(
  pgPool: Pool,
  input: { dispatchId: string; providerMessageId: string },
): Promise<void> {
  await pgPool.query(
    `
      UPDATE email_dispatches
      SET status = $2,
          provider_message_id = $3,
          sent_at = NOW(),
          error_message = NULL
      WHERE id = $1
    `,
    [input.dispatchId, emailDispatchStatus.sent, input.providerMessageId],
  );
}

export async function markEmailDispatchFailed(
  pgPool: Pool,
  input: { dispatchId: string; errorMessage: string },
): Promise<void> {
  await pgPool.query(
    `
      UPDATE email_dispatches
      SET status = $2,
          error_message = $3
      WHERE id = $1
    `,
    [input.dispatchId, emailDispatchStatus.error, input.errorMessage],
  );
}
