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

type RawEmailDispatchRow = {
  id: string;
  campaignId: string;
  contactId: string;
  recipientEmail: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
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
        },
        "job de envio de e-mail recebido pelo worker",
      );

      const dispatchResult =
        await dependencies.pgPool.query<RawEmailDispatchRow>(
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
          [job.data.dispatchId],
        );

      const dispatch = dispatchResult.rows[0];

      if (!dispatch) {
        throw new Error(
          `Email dispatch ${job.data.dispatchId} não encontrado.`,
        );
      }

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
        const emailInput = {
          to: dispatch.recipientEmail,
          subject: dispatch.subject,
          text:
            dispatch.textContent ??
            "Envio processado pelo dispatch-worker sem conteúdo de texto definido.",
          ...(dispatch.htmlContent ? { html: dispatch.htmlContent } : {}),
        };

        const result = await sendEmail(emailInput);

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
            campaignId: dispatch.campaignId,
            contactId: dispatch.contactId,
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
