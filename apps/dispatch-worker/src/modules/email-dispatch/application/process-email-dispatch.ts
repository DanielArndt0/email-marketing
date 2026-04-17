import type { Pool } from "pg";

import { sendEmail, systemConfig } from "shared";

import {
  findEmailDispatchById,
  markEmailDispatchFailed,
  markEmailDispatchProcessing,
  markEmailDispatchSent,
} from "../repositories/email-dispatch-worker-repository.js";

type ProcessEmailDispatchDependencies = {
  pgPool: Pool;
};

export type ProcessEmailDispatchInput = {
  dispatchId: string;
};

export type ProcessEmailDispatchResult = {
  campaignId: string;
  contactId: string;
  messageId: string;
};

export async function processEmailDispatch(
  dependencies: ProcessEmailDispatchDependencies,
  input: ProcessEmailDispatchInput,
): Promise<ProcessEmailDispatchResult> {
  const dispatch = await findEmailDispatchById(dependencies.pgPool, input.dispatchId);

  if (!dispatch) {
    throw new Error(`Email dispatch ${input.dispatchId} não encontrado.`);
  }

  await markEmailDispatchProcessing(dependencies.pgPool, input.dispatchId);

  try {
    const emailInput = {
      to: dispatch.recipientEmail,
      subject: dispatch.subject,
      text: dispatch.textContent ?? systemConfig.mail.fallbackText,
      ...(dispatch.htmlContent ? { html: dispatch.htmlContent } : {}),
    };

    const result = await sendEmail(emailInput);

    await markEmailDispatchSent(dependencies.pgPool, {
      dispatchId: input.dispatchId,
      providerMessageId: result.messageId,
    });

    return {
      campaignId: dispatch.campaignId,
      contactId: dispatch.contactId,
      messageId: result.messageId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao enviar e-mail";

    await markEmailDispatchFailed(dependencies.pgPool, {
      dispatchId: input.dispatchId,
      errorMessage,
    });

    throw error;
  }
}
