import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import type { AudienceFilters } from "core";

export type RawCampaignRow = {
  id: string;
  name: string;
  goal: string | null;
  subject: string;
  status: string;
  templateId: string | null;
  audienceSourceType: string | null;
  audienceFilters: AudienceFilters;
  scheduleAt: Date | string | null;
  lastExecutionAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type CountRow = { total: string };

export async function insertCampaign(
  pgPool: Pool,
  input: {
    name: string;
    goal?: string | undefined;
    subject: string;
    status: string;
    templateId?: string | null | undefined;
    audienceSourceType?: string | null | undefined;
    audienceFilters: AudienceFilters;
    scheduleAt?: string | null | undefined;
  },
): Promise<RawCampaignRow> {
  const id = randomUUID();

  const result = await pgPool.query<RawCampaignRow>(
    `
      INSERT INTO campaigns (
        id,
        name,
        goal,
        subject,
        status,
        template_id,
        audience_source_type,
        audience_filters,
        schedule_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
      RETURNING
        id,
        name,
        goal,
        subject,
        status,
        template_id AS "templateId",
        audience_source_type AS "audienceSourceType",
        audience_filters AS "audienceFilters",
        schedule_at AS "scheduleAt",
        last_execution_at AS "lastExecutionAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      id,
      input.name,
      input.goal ?? null,
      input.subject,
      input.status,
      input.templateId ?? null,
      input.audienceSourceType ?? null,
      JSON.stringify(input.audienceFilters),
      input.scheduleAt ?? null,
    ],
  );

  return result.rows[0]!;
}

export async function listCampaignsPage(
  pgPool: Pool,
  input: { page: number; pageSize: number; status?: string | undefined },
): Promise<{ items: RawCampaignRow[]; total: number }> {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (input.status) {
    values.push(input.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (input.page - 1) * input.pageSize;

  const countResult = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM campaigns
      ${whereClause}
    `,
    values,
  );

  const listValues = [...values, input.pageSize, offset];

  const listResult = await pgPool.query<RawCampaignRow>(
    `
      SELECT
        id,
        name,
        goal,
        subject,
        status,
        template_id AS "templateId",
        audience_source_type AS "audienceSourceType",
        audience_filters AS "audienceFilters",
        schedule_at AS "scheduleAt",
        last_execution_at AS "lastExecutionAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM campaigns
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${listValues.length - 1}
      OFFSET $${listValues.length}
    `,
    listValues,
  );

  return {
    items: listResult.rows,
    total: Number(countResult.rows[0]?.total ?? "0"),
  };
}

export async function findCampaignById(
  pgPool: Pool,
  id: string,
): Promise<RawCampaignRow | null> {
  const result = await pgPool.query<RawCampaignRow>(
    `
      SELECT
        id,
        name,
        goal,
        subject,
        status,
        template_id AS "templateId",
        audience_source_type AS "audienceSourceType",
        audience_filters AS "audienceFilters",
        schedule_at AS "scheduleAt",
        last_execution_at AS "lastExecutionAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM campaigns
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function updateCampaignById(
  pgPool: Pool,
  input: {
    id: string;
    name?: string | undefined;
    goal?: string | null | undefined;
    subject?: string | undefined;
    status?: string | undefined;
    templateId?: string | null | undefined;
    audienceSourceType?: string | null | undefined;
    audienceFilters?: AudienceFilters | undefined;
    scheduleAt?: string | null | undefined;
  },
): Promise<RawCampaignRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    values.push(input.name);
    fields.push(`name = $${values.length}`);
  }

  if (input.goal !== undefined) {
    values.push(input.goal);
    fields.push(`goal = $${values.length}`);
  }

  if (input.subject !== undefined) {
    values.push(input.subject);
    fields.push(`subject = $${values.length}`);
  }

  if (input.status !== undefined) {
    values.push(input.status);
    fields.push(`status = $${values.length}`);
  }

  if (input.templateId !== undefined) {
    values.push(input.templateId);
    fields.push(`template_id = $${values.length}`);
  }

  if (input.audienceSourceType !== undefined) {
    values.push(input.audienceSourceType);
    fields.push(`audience_source_type = $${values.length}`);
  }

  if (input.audienceFilters !== undefined) {
    values.push(JSON.stringify(input.audienceFilters));
    fields.push(`audience_filters = $${values.length}::jsonb`);
  }

  if (input.scheduleAt !== undefined) {
    values.push(input.scheduleAt);
    fields.push(`schedule_at = $${values.length}`);
  }

  fields.push("updated_at = NOW()");
  values.push(input.id);

  const result = await pgPool.query<RawCampaignRow>(
    `
      UPDATE campaigns
      SET ${fields.join(", ")}
      WHERE id = $${values.length}
      RETURNING
        id,
        name,
        goal,
        subject,
        status,
        template_id AS "templateId",
        audience_source_type AS "audienceSourceType",
        audience_filters AS "audienceFilters",
        schedule_at AS "scheduleAt",
        last_execution_at AS "lastExecutionAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values,
  );

  return result.rows[0] ?? null;
}
