import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

type CountRow = { total: string };

export type RawCampaignRow = {
  id: string;
  name: string;
  goal: string | null;
  subject: string | null;
  status: string;
  templateId: string | null;
  audienceId: string | null;
  audienceName: string | null;
  audienceDescription: string | null;
  audienceSourceType: string | null;
  audienceFilters: Record<string, unknown> | null;
  scheduleAt: Date | string | null;
  lastExecutionAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export async function insertCampaign(
  pgPool: Pool,
  input: {
    name: string;
    goal?: string | undefined;
    subject?: string | null | undefined;
    status: string;
    templateId?: string | null | undefined;
    audienceId?: string | null | undefined;
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
        audience_id,
        schedule_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        name,
        goal,
        subject,
        status,
        template_id AS "templateId",
        audience_id AS "audienceId",
        schedule_at AS "scheduleAt",
        last_execution_at AS "lastExecutionAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      id,
      input.name,
      input.goal ?? null,
      input.subject ?? null,
      input.status,
      input.templateId ?? null,
      input.audienceId ?? null,
      input.scheduleAt ?? null,
    ],
  );

  return findCampaignById(pgPool, result.rows[0]!.id) as Promise<RawCampaignRow>;
}

export async function listCampaignsPage(
  pgPool: Pool,
  input: { page: number; pageSize: number; status?: string | undefined; audienceId?: string | undefined },
): Promise<{ items: RawCampaignRow[]; total: number }> {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (input.status) {
    values.push(input.status);
    conditions.push(`c.status = $${values.length}`);
  }

  if (input.audienceId) {
    values.push(input.audienceId);
    conditions.push(`c.audience_id = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (input.page - 1) * input.pageSize;

  const countResult = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM campaigns c
      ${whereClause}
    `,
    values,
  );

  const listValues = [...values, input.pageSize, offset];

  const listResult = await pgPool.query<RawCampaignRow>(
    `
      SELECT
        c.id,
        c.name,
        c.goal,
        c.subject,
        c.status,
        c.template_id AS "templateId",
        c.audience_id AS "audienceId",
        a.name AS "audienceName",
        a.description AS "audienceDescription",
        a.source_type AS "audienceSourceType",
        a.filters AS "audienceFilters",
        c.schedule_at AS "scheduleAt",
        c.last_execution_at AS "lastExecutionAt",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt"
      FROM campaigns c
      LEFT JOIN audiences a ON a.id = c.audience_id
      ${whereClause}
      ORDER BY c.created_at DESC
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
        c.id,
        c.name,
        c.goal,
        c.subject,
        c.status,
        c.template_id AS "templateId",
        c.audience_id AS "audienceId",
        a.name AS "audienceName",
        a.description AS "audienceDescription",
        a.source_type AS "audienceSourceType",
        a.filters AS "audienceFilters",
        c.schedule_at AS "scheduleAt",
        c.last_execution_at AS "lastExecutionAt",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt"
      FROM campaigns c
      LEFT JOIN audiences a ON a.id = c.audience_id
      WHERE c.id = $1
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
    subject?: string | null | undefined;
    status?: string | undefined;
    templateId?: string | null | undefined;
    audienceId?: string | null | undefined;
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

  if (input.audienceId !== undefined) {
    values.push(input.audienceId);
    fields.push(`audience_id = $${values.length}`);
  }

  if (input.scheduleAt !== undefined) {
    values.push(input.scheduleAt);
    fields.push(`schedule_at = $${values.length}`);
  }

  if (fields.length === 0) {
    return findCampaignById(pgPool, input.id);
  }

  fields.push("updated_at = NOW()");
  values.push(input.id);

  const result = await pgPool.query<{ id: string }>(
    `
      UPDATE campaigns
      SET ${fields.join(", ")}
      WHERE id = $${values.length}
      RETURNING id
    `,
    values,
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return findCampaignById(pgPool, row.id);
}
