import { buildPaginationMeta } from "../../../shared/persistence/build-pagination-meta.js";
import { normalizeDateValue } from "../../../shared/persistence/normalize-date-value.js";
import type { RawSmtpSenderRow } from "../repositories/smtp-sender-repository.js";

export type SmtpSenderRecord = {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  isActive: boolean;
  lastTestedAt: string | null;
  lastTestStatus: string | null;
  lastTestError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SmtpSenderListResult = {
  items: SmtpSenderRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function mapSmtpSenderRow(row: RawSmtpSenderRow): SmtpSenderRecord {
  return {
    id: row.id,
    name: row.name,
    fromName: row.fromName,
    fromEmail: row.fromEmail,
    replyToEmail: row.replyToEmail,
    host: row.host,
    port: row.port,
    secure: row.secure,
    username: row.username,
    isActive: row.isActive,
    lastTestedAt: normalizeDateValue(row.lastTestedAt),
    lastTestStatus: row.lastTestStatus,
    lastTestError: row.lastTestError,
    createdAt: normalizeDateValue(row.createdAt) ?? "",
    updatedAt: normalizeDateValue(row.updatedAt) ?? "",
  };
}

export function buildSmtpSenderListResult(input: {
  rows: RawSmtpSenderRow[];
  page: number;
  pageSize: number;
  total: number;
}): SmtpSenderListResult {
  return {
    items: input.rows.map(mapSmtpSenderRow),
    ...buildPaginationMeta({
      page: input.page,
      pageSize: input.pageSize,
      total: input.total,
    }),
  };
}
