import { Worker } from "bullmq";
import type { Pool } from "pg";

import {
  createLogger,
  createRedisConnection,
  EMAIL_DISPATCH_QUEUE_NAME,
} from "shared";

import type { EmailDispatchJobData } from "../jobs/email-dispatch-job.js";
import { processEmailDispatch } from "../modules/email-dispatch/application/process-email-dispatch.js";

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
        },
        "job de envio de e-mail recebido pelo worker",
      );

      const result = await processEmailDispatch(dependencies, {
        dispatchId: job.data.dispatchId,
      });

      logger.info(
        {
          jobId: job.id,
          queueName: EMAIL_DISPATCH_QUEUE_NAME,
          dispatchId: job.data.dispatchId,
          campaignId: result.campaignId,
          contactId: result.contactId,
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
