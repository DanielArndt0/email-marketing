import { randomUUID } from "node:crypto";

import type { Queue } from "bullmq";
import type { Pool } from "pg";

import type { EmailDispatchJobData } from "shared";

type EnqueueEmailDispatchDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
};

export type EnqueueEmailDispatchInput = {
  campaignId: string;
  campaignName: string;
  contactId: string;
  to: string;
  subject: string;
};

export async function enqueueEmailDispatch(
  dependencies: EnqueueEmailDispatchDependencies,
  input: EnqueueEmailDispatchInput,
) {
  const dispatchId = randomUUID();
  const client = await dependencies.pgPool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        INSERT INTO campaigns (id, name, subject)
        VALUES ($1, $2, $3)
        ON CONFLICT (id)
        DO UPDATE SET
          name = EXCLUDED.name,
          subject = EXCLUDED.subject
      `,
      [input.campaignId, input.campaignName, input.subject],
    );

    await client.query(
      `
        INSERT INTO contacts (id, email)
        VALUES ($1, $2)
        ON CONFLICT (id)
        DO UPDATE SET
          email = EXCLUDED.email
      `,
      [input.contactId, input.to],
    );

    await client.query(
      `
        INSERT INTO email_dispatches (
          id,
          campaign_id,
          contact_id,
          recipient_email,
          subject,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        dispatchId,
        input.campaignId,
        input.contactId,
        input.to,
        input.subject,
        "pending",
      ],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  try {
    const job = await dependencies.queue.add("email-dispatch", {
      dispatchId,
      campaignId: input.campaignId,
      contactId: input.contactId,
      to: input.to,
      subject: input.subject,
    });

    await dependencies.pgPool.query(
      `
        UPDATE email_dispatches
        SET status = $2
        WHERE id = $1
      `,
      [dispatchId, "queued"],
    );

    return {
      dispatchId,
      jobId: job.id,
      queueName: job.queueName,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao enfileirar job";

    await dependencies.pgPool.query(
      `
        UPDATE email_dispatches
        SET status = $2,
            error_message = $3
        WHERE id = $1
      `,
      [dispatchId, "error", errorMessage],
    );

    throw error;
  }
}
