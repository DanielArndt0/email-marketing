import { randomUUID } from "node:crypto";

import type { Queue } from "bullmq";
import type { Pool } from "pg";

import {
  EMAIL_DISPATCH_ENQUEUE_JOB_NAME,
  renderTemplate,
  type EmailDispatchJobData,
  type TemplateVariables,
} from "shared";

import {
  findTemplateForDispatch,
  insertEmailDispatch,
  markEmailDispatchError,
  markEmailDispatchQueued,
  upsertCampaign,
  upsertContact,
} from "../repositories/email-dispatch-command-repository.js";

type EnqueueEmailDispatchDependencies = {
  pgPool: Pool;
  queue: Queue<EmailDispatchJobData>;
};

export type EnqueueEmailDispatchInput = {
  campaignId: string;
  campaignName: string;
  contactId: string;
  to: string;
  smtpSenderId?: string | null | undefined;
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
      const template = await findTemplateForDispatch(client, input.templateId);

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

    await upsertCampaign(client, {
      id: input.campaignId,
      name: input.campaignName,
      subject: resolvedSubject,
    });

    const contactId = await upsertContact(client, {
      id: input.contactId,
      email: input.to,
    });

    await insertEmailDispatch(client, {
      id: dispatchId,
      campaignId: input.campaignId,
      contactId,
      templateId: input.templateId ?? null,
      smtpSenderId: input.smtpSenderId ?? null,
      templateVariables: JSON.stringify(templateVariables),
      recipientEmail: input.to,
      subject: resolvedSubject,
      htmlContent: resolvedHtmlContent,
      textContent: resolvedTextContent,
      status: "pending",
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  try {
    const job = await dependencies.queue.add(EMAIL_DISPATCH_ENQUEUE_JOB_NAME, {
      dispatchId,
    });

    await markEmailDispatchQueued(dependencies.pgPool, dispatchId);

    return {
      kind: "accepted",
      dispatchId,
      jobId: job.id?.toString(),
      queueName: job.queueName,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao enfileirar job";

    await markEmailDispatchError(dependencies.pgPool, {
      dispatchId,
      errorMessage,
    });

    throw error;
  }
}
