import type { Pool } from "pg";

import type { LeadSourceType } from "core";

import { updateAudienceById } from "../repositories/audience-repository.js";
import { mapAudienceRow, type AudienceRecord } from "./shared.js";

type UpdateAudienceDependencies = {
  pgPool: Pool;
};

export type UpdateAudienceInput = {
  id: string;
  name?: string | undefined;
  description?: string | null | undefined;
  sourceType?: LeadSourceType | undefined;
  filters?: Record<string, unknown> | undefined;
};

export type UpdateAudienceResult =
  | { kind: "not_found" }
  | { kind: "updated"; audience: AudienceRecord };

export async function updateAudience(
  dependencies: UpdateAudienceDependencies,
  input: UpdateAudienceInput,
): Promise<UpdateAudienceResult> {
  const row = await updateAudienceById(dependencies.pgPool, input);

  if (!row) {
    return { kind: "not_found" };
  }

  return {
    kind: "updated",
    audience: mapAudienceRow(row),
  };
}
