import type { Pool } from "pg";

import { mapCampaignRow, type CampaignRecord } from "./shared.js";
import {
  findCampaignById,
  templateExists,
  updateCampaignById,
} from "../repositories/campaign-repository.js";
import type { CampaignStatus, LeadSourceType } from "core";

type UpdateCampaignDependencies = {
  pgPool: Pool;
};

export type UpdateCampaignInput = {
  id: string;
  name?: string | undefined;
  subject?: string | null | undefined;
  goal?: string | null | undefined;
  status?: CampaignStatus | undefined;
  templateId?: string | null | undefined;
  audienceSourceType?: LeadSourceType | null | undefined;
  audienceFilters?: Record<string, unknown> | undefined;
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
  const current = await findCampaignById(dependencies.pgPool, input.id);

  if (!current) {
    return { kind: "not_found" };
  }

  if (input.templateId) {
    const exists = await templateExists(dependencies.pgPool, input.templateId);

    if (!exists) {
      return { kind: "template_not_found" };
    }
  }

  const row = await updateCampaignById(dependencies.pgPool, input);

  if (!row) {
    return { kind: "not_found" };
  }

  return {
    kind: "updated",
    campaign: mapCampaignRow(row),
  };
}
