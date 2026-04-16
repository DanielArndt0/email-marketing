import type { Queue } from "bullmq";
import type { Pool } from "pg";

import type { EmailDispatchJobData } from "shared";

type RetryEmailDispatchDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
};

type RawRetryEmailDispatchRow = {
  id: string;
  campaignId: string;
  contactId: string;
  recipientEmail: string;
  subject: string;
  status: string;
};

export type RetryEmailDispatchResult =
  | {
      kind: "not_found";
    }
  | {
      kind: "invalid_status";
      currentStatus: string;
    }
  | {
      kind: "accepted";
      dispatchId: string;
      jobId: string | undefined;
      queueName: string;
    };

export async function retryEmailDispatch(
  dependencies: RetryEmailDispatchDependencies,
  dispatchId: string,
): Promise<RetryEmailDispatchResult> {
  const result = await dependencies.pgPool.query<RawRetryEmailDispatchRow>(
    `
      SELECT
        id,
        campaign_id AS "campaignId",
        contact_id AS "contactId",
        recipient_email AS "recipientEmail",
        subject,
        status
      FROM email_dispatches
      WHERE id = $1
      LIMIT 1
    `,
    [dispatchId],
  );

  const row = result.rows[0];

  if (!row) {
    return {
      kind: "not_found",
    };
  }

  if (row.status !== "error") {
    return {
      kind: "invalid_status",
      currentStatus: row.status,
    };
  }

  const job = await dependencies.queue.add("email-dispatch-retry", {
    dispatchId: row.id,
    campaignId: row.campaignId,
    contactId: row.contactId,
    to: row.recipientEmail,
    subject: row.subject,
  });

  await dependencies.pgPool.query(
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

  return {
    kind: "accepted",
    dispatchId: row.id,
    jobId: job.id?.toString(),
    queueName: job.queueName,
  };
}
