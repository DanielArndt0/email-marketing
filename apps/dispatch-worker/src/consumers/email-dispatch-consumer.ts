import { Worker } from "bullmq";

import { createLogger, createRedisConnection, sendEmail } from "shared";

import {
  EMAIL_DISPATCH_QUEUE_NAME,
  type EmailDispatchJobData,
} from "../jobs/email-dispatch-job.js";

const logger = createLogger({
  serviceName: "dispatch-worker",
});

export function createEmailDispatchConsumer(): Worker<EmailDispatchJobData> {
  const connection = createRedisConnection();

  const worker = new Worker<EmailDispatchJobData>(
    EMAIL_DISPATCH_QUEUE_NAME,
    async (job) => {
      logger.info(
        {
          jobId: job.id,
          queueName: EMAIL_DISPATCH_QUEUE_NAME,
          campaignId: job.data.campaignId,
          contactId: job.data.contactId,
          to: job.data.to,
          subject: job.data.subject,
        },
        "job de envio de e-mail recebido pelo worker",
      );

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

      logger.info(
        {
          jobId: job.id,
          queueName: EMAIL_DISPATCH_QUEUE_NAME,
          messageId: result.messageId,
        },
        "e-mail enviado com sucesso pelo worker",
      );

      return {
        processed: true,
        messageId: result.messageId,
      };
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
