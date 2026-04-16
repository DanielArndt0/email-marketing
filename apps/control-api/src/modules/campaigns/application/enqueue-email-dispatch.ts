import type { Queue } from "bullmq";

import type { EmailDispatchJobData } from "shared";

type EnqueueEmailDispatchDependencies = {
  queue: Queue<EmailDispatchJobData>;
};

export type EnqueueEmailDispatchInput = {
  campaignId: string;
  contactId: string;
  to: string;
  subject: string;
};

export async function enqueueEmailDispatch(
  dependencies: EnqueueEmailDispatchDependencies,
  input: EnqueueEmailDispatchInput,
) {
  const job = await dependencies.queue.add("email-dispatch", input);

  return {
    jobId: job.id,
    queueName: job.queueName,
  };
}
