import type { Queue } from "bullmq";
import type { Pool } from "pg";

import type { EmailDispatchJobData } from "shared";

import type { LeadSourceProviderRegistry } from "../../audiences/adapters/lead-source-provider-registry.js";
import { resolveAudience } from "../../audiences/application/resolve-audience.js";
import { enqueueEmailDispatch } from "./enqueue-email-dispatch.js";
import { mapCampaignRow } from "./shared.js";
import {
  findCampaignById,
  updateCampaignStatusById,
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
  | {
      kind: "not_found";
      campaignId: string;
    }
  | {
      kind: "missing_template";
      campaignId: string;
    }
  | {
      kind: "missing_audience";
      campaignId: string;
    }
  | {
      kind: "missing_smtp_sender";
      campaignId: string;
    }
  | {
      kind: "inactive_smtp_sender";
      campaignId: string;
    }
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

export async function dispatchCampaign(
  dependencies: DispatchCampaignDependencies,
  input: DispatchCampaignInput,
): Promise<DispatchCampaignResult> {
  const campaignRow = await findCampaignById(
    dependencies.pgPool,
    input.campaignId,
  );

  if (!campaignRow) {
    return {
      kind: "not_found",
      campaignId: input.campaignId,
    };
  }

  const campaign = mapCampaignRow(campaignRow);

  if (!campaign.templateId || !campaign.template) {
    return {
      kind: "missing_template",
      campaignId: campaign.id,
    };
  }

  if (!campaign.audienceId || !campaign.audience) {
    return {
      kind: "missing_audience",
      campaignId: campaign.id,
    };
  }

  if (!campaign.smtpSenderId || !campaign.smtpSender) {
    return {
      kind: "missing_smtp_sender",
      campaignId: campaign.id,
    };
  }

  if (!campaign.smtpSender.isActive) {
    return {
      kind: "inactive_smtp_sender",
      campaignId: campaign.id,
    };
  }

  await updateCampaignStatusById(dependencies.pgPool, campaign.id, "running");

  try {
    const resolvedAudience = await resolveAudience(
      {
        providerRegistry: dependencies.providerRegistry,
      },
      {
        sourceType: campaign.audience.sourceType,
        filters: campaign.audience.filters,
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
        {
          pgPool: dependencies.pgPool,
          queue: dependencies.queue,
        },
        {
          campaignId: campaign.id,
          campaignName: campaign.name,
          contactId: getContactId({
            campaignId: campaign.id,
            email,
            externalId: lead.externalId,
          }),
          to: email,
          templateId: campaign.templateId,
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
      await updateCampaignStatusById(
        dependencies.pgPool,
        campaign.id,
        "failed",
      );
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
    await updateCampaignStatusById(dependencies.pgPool, campaign.id, "failed");

    throw error;
  }
}
