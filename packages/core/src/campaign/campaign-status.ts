export const CAMPAIGN_STATUSES = [
  "draft",
  "ready",
  "scheduled",
  "running",
  "paused",
  "completed",
  "cancelled",
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
  cancelled: "cancelled",
  failed: "failed",
} as const satisfies Record<CampaignStatus, CampaignStatus>;

export function isCampaignStatus(value: string): value is CampaignStatus {
  return CAMPAIGN_STATUSES.includes(value as CampaignStatus);
}
