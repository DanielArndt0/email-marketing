import type { Queue } from "bullmq";
import type { Pool } from "pg";

import type { CampaignStatus } from "core";
import { campaignStatus, validateCampaignDispatchReadiness } from "core";
import type { EmailDispatchJobData } from "shared";

import type { LeadSourceProviderRegistry } from "../../audiences/adapters/lead-source-provider-registry.js";
import { resolveAudience } from "../../audiences/application/resolve-audience.js";
import { enqueueEmailDispatch } from "./enqueue-email-dispatch.js";
import { mapCampaignRow } from "./shared.js";
import {
  findCampaignById,
  transitionCampaignStatusById,
} from "../repositories/campaign-repository.js";
import { resolveTemplateVariablesFromLead } from "./resolve-template-variables.js";

type DispatchCampaignDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
  providerRegistry: LeadSourceProviderRegistry;
};

export type DispatchCampaignInput = {
  campaignId: string;
  limit?: number | undefined;
};

export type DispatchCampaignResult =
  | { kind: "not_found"; campaignId: string }
  | {
      kind: "invalid_status";
      campaignId: string;
      status: CampaignStatus;
      allowedStatuses: CampaignStatus[];
    }
  | {
      kind: "status_conflict";
      campaignId: string;
      expectedStatus: CampaignStatus;
      requestedStatus: CampaignStatus;
    }
  | { kind: "missing_template"; campaignId: string }
  | { kind: "missing_audience"; campaignId: string }
  | { kind: "missing_smtp_sender"; campaignId: string }
  | { kind: "inactive_smtp_sender"; campaignId: string }
  | {
      kind: "accepted";
      campaignId: string;
      resolvedRecipientsCount: number;
      createdDispatchesCount: number;
      queuedDispatchesCount: number;
      skippedRecipientsCount: number;
      dispatchIds: string[];
    };

function getRecipientEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim();

  return email.length > 0 ? email : null;
}

function getContactId(input: {
  campaignId: string;
  email: string;
  externalId: string | null;
}): string {
  return input.externalId ?? `${input.campaignId}:${input.email.toLowerCase()}`;
}

async function markCampaignDispatchPreparationFailed(
  dependencies: DispatchCampaignDependencies,
  input: { campaignId: string },
): Promise<void> {
  await transitionCampaignStatusById(dependencies.pgPool, {
    campaignId: input.campaignId,
    from: campaignStatus.running,
    to: campaignStatus.failed,
  });
}

export async function dispatchCampaign(
  dependencies: DispatchCampaignDependencies,
  input: DispatchCampaignInput,
): Promise<DispatchCampaignResult> {
  const campaignRow = await findCampaignById(
    dependencies.pgPool,
    input.campaignId,
  );

  if (!campaignRow) {
    return { kind: "not_found", campaignId: input.campaignId };
  }

  const campaign = mapCampaignRow(campaignRow);
  const readiness = validateCampaignDispatchReadiness({
    status: campaign.status,
    hasTemplate: Boolean(campaign.templateId && campaign.template),
    hasAudience: Boolean(campaign.audienceId && campaign.audience),
    hasSmtpSender: Boolean(campaign.smtpSenderId && campaign.smtpSender),
    isSmtpSenderActive: Boolean(campaign.smtpSender?.isActive),
  });

  if (!readiness.ready) {
    if (readiness.reason === "invalid_status") {
      return {
        kind: "invalid_status",
        campaignId: campaign.id,
        status: campaign.status,
        allowedStatuses: readiness.allowedStatuses ?? [],
      };
    }

    return { kind: readiness.reason, campaignId: campaign.id };
  }

  const transitionedToRunning = await transitionCampaignStatusById(
    dependencies.pgPool,
    {
      campaignId: campaign.id,
      from: campaign.status,
      to: campaignStatus.running,
      touchLastExecutionAt: true,
    },
  );

  if (!transitionedToRunning) {
    return {
      kind: "status_conflict",
      campaignId: campaign.id,
      expectedStatus: campaign.status,
      requestedStatus: campaignStatus.running,
    };
  }

  try {
    const resolvedAudience = await resolveAudience(
      { providerRegistry: dependencies.providerRegistry },
      {
        sourceType: campaign.audience!.sourceType,
        filters: campaign.audience!.filters,
        limit: input.limit,
      },
    );

    const dispatchIds: string[] = [];
    let skippedRecipientsCount = 0;

    for (const lead of resolvedAudience.items) {
      const email = getRecipientEmail(lead.email);

      if (!email) {
        skippedRecipientsCount += 1;
        continue;
      }

      const templateVariables = resolveTemplateVariablesFromLead(
        campaign.templateVariableMappings,
        lead,
      );

      const result = await enqueueEmailDispatch(
        { pgPool: dependencies.pgPool, queue: dependencies.queue },
        {
          campaignId: campaign.id,
          campaignName: campaign.name,
          contactId: getContactId({
            campaignId: campaign.id,
            email,
            externalId: lead.externalId,
          }),
          to: email,
          smtpSenderId: campaign.smtpSenderId!,
          templateId: campaign.templateId!,
          templateVariables,
        },
      );

      if (result.kind === "accepted") {
        dispatchIds.push(result.dispatchId);
        continue;
      }

      skippedRecipientsCount += 1;
    }

    if (dispatchIds.length === 0) {
      await markCampaignDispatchPreparationFailed(dependencies, {
        campaignId: campaign.id,
      });
    }

    return {
      kind: "accepted",
      campaignId: campaign.id,
      resolvedRecipientsCount: resolvedAudience.count,
      createdDispatchesCount: dispatchIds.length,
      queuedDispatchesCount: dispatchIds.length,
      skippedRecipientsCount,
      dispatchIds,
    };
  } catch (error) {
    await markCampaignDispatchPreparationFailed(dependencies, {
      campaignId: campaign.id,
    });

    throw error;
  }
}
