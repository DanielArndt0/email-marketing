import type { Pool, PoolClient } from "pg";

export type RawTemplateDispatchRow = {
  id: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
};

export async function findTemplateForDispatch(
  client: PoolClient,
  templateId: string,
): Promise<RawTemplateDispatchRow | null> {
  const result = await client.query<RawTemplateDispatchRow>(
    `
      SELECT
        id,
        subject,
        html_content AS "htmlContent",
        text_content AS "textContent"
      FROM templates
      WHERE id = $1
      LIMIT 1
    `,
    [templateId],
  );

  return result.rows[0] ?? null;
}

export async function upsertCampaign(
  client: PoolClient,
  input: { id: string; name: string; subject: string | null },
): Promise<void> {
  await client.query(
    `
      INSERT INTO campaigns (id, name, subject)
      VALUES ($1, $2, $3)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        subject = EXCLUDED.subject
    `,
    [input.id, input.name, input.subject],
  );
}

export async function upsertContact(
  client: PoolClient,
  input: { id: string; email: string },
): Promise<void> {
  await client.query(
    `
      INSERT INTO contacts (id, email)
      VALUES ($1, $2)
      ON CONFLICT (id)
      DO UPDATE SET
        email = EXCLUDED.email
    `,
    [input.id, input.email],
  );
}

export async function insertEmailDispatch(
  client: PoolClient,
  input: {
    id: string;
    campaignId: string;
    contactId: string;
    templateId: string | null;
    templateVariables: string;
    recipientEmail: string;
    subject: string | null;
    htmlContent: string | null;
    textContent: string | null;
    status: string;
  },
): Promise<void> {
  await client.query(
    `
      INSERT INTO email_dispatches (
        id,
        campaign_id,
        contact_id,
        template_id,
        template_variables,
        recipient_email,
        subject,
        html_content,
        text_content,
        status
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
    `,
    [
      input.id,
      input.campaignId,
      input.contactId,
      input.templateId,
      input.templateVariables,
      input.recipientEmail,
      input.subject,
      input.htmlContent,
      input.textContent,
      input.status,
    ],
  );
}

export async function markEmailDispatchQueued(
  pgPool: Pool,
  dispatchId: string,
): Promise<void> {
  await pgPool.query(
    `
      UPDATE email_dispatches
      SET status = $2
      WHERE id = $1
    `,
    [dispatchId, "queued"],
  );
}

export async function markEmailDispatchError(
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
    [input.dispatchId, "error", input.errorMessage],
  );
}
