import { Queue } from "bullmq";

import { createRedisConnection } from "./create-redis-connection.js";

export const EMAIL_DISPATCH_QUEUE_NAME = "email-dispatch";

export type EmailDispatchJobData = {
  campaignId: string;
  contactId: string;
  to: string;
  subject: string;
};

export function createEmailDispatchQueue(): Queue<EmailDispatchJobData> {
  return new Queue<EmailDispatchJobData>(EMAIL_DISPATCH_QUEUE_NAME, {
    connection: createRedisConnection(),
  });
}
