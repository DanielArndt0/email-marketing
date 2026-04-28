import type { Pool } from "pg";

import {
  countCampaignsByTemplateId,
  deleteTemplateById,
  findTemplateById,
} from "../repositories/template-repository.js";

type DeleteTemplateDependencies = {
  pgPool: Pool;
};

export type DeleteTemplateResult =
  | {
      kind: "not_found";
    }
  | {
      kind: "in_use";
      campaignsCount: number;
    }
  | {
      kind: "deleted";
      id: string;
    };

export async function deleteTemplate(
  dependencies: DeleteTemplateDependencies,
  id: string,
): Promise<DeleteTemplateResult> {
  const template = await findTemplateById(dependencies.pgPool, id);

  if (!template) {
    return {
      kind: "not_found",
    };
  }

  const campaignsCount = await countCampaignsByTemplateId(
    dependencies.pgPool,
    id,
  );

  if (campaignsCount > 0) {
    return {
      kind: "in_use",
      campaignsCount,
    };
  }

  await deleteTemplateById(dependencies.pgPool, id);

  return {
    kind: "deleted",
    id,
  };
}
