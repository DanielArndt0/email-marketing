import type { Pool } from "pg";

import { CAMPAIGN_STATUSES, type CampaignStatus } from "core";

import { findAudienceById } from "../../audiences/repositories/audience-repository.js";
import { findTemplateById } from "../../templates/repositories/template-repository.js";
import { insertCampaign } from "../repositories/campaign-repository.js";
import { mapCampaignRow, type CampaignRecord } from "./shared.js";

type CreateCampaignDependencies = {
  pgPool: Pool;
};

export type CreateCampaignInput = {
  name: string;
  goal?: string | undefined;
  subject?: string | null | undefined;
  status?: CampaignStatus | undefined;
  templateId?: string | null | undefined;
  audienceId?: string | null | undefined;
  scheduleAt?: string | null | undefined;
};

export type CreateCampaignResult =
  | { kind: "template_not_found" }
  | { kind: "audience_not_found" }
  | { kind: "created"; campaign: CampaignRecord };

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

  if (input.audienceId) {
    const audience = await findAudienceById(
      dependencies.pgPool,
      input.audienceId,
    );

    if (!audience) {
      return { kind: "audience_not_found" };
    }
  }

  const row = await insertCampaign(dependencies.pgPool, {
    name: input.name,
    goal: input.goal,
    subject: input.subject,
    status: input.status ?? CAMPAIGN_STATUSES[0],
    templateId: input.templateId,
    audienceId: input.audienceId,
    scheduleAt: input.scheduleAt,
  });

  return {
    kind: "created",
    campaign: mapCampaignRow(row),
  };
}
