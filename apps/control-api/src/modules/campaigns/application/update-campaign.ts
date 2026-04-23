import type { Pool } from "pg";

import type { AudienceDefinition, CampaignStatus } from "core";

import { findTemplateById } from "../../templates/repositories/template-repository.js";
import { updateCampaignById } from "../repositories/campaign-repository.js";
import { mapCampaignRow, type CampaignRecord } from "./shared.js";

type UpdateCampaignDependencies = {
  pgPool: Pool;
};

export type UpdateCampaignInput = {
  id: string;
  name?: string | undefined;
  goal?: string | null | undefined;
  subject?: string | undefined;
  status?: CampaignStatus | undefined;
  templateId?: string | null | undefined;
  audience?: AudienceDefinition | null | undefined;
  scheduleAt?: string | null | undefined;
};

export type UpdateCampaignResult =
  | { kind: "not_found" }
  | { kind: "template_not_found" }
  | { kind: "updated"; campaign: CampaignRecord };

export async function updateCampaign(
  dependencies: UpdateCampaignDependencies,
  input: UpdateCampaignInput,
): Promise<UpdateCampaignResult> {
  if (input.templateId) {
    const template = await findTemplateById(
      dependencies.pgPool,
      input.templateId,
    );

    if (!template) {
      return { kind: "template_not_found" };
    }
  }

  const updated = await updateCampaignById(dependencies.pgPool, {
    id: input.id,
    name: input.name,
    goal: input.goal,
    subject: input.subject,
    status: input.status,
    templateId: input.templateId,
    audienceSourceType:
      input.audience === undefined
        ? undefined
        : (input.audience?.sourceType ?? null),
    audienceFilters:
      input.audience === undefined
        ? undefined
        : (input.audience?.filters ?? {}),
    scheduleAt: input.scheduleAt,
  });

  if (!updated) {
    return { kind: "not_found" };
  }

  return {
    kind: "updated",
    campaign: mapCampaignRow(updated),
  };
}
