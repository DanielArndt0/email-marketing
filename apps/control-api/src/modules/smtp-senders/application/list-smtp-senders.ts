import type { Pool } from "pg";

import {
  countSmtpSenders,
  listSmtpSenders,
} from "../repositories/smtp-sender-repository.js";
import {
  buildSmtpSenderListResult,
  type SmtpSenderListResult,
} from "./shared.js";

type ListSmtpSendersDependencies = {
  pgPool: Pool;
};

export type ListSmtpSendersInput = {
  page: number;
  pageSize: number;
  isActive?: boolean | undefined;
};

export async function listSmtpSendersUseCase(
  dependencies: ListSmtpSendersDependencies,
  input: ListSmtpSendersInput,
): Promise<SmtpSenderListResult> {
  const [rows, total] = await Promise.all([
    listSmtpSenders(dependencies.pgPool, input),
    countSmtpSenders(dependencies.pgPool, {
      isActive: input.isActive,
    }),
  ]);

  return buildSmtpSenderListResult({
    rows,
    page: input.page,
    pageSize: input.pageSize,
    total,
  });
}
