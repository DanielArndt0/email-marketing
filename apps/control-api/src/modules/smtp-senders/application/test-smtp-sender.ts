import nodemailer from "nodemailer";
import type { Pool } from "pg";

import { decryptSecret, env } from "shared";

import {
  findSmtpSenderById,
  updateSmtpSenderTestResult,
} from "../repositories/smtp-sender-repository.js";

type TestSmtpSenderDependencies = {
  pgPool: Pool;
};

export type TestSmtpSenderInput = {
  id: string;
  to?: string | undefined;
};

export type TestSmtpSenderResult =
  | { kind: "not_found" }
  | { kind: "success"; testedAt: string }
  | { kind: "error"; message: string; testedAt: string };

function buildFrom(input: { fromName: string; fromEmail: string }): string {
  return `"${input.fromName.replaceAll('"', "")}" <${input.fromEmail}>`;
}

export async function testSmtpSender(
  dependencies: TestSmtpSenderDependencies,
  input: TestSmtpSenderInput,
): Promise<TestSmtpSenderResult> {
  const sender = await findSmtpSenderById(dependencies.pgPool, input.id);

  if (!sender) {
    return { kind: "not_found" };
  }

  const testedAt = new Date().toISOString();

  try {
    const password = decryptSecret(
      sender.passwordEncrypted,
      env.SMTP_SENDER_ENCRYPTION_KEY,
    );

    const transporter = nodemailer.createTransport({
      host: sender.host,
      port: sender.port,
      secure: sender.secure,
      auth: {
        user: sender.username,
        pass: password,
      },
    });

    if (input.to) {
      await transporter.sendMail({
        from: buildFrom({
          fromName: sender.fromName,
          fromEmail: sender.fromEmail,
        }),
        to: input.to,
        replyTo: sender.replyToEmail ?? undefined,
        subject: "Teste de SMTP sender",
        text: "Este é um e-mail de teste enviado pela Control API.",
      });
    } else {
      await transporter.verify();
    }

    await updateSmtpSenderTestResult(dependencies.pgPool, {
      id: sender.id,
      status: "success",
    });

    return {
      kind: "success",
      testedAt,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido.";

    await updateSmtpSenderTestResult(dependencies.pgPool, {
      id: sender.id,
      status: "error",
      error: message,
    });

    return {
      kind: "error",
      message,
      testedAt,
    };
  }
}
