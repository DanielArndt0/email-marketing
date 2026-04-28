import type { CampaignStatus } from "./campaign-status.js";

const CAMPAIGN_STATUS_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ["ready", "scheduled", "canceled"],
  ready: ["draft", "scheduled", "running", "paused", "canceled"],
  scheduled: ["ready", "running", "paused", "canceled"],
  running: ["paused", "completed", "failed", "canceled"],
  paused: ["ready", "running", "canceled"],
  completed: [],
  failed: ["ready", "running", "canceled"],
  canceled: [],
};

export function canTransitionCampaignStatus(
  from: CampaignStatus,
  to: CampaignStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return CAMPAIGN_STATUS_TRANSITIONS[from].includes(to);
}

export function assertCampaignStatusTransition(
  from: CampaignStatus,
  to: CampaignStatus,
): void {
  if (!canTransitionCampaignStatus(from, to)) {
    throw new Error(`Invalid campaign status transition: ${from} -> ${to}`);
  }
}

export function isCampaignTerminalStatus(status: CampaignStatus): boolean {
  return status === "completed" || status === "failed" || status === "canceled";
}
