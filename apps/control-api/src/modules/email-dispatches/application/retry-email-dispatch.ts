import type { Queue } from "bullmq";
import type { Pool } from "pg";

import {
  campaignStatus,
  canRetryEmailDispatch,
  validateCampaignStatusTransition,
} from "core";
import type { EmailDispatchJobData } from "shared";
import { EMAIL_DISPATCH_RETRY_JOB_NAME } from "shared";

import {
  findCampaignStatusById,
  transitionCampaignStatusById,
} from "../../campaigns/repositories/campaign-repository.js";
import {
  findRetryCandidateById,
  resetEmailDispatchForRetry,
} from "../repositories/email-dispatch-repository.js";

type RetryEmailDispatchDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
};

export type RetryEmailDispatchResult =
  | { kind: "not_found" }
  | { kind: "invalid_status"; currentStatus: string }
  | { kind: "campaign_not_found"; campaignId: string }
  | { kind: "campaign_canceled"; campaignId: string }
  | {
      kind: "campaign_invalid_status";
      campaignId: string;
      currentStatus: string;
      allowedTransitions: string[];
    }
  | {
      kind: "campaign_status_conflict";
      campaignId: string;
      expectedStatus: string;
      requestedStatus: string;
    }
  | {
      kind: "accepted";
      dispatchId: string;
      campaignId: string;
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
    return { kind: "not_found" };
  }

  if (!canRetryEmailDispatch(candidate.status)) {
    return { kind: "invalid_status", currentStatus: candidate.status };
  }

  const campaignCurrentStatus = await findCampaignStatusById(
    dependencies.pgPool,
    candidate.campaignId,
  );

  if (!campaignCurrentStatus) {
    return { kind: "campaign_not_found", campaignId: candidate.campaignId };
  }

  if (campaignCurrentStatus === campaignStatus.canceled) {
    return { kind: "campaign_canceled", campaignId: candidate.campaignId };
  }

  if (campaignCurrentStatus !== campaignStatus.running) {
    const transitionValidation = validateCampaignStatusTransition(
      campaignCurrentStatus,
      campaignStatus.running,
      "system",
    );

    if (!transitionValidation.valid) {
      return {
        kind: "campaign_invalid_status",
        campaignId: candidate.campaignId,
        currentStatus: campaignCurrentStatus,
        allowedTransitions: transitionValidation.allowedTransitions,
      };
    }

    const transitioned = await transitionCampaignStatusById(
      dependencies.pgPool,
      {
        campaignId: candidate.campaignId,
        from: campaignCurrentStatus,
        to: campaignStatus.running,
      },
    );

    if (!transitioned) {
      return {
        kind: "campaign_status_conflict",
        campaignId: candidate.campaignId,
        expectedStatus: campaignCurrentStatus,
        requestedStatus: campaignStatus.running,
      };
    }
  }

  await resetEmailDispatchForRetry(dependencies.pgPool, dispatchId);

  const job = await dependencies.queue.add(EMAIL_DISPATCH_RETRY_JOB_NAME, {
    dispatchId: candidate.id,
  });

  return {
    kind: "accepted",
    dispatchId: candidate.id,
    campaignId: candidate.campaignId,
    jobId: job.id?.toString(),
    queueName: job.queueName,
  };
}
