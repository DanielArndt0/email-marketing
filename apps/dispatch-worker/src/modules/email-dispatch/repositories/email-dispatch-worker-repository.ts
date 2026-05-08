import type { Pool } from "pg";

import { emailDispatchStatus } from "core";

export type RawEmailDispatchRow = {
  id: string;
  campaignId: string;
  contactId: string;
  templateId: string | null;
  smtpSenderId: string | null;
  recipientEmail: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
};

export type RawDispatchEmailFileRow = {
  id: string;
  originalName: string;
  mimeType: string;
  storageKey: string;
  cid: string | null;
};

export async function findEmailDispatchById(
  pgPool: Pool,
  dispatchId: string,
): Promise<RawEmailDispatchRow | null> {
  const result = await pgPool.query<RawEmailDispatchRow>(
    `
      SELECT
        id,
        campaign_id AS "campaignId",
        contact_id AS "contactId",
        template_id AS "templateId",
        smtp_sender_id AS "smtpSenderId",
        recipient_email AS "recipientEmail",
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent"
      FROM email_dispatches
      WHERE id = $1
      LIMIT 1
    `,
    [dispatchId],
  );

  return result.rows[0] ?? null;
}

export async function listTemplateInlineAssetsForDispatch(
  pgPool: Pool,
  templateId: string,
): Promise<RawDispatchEmailFileRow[]> {
  const result = await pgPool.query<RawDispatchEmailFileRow>(
    `
      SELECT
        id,
        original_name AS "originalName",
        mime_type AS "mimeType",
        storage_key AS "storageKey",
        cid
      FROM email_files
      WHERE template_id = $1
        AND kind = 'template_inline_asset'
      ORDER BY created_at ASC
    `,
    [templateId],
  );

  return result.rows;
}

export async function listTemplateAttachmentsForDispatch(
  pgPool: Pool,
  templateId: string,
): Promise<RawDispatchEmailFileRow[]> {
  const result = await pgPool.query<RawDispatchEmailFileRow>(
    `
      SELECT
        id,
        original_name AS "originalName",
        mime_type AS "mimeType",
        storage_key AS "storageKey",
        cid
      FROM email_files
      WHERE template_id = $1
        AND kind = 'template_attachment'
      ORDER BY created_at ASC
    `,
    [templateId],
  );

  return result.rows;
}

export async function markEmailDispatchProcessing(
  pgPool: Pool,
  dispatchId: string,
): Promise<void> {
  await pgPool.query(
    `
      UPDATE email_dispatches
      SET status = $2,
          error_message = NULL
      WHERE id = $1
    `,
    [dispatchId, emailDispatchStatus.processing],
  );
}

export async function markEmailDispatchSent(
  pgPool: Pool,
  input: { dispatchId: string; providerMessageId: string },
): Promise<void> {
  await pgPool.query(
    `
      UPDATE email_dispatches
      SET status = $2,
          provider_message_id = $3,
          sent_at = NOW(),
          error_message = NULL
      WHERE id = $1
    `,
    [input.dispatchId, emailDispatchStatus.sent, input.providerMessageId],
  );
}

export async function markEmailDispatchFailed(
  pgPool: Pool,
  input: { dispatchId: string; errorMessage: string },
): Promise<void> {
  await pgPool.query(
    `
      UPDATE email_dispatches
      SET status = $2,
          error_message = $3
      WHERE id = $1
    `,
    [input.dispatchId, emailDispatchStatus.error, input.errorMessage],
  );
}
