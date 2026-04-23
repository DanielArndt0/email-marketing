import {
  createAudienceDefinition,
  parseLeadSourceType,
  type AudienceDefinition,
  type LeadSourceType,
} from "core";

import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import { buildPaginationMeta } from "../../../shared/persistence/build-pagination-meta.js";
import type { RawAudienceRow } from "../repositories/audience-repository.js";

export type AudienceRecord = {
  id: string;
  name: string;
  description: string | null;
  definition: AudienceDefinition;
  createdAt: string;
  updatedAt: string;
};

export type AudienceListResult = {
  items: AudienceRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function mapAudienceDefinition(
  sourceType: string,
  filters: Record<string, unknown>,
): AudienceDefinition {
  return createAudienceDefinition({
    sourceType: parseLeadSourceType(sourceType),
    filters,
  });
}

export function mapAudienceRow(row: RawAudienceRow): AudienceRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    definition: mapAudienceDefinition(row.sourceType, row.filters),
    createdAt: normalizeDateValue(row.createdAt) ?? "",
    updatedAt: normalizeDateValue(row.updatedAt) ?? "",
  };
}

export function buildAudienceListResult(input: {
  rows: RawAudienceRow[];
  page: number;
  pageSize: number;
  total: number;
}): AudienceListResult {
  return {
    items: input.rows.map(mapAudienceRow),
    ...buildPaginationMeta({
      page: input.page,
      pageSize: input.pageSize,
      total: input.total,
    }),
  };
}

export type AudienceMutationInput = {
  name: string;
  description?: string | null | undefined;
  sourceType: LeadSourceType;
  filters: Record<string, unknown>;
};
