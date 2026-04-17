import type { Queue } from "bullmq";
import type { Pool } from "pg";

import { canRetryEmailDispatch } from "core";
import type { EmailDispatchJobData } from "shared";
import { EMAIL_DISPATCH_RETRY_JOB_NAME } from "shared";

import {
  findRetryCandidateById,
  resetEmailDispatchForRetry,
} from "../repositories/email-dispatch-repository.js";

type RetryEmailDispatchDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
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
  const candidate = await findRetryCandidateById(
    dependencies.pgPool,
    dispatchId,
  );

  if (!candidate) {
    return {
      kind: "not_found",
    };
  }

  if (!canRetryEmailDispatch(candidate.status)) {
    return {
      kind: "invalid_status",
      currentStatus: candidate.status,
    };
  }

  const job = await dependencies.queue.add(EMAIL_DISPATCH_RETRY_JOB_NAME, {
    dispatchId: candidate.id,
  });

  await resetEmailDispatchForRetry(dependencies.pgPool, dispatchId);

  return {
    kind: "accepted",
    dispatchId: candidate.id,
    jobId: job.id?.toString(),
    queueName: job.queueName,
  };
}
