import type { Pool } from "pg";

export type RawWorkerSmtpSenderRow = {
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
};

export async function findSmtpSenderById(
  pgPool: Pool,
  id: string,
): Promise<RawWorkerSmtpSenderRow | null> {
  const result = await pgPool.query<RawWorkerSmtpSenderRow>(
    `
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
        is_active AS "isActive"
      FROM smtp_senders
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}
