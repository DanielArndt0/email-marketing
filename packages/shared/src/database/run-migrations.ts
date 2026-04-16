import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createLogger } from "../logger/index.js";
import { createPgPool } from "./create-pg-pool.js";

const logger = createLogger({
  serviceName: "database-migrations",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ensureMigrationsTable(): Promise<void> {
  const pool = createPgPool();

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  } finally {
    await pool.end();
  }
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const pool = createPgPool();

  try {
    const result = await pool.query<{ id: string }>(
      "SELECT id FROM schema_migrations",
    );

    return new Set(result.rows.map((row) => row.id));
  } finally {
    await pool.end();
  }
}

async function executeMigration(fileName: string, sql: string): Promise<void> {
  const pool = createPgPool();

  try {
    await pool.query("BEGIN");
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations (id) VALUES ($1)", [
      fileName,
    ]);
    await pool.query("COMMIT");

    logger.info({ fileName }, "migration executada com sucesso");
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => undefined);

    logger.error(
      {
        err: error,
        fileName,
      },
      "falha ao executar migration",
    );

    throw error;
  } finally {
    await pool.end();
  }
}

async function runMigrations(): Promise<void> {
  const migrationsDir = resolve(
    __dirname,
    "../../../../infra/database/migrations",
  );

  await ensureMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const files = await readdir(migrationsDir);
  const migrationFiles = files.filter((file) => file.endsWith(".sql")).sort();

  for (const fileName of migrationFiles) {
    if (executedMigrations.has(fileName)) {
      logger.info({ fileName }, "migration já executada, ignorando");
      continue;
    }

    const filePath = join(migrationsDir, fileName);
    const sql = await readFile(filePath, "utf-8");

    await executeMigration(fileName, sql);
  }

  logger.info("processo de migrations finalizado");
}

void runMigrations().catch((error) => {
  logger.fatal(
    {
      err: error,
    },
    "falha ao executar migrations",
  );

  console.error(error);
  process.exit(1);
});
