import {
  createAudienceDefinition,
  parseLeadSourceType,
  type AudienceDefinition,
  type CampaignStatus,
  type LeadSourceType,
} from "core";

import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import { buildPaginationMeta } from "../../../shared/persistence/build-pagination-meta.js";
import type { RawCampaignRow } from "../repositories/campaign-repository.js";

export type CampaignRecord = {
  id: string;
  name: string;
  subject: string | null;
  goal: string | null;
  status: CampaignStatus;
  templateId: string | null;
  audience: AudienceDefinition | null;
  scheduleAt: string | null;
  lastExecutionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CampaignListResult = {
  items: CampaignRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const VALID_CAMPAIGN_STATUSES: CampaignStatus[] = [
  "draft",
  "ready",
  "scheduled",
  "running",
  "paused",
  "completed",
  "canceled",
  "failed",
];

function toCampaignStatus(value: string): CampaignStatus {
  if (VALID_CAMPAIGN_STATUSES.includes(value as CampaignStatus)) {
    return value as CampaignStatus;
  }

  throw new Error(`Invalid campaign status returned from database: ${value}`);
}

function toAudienceDefinition(
  sourceType: string | null,
  filters: Record<string, unknown> | null,
): AudienceDefinition | null {
  if (!sourceType) {
    return null;
  }

  return createAudienceDefinition({
    sourceType: parseLeadSourceType(sourceType),
    filters: filters ?? {},
  });
}

export function mapCampaignRow(row: RawCampaignRow): CampaignRecord {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    goal: row.goal,
    status: toCampaignStatus(row.status),
    templateId: row.templateId,
    audience: toAudienceDefinition(row.audienceSourceType, row.audienceFilters),
    scheduleAt: normalizeDateValue(row.scheduleAt),
    lastExecutionAt: normalizeDateValue(row.lastExecutionAt),
    createdAt: normalizeDateValue(row.createdAt) ?? "",
    updatedAt: normalizeDateValue(row.updatedAt) ?? "",
  };
}

export function buildCampaignListResult(input: {
  rows: RawCampaignRow[];
  page: number;
  pageSize: number;
  total: number;
}): CampaignListResult {
  return {
    items: input.rows.map(mapCampaignRow),
    ...buildPaginationMeta({
      page: input.page,
      pageSize: input.pageSize,
      total: input.total,
    }),
  };
}

export type CampaignMutationInput = {
  name: string;
  subject?: string | null | undefined;
  goal?: string | null | undefined;
  status: CampaignStatus;
  templateId?: string | null | undefined;
  audienceSourceType?: LeadSourceType | null | undefined;
  audienceFilters?: Record<string, unknown> | undefined;
  scheduleAt?: string | null | undefined;
};
