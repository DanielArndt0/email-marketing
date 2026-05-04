import type { Pool } from "pg";

import {
  campaignStatus,
  validateCampaignConfigurationReadiness,
  validateCampaignStatusTransition,
  type CampaignConfigurationReadinessFailure,
  type CampaignStatus,
  type TemplateVariableMappings,
} from "core";

import { findAudienceById } from "../../audiences/repositories/audience-repository.js";
import { findTemplateById } from "../../templates/repositories/template-repository.js";
import { findSmtpSenderById } from "../../smtp-senders/repositories/smtp-sender-repository.js";
import {
  findCampaignById,
  updateCampaignById,
} from "../repositories/campaign-repository.js";
import { mapCampaignRow, type CampaignRecord } from "./shared.js";

type UpdateCampaignDependencies = {
  pgPool: Pool;
};

export type UpdateCampaignInput = {
  id: string;
  name?: string | undefined;
  goal?: string | null | undefined;
  subject?: string | null | undefined;
  status?: CampaignStatus | undefined;
  templateId?: string | null | undefined;
  audienceId?: string | null | undefined;
  smtpSenderId?: string | null | undefined;
  templateVariableMappings?: TemplateVariableMappings | undefined;
  scheduleAt?: string | null | undefined;
};

export type UpdateCampaignResult =
  | { kind: "not_found" }
  | { kind: "template_not_found" }
  | { kind: "audience_not_found" }
  | { kind: "smtp_sender_not_found" }
  | {
      kind: "invalid_status_configuration";
      status: CampaignStatus;
      reason: CampaignConfigurationReadinessFailure;
    }
  | {
      kind: "invalid_status_transition";
      from: CampaignStatus;
      to: CampaignStatus;
      allowedTransitions: CampaignStatus[];
    }
  | {
      kind: "status_conflict";
      expectedStatus: CampaignStatus;
      requestedStatus: CampaignStatus;
    }
  | { kind: "updated"; campaign: CampaignRecord };

export async function updateCampaign(
  dependencies: UpdateCampaignDependencies,
  input: UpdateCampaignInput,
): Promise<UpdateCampaignResult> {
  const currentRow = await findCampaignById(dependencies.pgPool, input.id);

  if (!currentRow) {
    return { kind: "not_found" };
  }

  const currentCampaign = mapCampaignRow(currentRow);
  const nextStatus = input.status;
  const isStatusChange =
    nextStatus !== undefined && nextStatus !== currentCampaign.status;

  if (isStatusChange) {
    const transitionValidation = validateCampaignStatusTransition(
      currentCampaign.status,
      nextStatus,
      "manual",
    );

    if (!transitionValidation.valid) {
      return {
        kind: "invalid_status_transition",
        from: currentCampaign.status,
        to: nextStatus,
        allowedTransitions: transitionValidation.allowedTransitions,
      };
    }
  }

  const nextTemplate = input.templateId
    ? await findTemplateById(dependencies.pgPool, input.templateId)
    : null;

  if (input.templateId && !nextTemplate) {
    return { kind: "template_not_found" };
  }

  const nextAudience = input.audienceId
    ? await findAudienceById(dependencies.pgPool, input.audienceId)
    : null;

  if (input.audienceId && !nextAudience) {
    return { kind: "audience_not_found" };
  }

  const nextSmtpSender = input.smtpSenderId
    ? await findSmtpSenderById(dependencies.pgPool, input.smtpSenderId)
    : null;

  if (input.smtpSenderId && !nextSmtpSender) {
    return { kind: "smtp_sender_not_found" };
  }

  const effectiveStatus = nextStatus ?? currentCampaign.status;
  const requiresDispatchConfiguration =
    effectiveStatus === campaignStatus.ready ||
    effectiveStatus === campaignStatus.scheduled ||
    effectiveStatus === campaignStatus.running;

  if (requiresDispatchConfiguration) {
    const readiness = validateCampaignConfigurationReadiness({
      hasTemplate:
        input.templateId !== undefined
          ? Boolean(nextTemplate)
          : Boolean(currentCampaign.template),
      hasAudience:
        input.audienceId !== undefined
          ? Boolean(nextAudience)
          : Boolean(currentCampaign.audience),
      hasSmtpSender:
        input.smtpSenderId !== undefined
          ? Boolean(nextSmtpSender)
          : Boolean(currentCampaign.smtpSender),
      isSmtpSenderActive:
        input.smtpSenderId !== undefined
          ? Boolean(nextSmtpSender?.isActive)
          : Boolean(currentCampaign.smtpSender?.isActive),
    });

    if (!readiness.ready) {
      return {
        kind: "invalid_status_configuration",
        status: effectiveStatus,
        reason: readiness.reason,
      };
    }
  }

  const updated = await updateCampaignById(dependencies.pgPool, {
    id: input.id,
    name: input.name,
    goal: input.goal,
    subject: input.subject,
    status: input.status,
    templateId: input.templateId,
    audienceId: input.audienceId,
    smtpSenderId: input.smtpSenderId,
    templateVariableMappings: input.templateVariableMappings,
    scheduleAt: input.scheduleAt,
    expectedStatus: isStatusChange ? currentCampaign.status : undefined,
  });

  if (!updated) {
    return isStatusChange
      ? {
          kind: "status_conflict",
          expectedStatus: currentCampaign.status,
          requestedStatus: nextStatus,
        }
      : { kind: "not_found" };
  }

  return {
    kind: "updated",
    campaign: mapCampaignRow(updated),
  };
}
