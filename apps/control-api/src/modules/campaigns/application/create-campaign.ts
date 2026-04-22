import type { Pool } from "pg";

import {
  CAMPAIGN_STATUSES,
  type AudienceDefinition,
  type CampaignStatus,
} from "core";

import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import { findTemplateById } from "../../templates/repositories/template-repository.js";
import {
  insertCampaign,
  type RawCampaignRow,
} from "../repositories/campaign-repository.js";

type CreateCampaignDependencies = {
  pgPool: Pool;
};

export type CreateCampaignInput = {
  name: string;
  goal?: string | undefined;
  subject: string;
  status?: CampaignStatus | undefined;
  templateId?: string | null | undefined;
  audience?: AudienceDefinition | undefined;
  scheduleAt?: string | null | undefined;
};

export type CampaignViewModel = {
  id: string;
  name: string;
  goal: string | null;
  subject: string;
  status: string;
  templateId: string | null;
  audience: AudienceDefinition | null;
  scheduleAt: string | null;
  lastExecutionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCampaignResult =
  | { kind: "template_not_found" }
  | { kind: "created"; campaign: CampaignViewModel };

function mapCampaign(row: RawCampaignRow): CampaignViewModel {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    subject: row.subject,
    status: row.status,
    templateId: row.templateId,
    audience: row.audienceSourceType
      ? {
          sourceType:
            row.audienceSourceType as AudienceDefinition["sourceType"],
          filters: row.audienceFilters,
        }
      : null,
    scheduleAt: normalizeDateValue(row.scheduleAt),
    lastExecutionAt: normalizeDateValue(row.lastExecutionAt),
    createdAt: normalizeDateValue(row.createdAt) ?? "",
    updatedAt: normalizeDateValue(row.updatedAt) ?? "",
  };
}

export async function createCampaign(
  dependencies: CreateCampaignDependencies,
  input: CreateCampaignInput,
): Promise<CreateCampaignResult> {
  if (input.templateId) {
    const template = await findTemplateById(
      dependencies.pgPool,
      input.templateId,
    );

    if (!template) {
      return { kind: "template_not_found" };
    }
  }

  const row = await insertCampaign(dependencies.pgPool, {
    name: input.name,
    goal: input.goal,
    subject: input.subject,
    status: input.status ?? CAMPAIGN_STATUSES[0],
    templateId: input.templateId,
    audienceSourceType: input.audience?.sourceType,
    audienceFilters: input.audience?.filters ?? {},
    scheduleAt: input.scheduleAt,
  });

  return {
    kind: "created",
    campaign: mapCampaign(row),
  };
}

export { mapCampaign };
