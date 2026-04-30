import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { Pool, PoolClient } from "pg";

import { createLogger } from "../logger/index.js";
import { createPgPool } from "./create-pg-pool.js";

const logger = createLogger({
  serviceName: "database-migrations",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrations(pool: Pool): Promise<Set<string>> {
  const result = await pool.query<{ id: string }>(
    "SELECT id FROM schema_migrations",
  );

  return new Set(result.rows.map((row) => row.id));
}

async function executeMigration(
  client: PoolClient,
  fileName: string,
  sql: string,
): Promise<void> {
  await client.query("BEGIN");

  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [
      fileName,
    ]);
    await client.query("COMMIT");

    logger.info({ fileName }, "migration executada com sucesso");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);

    logger.error(
      {
        err: error,
        fileName,
      },
      "falha ao executar migration",
    );

    throw error;
  }
}

async function runMigrations(): Promise<void> {
  const pool = createPgPool();
  const migrationsDir = resolve(
    __dirname,
    "../../../../infra/database/migrations",
  );

  try {
    await ensureMigrationsTable(pool);

    const executedMigrations = await getExecutedMigrations(pool);
    const files = await readdir(migrationsDir);
    const migrationFiles = files.filter((file) => file.endsWith(".sql")).sort();
    const client = await pool.connect();

    try {
      for (const fileName of migrationFiles) {
        if (executedMigrations.has(fileName)) {
          logger.info({ fileName }, "migration já executada, ignorando");
          continue;
        }

        const filePath = join(migrationsDir, fileName);
        const sql = await readFile(filePath, "utf-8");

        await executeMigration(client, fileName, sql);
      }
    } finally {
      client.release();
    }

    logger.info("processo de migrations finalizado");
  } finally {
    await pool.end();
  }
}

void runMigrations().catch((error) => {
  logger.fatal(
    {
      err: error,
    },
    "falha ao executar migrations",
  );

  process.exit(1);
});
