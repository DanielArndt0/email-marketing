import type { Pool } from "pg";

import {
  CAMPAIGN_STATUSES,
  type AudienceDefinition,
  type CampaignStatus,
} from "core";

import { findTemplateById } from "../../templates/repositories/template-repository.js";
import { insertCampaign } from "../repositories/campaign-repository.js";
import { mapCampaignRow, type CampaignRecord } from "./shared.js";

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

export type CampaignViewModel = CampaignRecord;

export type CreateCampaignResult =
  | { kind: "template_not_found" }
  | { kind: "created"; campaign: CampaignViewModel };

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
    campaign: mapCampaignRow(row),
  };
}
