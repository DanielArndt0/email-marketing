import type { Pool } from "pg";

import { sendEmail, systemConfig } from "shared";

import { buildSmtpSenderMailConfig } from "../../smtp-senders/application/build-smtp-sender-mail-config.js";
import { findSmtpSenderById } from "../../smtp-senders/repositories/smtp-sender-repository.js";
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
  const dispatch = await findEmailDispatchById(
    dependencies.pgPool,
    input.dispatchId,
  );

  if (!dispatch) {
    throw new Error(`Email dispatch ${input.dispatchId} não encontrado.`);
  }

  await markEmailDispatchProcessing(dependencies.pgPool, input.dispatchId);

  try {
    if (!dispatch.smtpSenderId) {
      throw new Error(
        `Email dispatch ${input.dispatchId} não possui SMTP sender vinculado.`,
      );
    }

    const sender = await findSmtpSenderById(
      dependencies.pgPool,
      dispatch.smtpSenderId,
    );

    if (!sender) {
      throw new Error(
        `SMTP sender ${dispatch.smtpSenderId} não encontrado para o dispatch ${input.dispatchId}.`,
      );
    }

    if (!sender.isActive) {
      throw new Error(
        `SMTP sender ${dispatch.smtpSenderId} está inativo para o dispatch ${input.dispatchId}.`,
      );
    }

    const senderConfig = buildSmtpSenderMailConfig(sender);

    const result = await sendEmail(
      {
        to: dispatch.recipientEmail,
        subject: dispatch.subject,
        text: dispatch.textContent ?? systemConfig.mail.fallbackText,
        ...(dispatch.htmlContent ? { html: dispatch.htmlContent } : {}),
      },
      senderConfig,
    );

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
