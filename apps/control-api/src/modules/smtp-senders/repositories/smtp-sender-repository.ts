import type { Pool } from "pg";

import {
  addUpdateAssignment,
  addWhereCondition,
  buildWhereClause,
  readCount,
} from "../../../shared/persistence/sql-builders.js";

export type RawSmtpSenderRow = {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  host: string;
  port: number;
  secure: boolean;
  username: string | null;
  passwordEncrypted: string | null;
  isActive: boolean;
  lastTestedAt: Date | string | null;
  lastTestStatus: string | null;
  lastTestError: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type CountRow = {
  total: string;
};

const SMTP_SENDER_SELECT = `
  SELECT
    id,
    name,
    from_name AS "fromName",
    from_email AS "fromEmail",
    reply_to_email AS "replyToEmail",
    host,
    port,
    secure,
    username,
    password_encrypted AS "passwordEncrypted",
    is_active AS "isActive",
    last_tested_at AS "lastTestedAt",
    last_test_status AS "lastTestStatus",
    last_test_error AS "lastTestError",
    created_at AS "createdAt",
    updated_at AS "updatedAt"
  FROM smtp_senders
`;

export type ListSmtpSendersFilters = {
  page: number;
  pageSize: number;
  isActive?: boolean | undefined;
};

function buildSmtpSenderFilters(
  filters: Omit<ListSmtpSendersFilters, "page" | "pageSize">,
): { whereClause: string; values: unknown[] } {
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (filters.isActive !== undefined) {
    addWhereCondition({
      conditions,
      values,
      condition: (param) => `is_active = ${param}`,
      value: filters.isActive,
    });
  }

  return {
    whereClause: buildWhereClause(conditions),
    values,
  };
}

export async function listSmtpSenders(
  pgPool: Pool,
  filters: ListSmtpSendersFilters,
): Promise<RawSmtpSenderRow[]> {
  const { whereClause, values } = buildSmtpSenderFilters(filters);

  values.push(filters.pageSize);
  const limitParam = values.length;

  values.push((filters.page - 1) * filters.pageSize);
  const offsetParam = values.length;

  const result = await pgPool.query<RawSmtpSenderRow>(
    `
      ${SMTP_SENDER_SELECT}
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `,
    values,
  );

  return result.rows;
}

export async function countSmtpSenders(
  pgPool: Pool,
  filters: Omit<ListSmtpSendersFilters, "page" | "pageSize">,
): Promise<number> {
  const { whereClause, values } = buildSmtpSenderFilters(filters);

  const result = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM smtp_senders
      ${whereClause}
    `,
    values,
  );

  return readCount(result.rows[0]);
}

export async function findSmtpSenderById(
  pgPool: Pool,
  id: string,
): Promise<RawSmtpSenderRow | null> {
  const result = await pgPool.query<RawSmtpSenderRow>(
    `
      ${SMTP_SENDER_SELECT}
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export type InsertSmtpSenderInput = {
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string | null | undefined;
  host: string;
  port: number;
  secure: boolean;
  username?: string | null | undefined;
  passwordEncrypted?: string | null | undefined;
  isActive: boolean;
};

export async function insertSmtpSender(
  pgPool: Pool,
  input: InsertSmtpSenderInput,
): Promise<RawSmtpSenderRow> {
  const result = await pgPool.query<RawSmtpSenderRow>(
    `
      INSERT INTO smtp_senders (
        name,
        from_name,
        from_email,
        reply_to_email,
        host,
        port,
        secure,
        username,
        password_encrypted,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        name,
        from_name AS "fromName",
        from_email AS "fromEmail",
        reply_to_email AS "replyToEmail",
        host,
        port,
        secure,
        username,
        password_encrypted AS "passwordEncrypted",
        is_active AS "isActive",
        last_tested_at AS "lastTestedAt",
        last_test_status AS "lastTestStatus",
        last_test_error AS "lastTestError",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      input.name,
      input.fromName,
      input.fromEmail,
      input.replyToEmail ?? null,
      input.host,
      input.port,
      input.secure,
      input.username ?? null,
      input.passwordEncrypted ?? null,
      input.isActive,
    ],
  );

  return result.rows[0]!;
}

export type UpdateSmtpSenderInput = {
  id: string;
  name?: string | undefined;
  fromName?: string | undefined;
  fromEmail?: string | undefined;
  replyToEmail?: string | null | undefined;
  host?: string | undefined;
  port?: number | undefined;
  secure?: boolean | undefined;
  username?: string | null | undefined;
  passwordEncrypted?: string | null | undefined;
  isActive?: boolean | undefined;
};

export async function updateSmtpSenderById(
  pgPool: Pool,
  input: UpdateSmtpSenderInput,
): Promise<RawSmtpSenderRow | null> {
  const assignments: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "name",
      value: input.name,
    });
  }
  if (input.fromName !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "from_name",
      value: input.fromName,
    });
  }
  if (input.fromEmail !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "from_email",
      value: input.fromEmail,
    });
  }
  if (input.replyToEmail !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "reply_to_email",
      value: input.replyToEmail,
    });
  }
  if (input.host !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "host",
      value: input.host,
    });
  }
  if (input.port !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "port",
      value: input.port,
    });
  }
  if (input.secure !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "secure",
      value: input.secure,
    });
  }
  if (input.username !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "username",
      value: input.username,
    });
  }
  if (input.passwordEncrypted !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "password_encrypted",
      value: input.passwordEncrypted,
    });
  }
  if (input.isActive !== undefined) {
    addUpdateAssignment({
      assignments,
      values,
      column: "is_active",
      value: input.isActive,
    });
  }

  if (assignments.length === 0) {
    return findSmtpSenderById(pgPool, input.id);
  }

  assignments.push("updated_at = NOW()");
  values.push(input.id);

  const result = await pgPool.query<RawSmtpSenderRow>(
    `
      UPDATE smtp_senders
      SET ${assignments.join(", ")}
      WHERE id = $${values.length}
      RETURNING
        id,
        name,
        from_name AS "fromName",
        from_email AS "fromEmail",
        reply_to_email AS "replyToEmail",
        host,
        port,
        secure,
        username,
        password_encrypted AS "passwordEncrypted",
        is_active AS "isActive",
        last_tested_at AS "lastTestedAt",
        last_test_status AS "lastTestStatus",
        last_test_error AS "lastTestError",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteSmtpSenderById(
  pgPool: Pool,
  id: string,
): Promise<void> {
  await pgPool.query(
    `
      DELETE FROM smtp_senders
      WHERE id = $1
    `,
    [id],
  );
}

export async function countCampaignsBySmtpSenderId(
  pgPool: Pool,
  smtpSenderId: string,
): Promise<number> {
  const result = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM campaigns
      WHERE smtp_sender_id = $1
    `,
    [smtpSenderId],
  );

  return readCount(result.rows[0]);
}

export async function updateSmtpSenderTestResult(
  pgPool: Pool,
  input: {
    id: string;
    status: "success" | "error";
    error?: string | null | undefined;
  },
): Promise<void> {
  await pgPool.query(
    `
      UPDATE smtp_senders
      SET
        last_tested_at = NOW(),
        last_test_status = $2,
        last_test_error = $3,
        updated_at = NOW()
      WHERE id = $1
    `,
    [input.id, input.status, input.error ?? null],
  );
}
