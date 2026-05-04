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

const campaignStatusSet = new Set<string>(CAMPAIGN_STATUSES);

export function isCampaignStatus(value: unknown): value is CampaignStatus {
  return typeof value === "string" && campaignStatusSet.has(value);
}

export function parseCampaignStatus(value: unknown): CampaignStatus {
  if (isCampaignStatus(value)) {
    return value;
  }

  throw new Error(`Invalid campaign status: ${String(value)}`);
}

export function canScheduleCampaign(status: CampaignStatus | string): boolean {
  return status === campaignStatus.ready || status === campaignStatus.scheduled;
}
