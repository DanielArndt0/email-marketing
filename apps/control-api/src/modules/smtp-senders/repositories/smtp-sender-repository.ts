import type { Pool } from "pg";

export type RawSmtpSenderRow = {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  passwordEncrypted: string;
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

export async function listSmtpSenders(
  pgPool: Pool,
  filters: ListSmtpSendersFilters,
): Promise<RawSmtpSenderRow[]> {
  const where: string[] = [];
  const values: unknown[] = [];

  if (filters.isActive !== undefined) {
    values.push(filters.isActive);
    where.push(`is_active = $${values.length}`);
  }

  values.push(filters.pageSize);
  const limitParam = values.length;

  values.push((filters.page - 1) * filters.pageSize);
  const offsetParam = values.length;

  const result = await pgPool.query<RawSmtpSenderRow>(
    `
      ${SMTP_SENDER_SELECT}
      ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
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
  const where: string[] = [];
  const values: unknown[] = [];

  if (filters.isActive !== undefined) {
    values.push(filters.isActive);
    where.push(`is_active = $${values.length}`);
  }

  const result = await pgPool.query<CountRow>(
    `
      SELECT COUNT(*)::text AS total
      FROM smtp_senders
      ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
    `,
    values,
  );

  return Number(result.rows[0]?.total ?? "0");
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
  username: string;
  passwordEncrypted: string;
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
      input.username,
      input.passwordEncrypted,
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
  username?: string | undefined;
  passwordEncrypted?: string | undefined;
  isActive?: boolean | undefined;
};

export async function updateSmtpSenderById(
  pgPool: Pool,
  input: UpdateSmtpSenderInput,
): Promise<RawSmtpSenderRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];

  function addSet(column: string, value: unknown): void {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  }

  if (input.name !== undefined) addSet("name", input.name);
  if (input.fromName !== undefined) addSet("from_name", input.fromName);
  if (input.fromEmail !== undefined) addSet("from_email", input.fromEmail);
  if (input.replyToEmail !== undefined)
    addSet("reply_to_email", input.replyToEmail);
  if (input.host !== undefined) addSet("host", input.host);
  if (input.port !== undefined) addSet("port", input.port);
  if (input.secure !== undefined) addSet("secure", input.secure);
  if (input.username !== undefined) addSet("username", input.username);
  if (input.passwordEncrypted !== undefined) {
    addSet("password_encrypted", input.passwordEncrypted);
  }
  if (input.isActive !== undefined) addSet("is_active", input.isActive);

  if (sets.length === 0) {
    return findSmtpSenderById(pgPool, input.id);
  }

  values.push(input.id);

  const result = await pgPool.query<RawSmtpSenderRow>(
    `
      UPDATE smtp_senders
      SET
        ${sets.join(", ")},
        updated_at = NOW()
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

  return Number(result.rows[0]?.total ?? "0");
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
