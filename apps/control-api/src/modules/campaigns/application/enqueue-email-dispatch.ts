import { randomUUID } from "node:crypto";

import type { Queue } from "bullmq";
import type { Pool } from "pg";

import {
  renderTemplate,
  type EmailDispatchJobData,
  type TemplateVariables,
} from "shared";

type EnqueueEmailDispatchDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
};

export type EnqueueEmailDispatchInput = {
  campaignId: string;
  campaignName: string;
  contactId: string;
  to: string;
  templateId?: string | undefined;
  templateVariables?: TemplateVariables | undefined;
  subject?: string | undefined;
  htmlContent?: string | undefined;
  textContent?: string | undefined;
};

export type EnqueueEmailDispatchResult =
  | {
      kind: "template_not_found";
    }
  | {
      kind: "accepted";
      dispatchId: string;
      jobId: string | undefined;
      queueName: string;
    };

type RawTemplateRow = {
  id: string;
  subject: string;
  htmlContent: string | null;
  textContent: string | null;
};

export async function enqueueEmailDispatch(
  dependencies: EnqueueEmailDispatchDependencies,
  input: EnqueueEmailDispatchInput,
): Promise<EnqueueEmailDispatchResult> {
  const dispatchId = randomUUID();
  const client = await dependencies.pgPool.connect();

  const templateVariables = input.templateVariables ?? {};

  let resolvedSubject = input.subject ?? null;
  let resolvedHtmlContent = input.htmlContent ?? null;
  let resolvedTextContent = input.textContent ?? null;

  try {
    await client.query("BEGIN");

    if (input.templateId) {
      const templateResult = await client.query<RawTemplateRow>(
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
        [input.templateId],
      );

      const template = templateResult.rows[0];

      if (!template) {
        await client.query("ROLLBACK");
        return {
          kind: "template_not_found",
        };
      }

      resolvedSubject = renderTemplate(template.subject, templateVariables);
      resolvedHtmlContent = template.htmlContent
        ? renderTemplate(template.htmlContent, templateVariables)
        : null;
      resolvedTextContent = template.textContent
        ? renderTemplate(template.textContent, templateVariables)
        : null;
    }

    await client.query(
      `
        INSERT INTO campaigns (id, name, subject)
        VALUES ($1, $2, $3)
        ON CONFLICT (id)
        DO UPDATE SET
          name = EXCLUDED.name,
          subject = EXCLUDED.subject
      `,
      [input.campaignId, input.campaignName, resolvedSubject],
    );

    await client.query(
      `
        INSERT INTO contacts (id, email)
        VALUES ($1, $2)
        ON CONFLICT (id)
        DO UPDATE SET
          email = EXCLUDED.email
      `,
      [input.contactId, input.to],
    );

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
        dispatchId,
        input.campaignId,
        input.contactId,
        input.templateId ?? null,
        JSON.stringify(templateVariables),
        input.to,
        resolvedSubject,
        resolvedHtmlContent,
        resolvedTextContent,
        "pending",
      ],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  try {
    const job = await dependencies.queue.add("email-dispatch", {
      dispatchId,
    });

    await dependencies.pgPool.query(
      `
        UPDATE email_dispatches
        SET status = $2
        WHERE id = $1
      `,
      [dispatchId, "queued"],
    );

    return {
      kind: "accepted",
      dispatchId,
      jobId: job.id?.toString(),
      queueName: job.queueName,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao enfileirar job";

    await dependencies.pgPool.query(
      `
        UPDATE email_dispatches
        SET status = $2,
            error_message = $3
        WHERE id = $1
      `,
      [dispatchId, "error", errorMessage],
    );

    throw error;
  }
}
