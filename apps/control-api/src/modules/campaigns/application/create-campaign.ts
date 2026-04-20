import type { Pool } from "pg";

import {
  mapCampaignRow,
  type CampaignMutationInput,
  type CampaignRecord,
} from "./shared.js";
import {
  insertCampaign,
  templateExists,
} from "../repositories/campaign-repository.js";

type CreateCampaignDependencies = {
  pgPool: Pool;
};

export type CreateCampaignInput = CampaignMutationInput;

export type CreateCampaignResult =
  | { kind: "template_not_found" }
  | { kind: "created"; campaign: CampaignRecord };

export async function createCampaign(
  dependencies: CreateCampaignDependencies,
  input: CreateCampaignInput,
): Promise<CreateCampaignResult> {
  if (input.templateId) {
    const exists = await templateExists(dependencies.pgPool, input.templateId);

    if (!exists) {
      return { kind: "template_not_found" };
    }
  }

  const row = await insertCampaign(dependencies.pgPool, {
    name: input.name,
    subject: input.subject ?? null,
    goal: input.goal ?? null,
    status: input.status,
    templateId: input.templateId ?? null,
    audienceSourceType: input.audienceSourceType ?? null,
    audienceFilters: input.audienceFilters ?? {},
    scheduleAt: input.scheduleAt ?? null,
  });

  return {
    kind: "created",
    campaign: mapCampaignRow(row),
  };
}
