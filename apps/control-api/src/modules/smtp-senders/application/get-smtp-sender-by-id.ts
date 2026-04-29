import type { Pool } from "pg";

import { findSmtpSenderById } from "../repositories/smtp-sender-repository.js";
import { mapSmtpSenderRow, type SmtpSenderRecord } from "./shared.js";

type GetSmtpSenderByIdDependencies = {
  pgPool: Pool;
};

export async function getSmtpSenderById(
  dependencies: GetSmtpSenderByIdDependencies,
  id: string,
): Promise<SmtpSenderRecord | null> {
  const row = await findSmtpSenderById(dependencies.pgPool, id);

  return row ? mapSmtpSenderRow(row) : null;
}
