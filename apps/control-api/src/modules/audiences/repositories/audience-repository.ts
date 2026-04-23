import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import type { AudienceFilters } from "core";

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
type UsageRow = { count: string };

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
      RETURNING
        id,
        name,
        description,
        source_type AS "sourceType",
        filters,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
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
    values.push(input.sourceType);
    conditions.push(`source_type = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
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
      SELECT
        id,
        name,
        description,
        source_type AS "sourceType",
        filters,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
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
    total: Number(countResult.rows[0]?.total ?? "0"),
  };
}

export async function findAudienceById(
  pgPool: Pool,
  id: string,
): Promise<RawAudienceRow | null> {
  const result = await pgPool.query<RawAudienceRow>(
    `
      SELECT
        id,
        name,
        description,
        source_type AS "sourceType",
        filters,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
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
  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    values.push(input.name);
    fields.push(`name = $${values.length}`);
  }

  if (input.description !== undefined) {
    values.push(input.description);
    fields.push(`description = $${values.length}`);
  }

  if (input.sourceType !== undefined) {
    values.push(input.sourceType);
    fields.push(`source_type = $${values.length}`);
  }

  if (input.filters !== undefined) {
    values.push(JSON.stringify(input.filters));
    fields.push(`filters = $${values.length}::jsonb`);
  }

  if (fields.length === 0) {
    return findAudienceById(pgPool, input.id);
  }

  fields.push("updated_at = NOW()");
  values.push(input.id);

  const result = await pgPool.query<RawAudienceRow>(
    `
      UPDATE audiences
      SET ${fields.join(", ")}
      WHERE id = $${values.length}
      RETURNING
        id,
        name,
        description,
        source_type AS "sourceType",
        filters,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values,
  );

  return result.rows[0] ?? null;
}

export async function countAudienceCampaignLinks(
  pgPool: Pool,
  audienceId: string,
): Promise<number> {
  const result = await pgPool.query<UsageRow>(
    `
      SELECT COUNT(*)::text AS count
      FROM campaigns
      WHERE audience_id = $1
    `,
    [audienceId],
  );

  return Number(result.rows[0]?.count ?? "0");
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
