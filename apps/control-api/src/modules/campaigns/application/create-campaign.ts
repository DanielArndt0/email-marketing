import type { Pool } from "pg";

import {
  campaignStatus,
  getAllowedCampaignInitialStatuses,
  isCampaignInitialStatus,
  validateCampaignConfigurationReadiness,
  type CampaignConfigurationReadinessFailure,
  type CampaignStatus,
  type TemplateVariableMappings,
} from "core";

import { findAudienceById } from "../../audiences/repositories/audience-repository.js";
import { findTemplateById } from "../../templates/repositories/template-repository.js";
import { findSmtpSenderById } from "../../smtp-senders/repositories/smtp-sender-repository.js";
import { insertCampaign } from "../repositories/campaign-repository.js";
import { mapCampaignRow, type CampaignRecord } from "./shared.js";

type CreateCampaignDependencies = {
  pgPool: Pool;
};

export type CreateCampaignInput = {
  name: string;
  goal?: string | null | undefined;
  subject?: string | null | undefined;
  status?: CampaignStatus | undefined;
  templateId?: string | null | undefined;
  audienceId?: string | null | undefined;
  smtpSenderId?: string | null | undefined;
  templateVariableMappings?: TemplateVariableMappings | undefined;
  scheduleAt?: string | null | undefined;
};

export type CreateCampaignResult =
  | {
      kind: "invalid_initial_status";
      status: CampaignStatus;
      allowedStatuses: CampaignStatus[];
    }
  | {
      kind: "invalid_status_configuration";
      status: CampaignStatus;
      reason: CampaignConfigurationReadinessFailure;
    }
  | { kind: "template_not_found" }
  | { kind: "audience_not_found" }
  | { kind: "smtp_sender_not_found" }
  | { kind: "created"; campaign: CampaignRecord };

export async function createCampaign(
  dependencies: CreateCampaignDependencies,
  input: CreateCampaignInput,
): Promise<CreateCampaignResult> {
  const initialStatus = input.status ?? campaignStatus.draft;

  if (!isCampaignInitialStatus(initialStatus)) {
    return {
      kind: "invalid_initial_status",
      status: initialStatus,
      allowedStatuses: getAllowedCampaignInitialStatuses(),
    };
  }

  const template = input.templateId
    ? await findTemplateById(dependencies.pgPool, input.templateId)
    : null;

  if (input.templateId && !template) {
    return { kind: "template_not_found" };
  }

  const audience = input.audienceId
    ? await findAudienceById(dependencies.pgPool, input.audienceId)
    : null;

  if (input.audienceId && !audience) {
    return { kind: "audience_not_found" };
  }

  const smtpSender = input.smtpSenderId
    ? await findSmtpSenderById(dependencies.pgPool, input.smtpSenderId)
    : null;

  if (input.smtpSenderId && !smtpSender) {
    return { kind: "smtp_sender_not_found" };
  }

  if (
    initialStatus === campaignStatus.ready ||
    initialStatus === campaignStatus.scheduled
  ) {
    const readiness = validateCampaignConfigurationReadiness({
      hasTemplate: Boolean(template),
      hasAudience: Boolean(audience),
      hasSmtpSender: Boolean(smtpSender),
      isSmtpSenderActive: Boolean(smtpSender?.isActive),
    });

    if (!readiness.ready) {
      return {
        kind: "invalid_status_configuration",
        status: initialStatus,
        reason: readiness.reason,
      };
    }
  }

  const row = await insertCampaign(dependencies.pgPool, {
    name: input.name,
    goal: input.goal,
    subject: input.subject,
    status: initialStatus,
    templateId: input.templateId,
    audienceId: input.audienceId,
    smtpSenderId: input.smtpSenderId,
    templateVariableMappings: input.templateVariableMappings,
    scheduleAt: input.scheduleAt,
  });

  return {
    kind: "created",
    campaign: mapCampaignRow(row),
  };
}
