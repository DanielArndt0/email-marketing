import { randomUUID } from "node:crypto";

import type { Pool } from "pg";

import type { CampaignStatus, TemplateVariableMappings } from "core";

type CountRow = { total: string };

type CampaignStatusRow = {
  status: string;
};

type DispatchStatusSummaryRow = {
  total: string;
  pending: string;
  queued: string;
  processing: string;
  sent: string;
  error: string;
};

export type CampaignDispatchStatusSummary = {
  total: number;
  pending: number;
  queued: number;
  processing: number;
  sent: number;
  error: number;
};

export type RawCampaignRow = {
  id: string;
  name: string;
  subject: string | null;
  goal: string | null;
  status: string;
  templateId: string | null;

  templateName: string | null;
  templateSubject: string | null;
  templateVariables: unknown;

  audienceId: string | null;
  audienceName: string | null;
  audienceDescription: string | null;
  audienceSourceType: string | null;
  audienceFilters: Record<string, unknown> | null;

  smtpSenderId: string | null;
  smtpSenderName: string | null;
  smtpSenderFromName: string | null;
  smtpSenderFromEmail: string | null;
  smtpSenderReplyToEmail: string | null;
  smtpSenderIsActive: boolean | null;

  templateVariableMappings: unknown;
  scheduleAt: Date | string | null;
  lastExecutionAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const CAMPAIGN_SELECT = `
  SELECT
    c.id,
    c.name,
    c.goal,
    c.subject,
    c.status,
    c.template_id AS "templateId",

    t.name AS "templateName",
    t.subject AS "templateSubject",
    t.variables AS "templateVariables",

    c.audience_id AS "audienceId",
    a.name AS "audienceName",
    a.description AS "audienceDescription",
    a.source_type AS "audienceSourceType",
    a.filters AS "audienceFilters",

    c.smtp_sender_id AS "smtpSenderId",
    ss.name AS "smtpSenderName",
    ss.from_name AS "smtpSenderFromName",
    ss.from_email AS "smtpSenderFromEmail",
    ss.reply_to_email AS "smtpSenderReplyToEmail",
    ss.is_active AS "smtpSenderIsActive",

    c.template_variable_mappings AS "templateVariableMappings",
    c.schedule_at AS "scheduleAt",
    c.last_execution_at AS "lastExecutionAt",
    c.created_at AS "createdAt",
    c.updated_at AS "updatedAt"
  FROM campaigns c
  LEFT JOIN templates t ON t.id = c.template_id
  LEFT JOIN audiences a ON a.id = c.audience_id
  LEFT JOIN smtp_senders ss ON ss.id = c.smtp_sender_id
`;

export async function insertCampaign(
  pgPool: Pool,
  input: {
    name: string;
    goal?: string | undefined;
    subject?: string | null | undefined;
    status: string;
    templateId?: string | null | undefined;
    audienceId?: string | null | undefined;
    smtpSenderId?: string | null | undefined;
    templateVariableMappings?: TemplateVariableMappings | undefined;
    scheduleAt?: string | null | undefined;
  },
): Promise<RawCampaignRow> {
  const id = randomUUID();

  const result = await pgPool.query<{ id: string }>(
    `
      INSERT INTO campaigns (
        id,
        name,
        goal,
        subject,
        status,
        template_id,
        audience_id,
        smtp_sender_id,
        template_variable_mappings,
        schedule_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
      RETURNING id
    `,
    [
      id,
      input.name,
      input.goal ?? null,
      input.subject ?? null,
      input.status,
      input.templateId ?? null,
      input.audienceId ?? null,
      input.smtpSenderId ?? null,
      JSON.stringify(input.templateVariableMappings ?? {}),
      input.scheduleAt ?? null,
    ],
  );

  return findCampaignById(
    pgPool,
    result.rows[0]!.id,
  ) as Promise<RawCampaignRow>;
}

export async function listCampaignsPage(
  pgPool: Pool,
  input: {
    page: number;
    pageSize: number;
    status?: string | undefined;
    audienceId?: string | undefined;
  },
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

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
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
      ${CAMPAIGN_SELECT}
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
      ${CAMPAIGN_SELECT}
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
    smtpSenderId?: string | null | undefined;
    templateVariableMappings?: TemplateVariableMappings | undefined;
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

  if (input.smtpSenderId !== undefined) {
    values.push(input.smtpSenderId);
    fields.push(`smtp_sender_id = $${values.length}`);
  }

  if (input.templateVariableMappings !== undefined) {
    values.push(JSON.stringify(input.templateVariableMappings));
    fields.push(`template_variable_mappings = $${values.length}::jsonb`);
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

export async function findCampaignAudienceLinkById(
  pgPool: Pool,
  campaignId: string,
): Promise<{ campaignId: string; audienceId: string | null } | null> {
  const result = await pgPool.query<{
    campaignId: string;
    audienceId: string | null;
  }>(
    `
      SELECT
        id AS "campaignId",
        audience_id AS "audienceId"
      FROM campaigns
      WHERE id = $1
      LIMIT 1
    `,
    [campaignId],
  );

  return result.rows[0] ?? null;
}

export async function countEmailDispatchesByCampaignId(
  pgPool: Pool,
  campaignId: string,
): Promise<number> {
  const result = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM email_dispatches
      WHERE campaign_id = $1
    `,
    [campaignId],
  );

  return Number(result.rows[0]?.total ?? "0");
}

export async function deleteCampaignById(
  pgPool: Pool,
  id: string,
): Promise<void> {
  await pgPool.query(
    `
      DELETE FROM campaigns
      WHERE id = $1
    `,
    [id],
  );
}

export async function findCampaignStatusById(
  pgPool: Pool,
  campaignId: string,
): Promise<CampaignStatus | null> {
  const result = await pgPool.query<CampaignStatusRow>(
    `
      SELECT status
      FROM campaigns
      WHERE id = $1
      LIMIT 1
    `,
    [campaignId],
  );

  const status = result.rows[0]?.status;

  return status ? (status as CampaignStatus) : null;
}

export async function updateCampaignStatusById(
  pgPool: Pool,
  campaignId: string,
  status: CampaignStatus,
): Promise<void> {
  await pgPool.query(
    `
      UPDATE campaigns
      SET
        status = $2,
        updated_at = NOW()
      WHERE id = $1
    `,
    [campaignId, status],
  );
}

export async function getCampaignDispatchStatusSummary(
  pgPool: Pool,
  campaignId: string,
): Promise<CampaignDispatchStatusSummary> {
  const result = await pgPool.query<DispatchStatusSummaryRow>(
    `
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE status = 'pending')::text AS pending,
        COUNT(*) FILTER (WHERE status = 'queued')::text AS queued,
        COUNT(*) FILTER (WHERE status = 'processing')::text AS processing,
        COUNT(*) FILTER (WHERE status = 'sent')::text AS sent,
        COUNT(*) FILTER (WHERE status = 'error')::text AS error
      FROM email_dispatches
      WHERE campaign_id = $1
    `,
    [campaignId],
  );

  const row = result.rows[0];

  return {
    total: Number(row?.total ?? "0"),
    pending: Number(row?.pending ?? "0"),
    queued: Number(row?.queued ?? "0"),
    processing: Number(row?.processing ?? "0"),
    sent: Number(row?.sent ?? "0"),
    error: Number(row?.error ?? "0"),
  };
}
