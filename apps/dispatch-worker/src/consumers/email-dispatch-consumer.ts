import { Worker } from "bullmq";

import { createLogger, createRedisConnection } from "shared";

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
      // Futuramente, entraremos com a orquestração real
      // de envio de e-mail via SMTP/Nodemailer.
      return {
        processed: true,
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
