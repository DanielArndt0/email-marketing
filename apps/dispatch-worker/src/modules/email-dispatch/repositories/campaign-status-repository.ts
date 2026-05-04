import type { Pool } from "pg";

import type { CampaignDispatchStatusSummary, CampaignStatus } from "core";

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

export async function transitionCampaignStatusById(
  pgPool: Pool,
  input: {
    campaignId: string;
    from: CampaignStatus;
    to: CampaignStatus;
  },
): Promise<boolean> {
  const result = await pgPool.query<{ id: string }>(
    `
      UPDATE campaigns
      SET
        status = $3,
        updated_at = NOW()
      WHERE id = $1
        AND status = $2
      RETURNING id
    `,
    [input.campaignId, input.from, input.to],
  );

  return result.rowCount === 1;
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
