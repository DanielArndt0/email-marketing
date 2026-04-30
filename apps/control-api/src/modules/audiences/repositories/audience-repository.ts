import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import type { AudienceFilters } from "core";

import {
  addUpdateAssignment,
  addWhereCondition,
  buildWhereClause,
  readCount,
} from "../../../shared/persistence/sql-builders.js";

export type RawAudienceRow = {
  id: string;
  name: string;
  description: string | null;
  sourceType: string;
  filters: AudienceFilters;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type CountRow = { total: string };

const AUDIENCE_COLUMNS = `
  id,
  name,
  description,
  source_type AS "sourceType",
  filters,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export async function insertAudience(
  pgPool: Pool,
  input: {
    name: string;
    description?: string | null | undefined;
    sourceType: string;
    filters: AudienceFilters;
  },
): Promise<RawAudienceRow> {
  const id = randomUUID();

  const result = await pgPool.query<RawAudienceRow>(
    `
      INSERT INTO audiences (
        id,
        name,
        description,
        source_type,
        filters
      )
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING ${AUDIENCE_COLUMNS}
    `,
    [
      id,
      input.name,
      input.description ?? null,
      input.sourceType,
      JSON.stringify(input.filters),
    ],
  );

  return result.rows[0]!;
}

export async function listAudiencesPage(
  pgPool: Pool,
  input: {
    page: number;
    pageSize: number;
    sourceType?: string | undefined;
  },
): Promise<{ items: RawAudienceRow[]; total: number }> {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (input.sourceType) {
    addWhereCondition({
      conditions,
      values,
      condition: (param) => `source_type = ${param}`,
      value: input.sourceType,
    });
  }

  const whereClause = buildWhereClause(conditions);
  const offset = (input.page - 1) * input.pageSize;

  const countResult = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM audiences
      ${whereClause}
    `,
    values,
  );

  const listValues = [...values, input.pageSize, offset];

  const result = await pgPool.query<RawAudienceRow>(
    `
      SELECT ${AUDIENCE_COLUMNS}
      FROM audiences
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${listValues.length - 1}
      OFFSET $${listValues.length}
    `,
    listValues,
  );

  return {
    items: result.rows,
    total: readCount(countResult.rows[0]),
  };
}

export async function findAudienceById(
  pgPool: Pool,
  id: string,
): Promise<RawAudienceRow | null> {
  const result = await pgPool.query<RawAudienceRow>(
    `
      SELECT ${AUDIENCE_COLUMNS}
      FROM audiences
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function updateAudienceById(
  pgPool: Pool,
  input: {
    id: string;
    name?: string | undefined;
    description?: string | null | undefined;
    sourceType?: string | undefined;
    filters?: AudienceFilters | undefined;
  },
): Promise<RawAudienceRow | null> {
  const assignments: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "name",
      value: input.name,
    });
  }

  if (input.description !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "description",
      value: input.description,
    });
  }

  if (input.sourceType !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "source_type",
      value: input.sourceType,
    });
  }

  if (input.filters !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "filters",
      value: JSON.stringify(input.filters),
      cast: "::jsonb",
    });
  }

  if (assignments.length === 0) {
    return findAudienceById(pgPool, input.id);
  }

  assignments.push("updated_at = NOW()");
  values.push(input.id);

  const result = await pgPool.query<RawAudienceRow>(
    `
      UPDATE audiences
      SET ${assignments.join(", ")}
      WHERE id = $${values.length}
      RETURNING ${AUDIENCE_COLUMNS}
    `,
    values,
  );

  return result.rows[0] ?? null;
}

export async function countAudienceCampaignLinks(
  pgPool: Pool,
  audienceId: string,
): Promise<number> {
  const result = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM campaigns
      WHERE audience_id = $1
    `,
    [audienceId],
  );

  return readCount(result.rows[0]);
}

export async function deleteAudienceById(
  pgPool: Pool,
  id: string,
): Promise<void> {
  await pgPool.query(
    `
      DELETE FROM audiences
      WHERE id = $1
    `,
    [id],
  );
}
