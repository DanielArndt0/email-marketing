import type { Pool } from "pg";

import type { LeadSourceType } from "core";

import { insertAudience } from "../repositories/audience-repository.js";
import { mapAudienceRow, type AudienceRecord } from "./shared.js";
import { normalizeAudienceFilters } from "./normalize-audience-filters.js";

type CreateAudienceDependencies = {
  pgPool: Pool;
};

export type CreateAudienceInput = {
  name: string;
  description?: string | null | undefined;
  sourceType: LeadSourceType;
  filters: Record<string, unknown>;
};

export async function createAudience(
  dependencies: CreateAudienceDependencies,
  input: CreateAudienceInput,
): Promise<AudienceRecord> {
  const normalizedInput: CreateAudienceInput = {
    ...input,
    filters: normalizeAudienceFilters(input.filters),
  };

  const row = await insertAudience(dependencies.pgPool, normalizedInput);

  return mapAudienceRow(row);
}
