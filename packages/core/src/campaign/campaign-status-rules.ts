import { campaignStatus, type CampaignStatus } from "./campaign-status.js";

export type CampaignStatusTransitionActor = "manual" | "system";

export type CampaignDispatchStatusSummary = {
  total: number;
  pending: number;
  queued: number;
  processing: number;
  sent: number;
  error: number;
};

export type CampaignStatusTransitionValidation =
  | { valid: true }
  | { valid: false; reason: string; allowedTransitions: CampaignStatus[] };

const SYSTEM_CAMPAIGN_STATUS_TRANSITIONS: Record<
  CampaignStatus,
  CampaignStatus[]
> = {
  draft: [
    campaignStatus.ready,
    campaignStatus.scheduled,
    campaignStatus.canceled,
  ],
  ready: [
    campaignStatus.draft,
    campaignStatus.scheduled,
    campaignStatus.running,
    campaignStatus.canceled,
  ],
  scheduled: [
    campaignStatus.ready,
    campaignStatus.running,
    campaignStatus.canceled,
  ],
  running: [
    campaignStatus.paused,
    campaignStatus.completed,
    campaignStatus.failed,
    campaignStatus.canceled,
  ],
  paused: [
    campaignStatus.ready,
    campaignStatus.running,
    campaignStatus.canceled,
  ],
  completed: [campaignStatus.running],
  failed: [
    campaignStatus.ready,
    campaignStatus.running,
    campaignStatus.canceled,
  ],
  canceled: [],
};

const MANUAL_CAMPAIGN_STATUS_TRANSITIONS: Record<
  CampaignStatus,
  CampaignStatus[]
> = {
  draft: [
    campaignStatus.ready,
    campaignStatus.scheduled,
    campaignStatus.canceled,
  ],
  ready: [
    campaignStatus.draft,
    campaignStatus.scheduled,
    campaignStatus.canceled,
  ],
  scheduled: [campaignStatus.ready, campaignStatus.canceled],
  running: [campaignStatus.paused, campaignStatus.canceled],
  paused: [
    campaignStatus.ready,
    campaignStatus.running,
    campaignStatus.canceled,
  ],
  completed: [],
  failed: [campaignStatus.ready, campaignStatus.canceled],
  canceled: [],
};

const INITIAL_CAMPAIGN_STATUSES = new Set<CampaignStatus>([
  campaignStatus.draft,
  campaignStatus.ready,
  campaignStatus.scheduled,
]);

const DISPATCHABLE_CAMPAIGN_STATUSES = new Set<CampaignStatus>([
  campaignStatus.ready,
  campaignStatus.scheduled,
  campaignStatus.failed,
]);

export function getAllowedCampaignStatusTransitions(
  status: CampaignStatus,
  actor: CampaignStatusTransitionActor = "system",
): CampaignStatus[] {
  const transitions =
    actor === "manual"
      ? MANUAL_CAMPAIGN_STATUS_TRANSITIONS[status]
      : SYSTEM_CAMPAIGN_STATUS_TRANSITIONS[status];

  return [...transitions];
}

export function canTransitionCampaignStatus(
  from: CampaignStatus,
  to: CampaignStatus,
  actor: CampaignStatusTransitionActor = "system",
): boolean {
  if (from === to) {
    return true;
  }

  return getAllowedCampaignStatusTransitions(from, actor).includes(to);
}

export function validateCampaignStatusTransition(
  from: CampaignStatus,
  to: CampaignStatus,
  actor: CampaignStatusTransitionActor = "system",
): CampaignStatusTransitionValidation {
  if (canTransitionCampaignStatus(from, to, actor)) {
    return { valid: true };
  }

  const allowedTransitions = getAllowedCampaignStatusTransitions(from, actor);

  return {
    valid: false,
    reason: `Invalid campaign status transition: ${from} -> ${to}`,
    allowedTransitions,
  };
}

export function assertCampaignStatusTransition(
  from: CampaignStatus,
  to: CampaignStatus,
  actor: CampaignStatusTransitionActor = "system",
): void {
  const validation = validateCampaignStatusTransition(from, to, actor);

  if (!validation.valid) {
    throw new Error(validation.reason);
  }
}

export function isCampaignTerminalStatus(status: CampaignStatus): boolean {
  return status === campaignStatus.canceled;
}

export function getAllowedCampaignInitialStatuses(): CampaignStatus[] {
  return [...INITIAL_CAMPAIGN_STATUSES];
}

export function isCampaignInitialStatus(status: CampaignStatus): boolean {
  return INITIAL_CAMPAIGN_STATUSES.has(status);
}

export function isCampaignDispatchableStatus(status: CampaignStatus): boolean {
  return DISPATCHABLE_CAMPAIGN_STATUSES.has(status);
}

export function getActiveCampaignDispatchesCount(
  summary: CampaignDispatchStatusSummary,
): number {
  return summary.pending + summary.queued + summary.processing;
}

export function deriveCampaignStatusFromDispatchSummary(input: {
  currentStatus: CampaignStatus;
  summary: CampaignDispatchStatusSummary;
}): CampaignStatus | null {
  if (input.currentStatus !== campaignStatus.running) {
    return null;
  }

  if (input.summary.total === 0) {
    return null;
  }

  if (getActiveCampaignDispatchesCount(input.summary) > 0) {
    return null;
  }

  return input.summary.sent > 0 && input.summary.error === 0
    ? campaignStatus.completed
    : campaignStatus.failed;
}

export type CampaignConfigurationReadinessInput = {
  hasTemplate: boolean;
  hasAudience: boolean;
  hasSmtpSender: boolean;
  isSmtpSenderActive: boolean;
};

export type CampaignConfigurationReadinessFailure =
  | "missing_template"
  | "missing_audience"
  | "missing_smtp_sender"
  | "inactive_smtp_sender";

export type CampaignConfigurationReadiness =
  | { ready: true }
  | { ready: false; reason: CampaignConfigurationReadinessFailure };

export type CampaignDispatchReadinessInput =
  CampaignConfigurationReadinessInput & {
    status: CampaignStatus;
  };

export type CampaignDispatchReadinessFailure =
  | "invalid_status"
  | CampaignConfigurationReadinessFailure;

export type CampaignDispatchReadiness =
  | { ready: true }
  | {
      ready: false;
      reason: CampaignDispatchReadinessFailure;
      allowedStatuses?: CampaignStatus[];
    };

export function validateCampaignConfigurationReadiness(
  input: CampaignConfigurationReadinessInput,
): CampaignConfigurationReadiness {
  if (!input.hasTemplate) {
    return { ready: false, reason: "missing_template" };
  }

  if (!input.hasAudience) {
    return { ready: false, reason: "missing_audience" };
  }

  if (!input.hasSmtpSender) {
    return { ready: false, reason: "missing_smtp_sender" };
  }

  if (!input.isSmtpSenderActive) {
    return { ready: false, reason: "inactive_smtp_sender" };
  }

  return { ready: true };
}

export function validateCampaignDispatchReadiness(
  input: CampaignDispatchReadinessInput,
): CampaignDispatchReadiness {
  if (!isCampaignDispatchableStatus(input.status)) {
    return {
      ready: false,
      reason: "invalid_status",
      allowedStatuses: [...DISPATCHABLE_CAMPAIGN_STATUSES],
    };
  }

  return validateCampaignConfigurationReadiness(input);
}
