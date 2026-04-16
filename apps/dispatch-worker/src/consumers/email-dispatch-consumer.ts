import { Worker } from "bullmq";
import type { Pool } from "pg";

import { createLogger, createRedisConnection, sendEmail } from "shared";

import {
  EMAIL_DISPATCH_QUEUE_NAME,
  type EmailDispatchJobData,
} from "../jobs/email-dispatch-job.js";

const logger = createLogger({
  serviceName: "dispatch-worker",
});

type CreateEmailDispatchConsumerDependencies = {
  pgPool: Pool;
};

export function createEmailDispatchConsumer(
  dependencies: CreateEmailDispatchConsumerDependencies,
): Worker<EmailDispatchJobData> {
  const connection = createRedisConnection();

  const worker = new Worker<EmailDispatchJobData>(
    EMAIL_DISPATCH_QUEUE_NAME,
    async (job) => {
      logger.info(
        {
          jobId: job.id,
          queueName: EMAIL_DISPATCH_QUEUE_NAME,
          dispatchId: job.data.dispatchId,
          campaignId: job.data.campaignId,
          contactId: job.data.contactId,
          to: job.data.to,
          subject: job.data.subject,
        },
        "job de envio de e-mail recebido pelo worker",
      );

      await dependencies.pgPool.query(
        `
          UPDATE email_dispatches
          SET status = $2,
              error_message = NULL
          WHERE id = $1
        `,
        [job.data.dispatchId, "processing"],
      );

      try {
        const result = await sendEmail({
          to: job.data.to,
          subject: job.data.subject,
          text: `Envio processado para campaignId=${job.data.campaignId} e contactId=${job.data.contactId}.`,
          html: `
            <p>Envio processado com sucesso.</p>
            <p><strong>Campaign ID:</strong> ${job.data.campaignId}</p>
            <p><strong>Contact ID:</strong> ${job.data.contactId}</p>
          `,
        });

        await dependencies.pgPool.query(
          `
            UPDATE email_dispatches
            SET status = $2,
                provider_message_id = $3,
                sent_at = NOW(),
                error_message = NULL
            WHERE id = $1
          `,
          [job.data.dispatchId, "sent", result.messageId],
        );

        logger.info(
          {
            jobId: job.id,
            queueName: EMAIL_DISPATCH_QUEUE_NAME,
            dispatchId: job.data.dispatchId,
            messageId: result.messageId,
          },
          "e-mail enviado com sucesso pelo worker",
        );

        return {
          processed: true,
          messageId: result.messageId,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao enviar e-mail";

        await dependencies.pgPool.query(
          `
            UPDATE email_dispatches
            SET status = $2,
                error_message = $3
            WHERE id = $1
          `,
          [job.data.dispatchId, "error", errorMessage],
        );

        throw error;
      }
    },
    {
      connection,
    },
  );

  worker.on("completed", (job) => {
    logger.info(
      {
        jobId: job.id,
        queueName: EMAIL_DISPATCH_QUEUE_NAME,
      },
      "job processado com sucesso",
    );
  });

  worker.on("failed", (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        queueName: EMAIL_DISPATCH_QUEUE_NAME,
        err: error,
      },
      "falha ao processar job",
    );
  });

  worker.on("error", (error) => {
    logger.error(
      {
        err: error,
        queueName: EMAIL_DISPATCH_QUEUE_NAME,
      },
      "erro no worker da fila de envio de e-mail",
    );
  });

  return worker;
}
