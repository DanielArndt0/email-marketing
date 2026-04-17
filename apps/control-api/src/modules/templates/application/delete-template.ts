import type { Pool } from "pg";

import {
  countTemplateDispatchLinks,
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
      dispatchesCount: number;
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

  const dispatchesCount = await countTemplateDispatchLinks(
    dependencies.pgPool,
    id,
  );

  if (dispatchesCount > 0) {
    return {
      kind: "in_use",
      dispatchesCount,
    };
  }

  await deleteTemplateById(dependencies.pgPool, id);

  return {
    kind: "deleted",
    id,
  };
}
