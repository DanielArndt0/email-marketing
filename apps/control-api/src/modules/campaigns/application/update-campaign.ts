import type { Pool } from "pg";

import type { CampaignStatus, TemplateVariableMappings } from "core";

import { findAudienceById } from "../../audiences/repositories/audience-repository.js";
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
  subject?: string | null | undefined;
  status?: CampaignStatus | undefined;
  templateId?: string | null | undefined;
  audienceId?: string | null | undefined;
  templateVariableMappings?: TemplateVariableMappings | undefined;
  scheduleAt?: string | null | undefined;
};

export type UpdateCampaignResult =
  | { kind: "not_found" }
  | { kind: "template_not_found" }
  | { kind: "audience_not_found" }
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

  if (input.audienceId) {
    const audience = await findAudienceById(
      dependencies.pgPool,
      input.audienceId,
    );

    if (!audience) {
      return { kind: "audience_not_found" };
    }
  }

  const updated = await updateCampaignById(dependencies.pgPool, input);

  if (!updated) {
    return { kind: "not_found" };
  }

  return {
    kind: "updated",
    campaign: mapCampaignRow(updated),
  };
}
