export const CAMPAIGN_STATUSES = [
  "draft",
  "ready",
  "scheduled",
  "running",
  "paused",
  "completed",
  "canceled",
  "failed",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const campaignStatus = {
  draft: "draft",
  ready: "ready",
  scheduled: "scheduled",
  running: "running",
  paused: "paused",
  completed: "completed",
  canceled: "canceled",
  failed: "failed",
} as const satisfies Record<CampaignStatus, CampaignStatus>;

export function isCampaignStatus(value: string): value is CampaignStatus {
  return CAMPAIGN_STATUSES.includes(value as CampaignStatus);
}

export function parseCampaignStatus(value: string): CampaignStatus {
  if (isCampaignStatus(value)) {
    return value;
  }

  throw new Error(`Invalid campaign status: ${value}`);
}

export function canScheduleCampaign(status: CampaignStatus | string): boolean {
  return status === campaignStatus.ready || status === campaignStatus.scheduled;
}
