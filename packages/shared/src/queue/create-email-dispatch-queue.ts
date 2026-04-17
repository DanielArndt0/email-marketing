import { Queue } from "bullmq";

import { systemConfig } from "../config/index.js";
import { createRedisConnection } from "./create-redis-connection.js";

export const EMAIL_DISPATCH_QUEUE_NAME = systemConfig.queues.emailDispatch.name;
export const EMAIL_DISPATCH_ENQUEUE_JOB_NAME =
  systemConfig.queues.emailDispatch.enqueueJobName;
export const EMAIL_DISPATCH_RETRY_JOB_NAME =
  systemConfig.queues.emailDispatch.retryJobName;

export type EmailDispatchJobData = {
  dispatchId: string;
};

export function createEmailDispatchQueue(): Queue<EmailDispatchJobData> {
  return new Queue<EmailDispatchJobData>(EMAIL_DISPATCH_QUEUE_NAME, {
    connection: createRedisConnection(),
  });
}
