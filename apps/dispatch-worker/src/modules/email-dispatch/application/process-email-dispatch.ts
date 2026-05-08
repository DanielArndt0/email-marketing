import type { Pool } from "pg";

import { validateTemplateCidReferences } from "core";
import { sendEmail, systemConfig, type SendEmailAttachmentInput } from "shared";

import { buildSmtpSenderMailConfig } from "../../smtp-senders/application/build-smtp-sender-mail-config.js";
import { findSmtpSenderById } from "../../smtp-senders/repositories/smtp-sender-repository.js";
import { syncCampaignStatusFromDispatches } from "./sync-campaign-status-from-dispatches.js";

import {
  findEmailDispatchById,
  listTemplateAttachmentsForDispatch,
  listTemplateInlineAssetsForDispatch,
  markEmailDispatchFailed,
  markEmailDispatchProcessing,
  markEmailDispatchSent,
  type RawDispatchEmailFileRow,
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

function mapInlineAssetToAttachment(
  file: RawDispatchEmailFileRow,
): SendEmailAttachmentInput {
  return {
    filename: file.originalName,
    path: file.storageKey,
    contentType: file.mimeType,
    cid: file.cid ?? undefined,
    contentDisposition: "inline",
  };
}

function mapRegularFileToAttachment(
  file: RawDispatchEmailFileRow,
): SendEmailAttachmentInput {
  return {
    filename: file.originalName,
    path: file.storageKey,
    contentType: file.mimeType,
    contentDisposition: "attachment",
  };
}

function assertTemplateCidReferences(input: {
  htmlContent: string | null;
  availableCids: string[];
  dispatchId: string;
}): void {
  const validation = validateTemplateCidReferences({
    htmlContent: input.htmlContent,
    availableCids: input.availableCids,
  });

  if (validation.isValid) {
    return;
  }

  throw new Error(
    `Email dispatch ${input.dispatchId} possui referências cid sem asset vinculado: ${validation.missingCids.join(", ")}.`,
  );
}

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

    const inlineAssets = dispatch.templateId
      ? await listTemplateInlineAssetsForDispatch(
          dependencies.pgPool,
          dispatch.templateId,
        )
      : [];

    assertTemplateCidReferences({
      htmlContent: dispatch.htmlContent,
      availableCids: inlineAssets
        .map((asset) => asset.cid)
        .filter((cid): cid is string => Boolean(cid)),
      dispatchId: input.dispatchId,
    });

    const regularAttachments = dispatch.templateId
      ? await listTemplateAttachmentsForDispatch(
          dependencies.pgPool,
          dispatch.templateId,
        )
      : [];

    const senderConfig = buildSmtpSenderMailConfig(sender);

    const result = await sendEmail(
      {
        to: dispatch.recipientEmail,
        subject: dispatch.subject,
        text: dispatch.textContent ?? systemConfig.mail.fallbackText,
        ...(dispatch.htmlContent ? { html: dispatch.htmlContent } : {}),
        attachments: [
          ...inlineAssets.map(mapInlineAssetToAttachment),
          ...regularAttachments.map(mapRegularFileToAttachment),
        ],
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
  } finally {
    await syncCampaignStatusFromDispatches(
      dependencies,
      dispatch.campaignId,
    ).catch(() => undefined);
  }
}
