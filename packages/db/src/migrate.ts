import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnvConfig } from "@pws/config";
import { createLogger } from "@pws/logging";

import { createDatabasePool } from "./index.js";

const logger = createLogger("db:migrate");
const currentDir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(currentDir, "..", "migrations");
const migrationsTable = "pws_schema_migrations";

interface MigrationFile {
  filename: string;
  sql: string;
}

async function ensureMigrationsTable(): Promise<void> {
  const pool = createDatabasePool({ max: 1 });

  try {
    await pool.query(`
      create table if not exists ${migrationsTable} (
        id bigserial primary key,
        filename text not null unique,
        applied_at timestamptz not null default now()
      )
    `);
  } finally {
    await pool.end();
  }
}

async function loadMigrationFiles(): Promise<MigrationFile[]> {
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const filenames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();

  return Promise.all(
    filenames.map(async (filename) => ({
      filename,
      sql: await readFile(join(migrationsDir, filename), "utf8")
    }))
  );
}

async function getAppliedMigrationNames(): Promise<Set<string>> {
  const pool = createDatabasePool({ max: 1 });

  try {
    const result = await pool.query<{ filename: string }>(
      `select filename from ${migrationsTable} order by filename asc`
    );

    return new Set(result.rows.map((row: { filename: string }) => row.filename));
  } finally {
    await pool.end();
  }
}

async function applyPendingMigrations(): Promise<void> {
  await ensureMigrationsTable();

  const appliedNames = await getAppliedMigrationNames();
  const migrationFiles = await loadMigrationFiles();
  const pendingFiles = migrationFiles.filter((file) => !appliedNames.has(file.filename));

  if (pendingFiles.length === 0) {
    logger.info("No pending migrations.");
    return;
  }

  const pool = createDatabasePool({ max: 1 });
  const client = await pool.connect();

  try {
    for (const migrationFile of pendingFiles) {
      logger.info(`Applying ${migrationFile.filename}`);
      await client.query("begin");
      await client.query(migrationFile.sql);
      await client.query(`insert into ${migrationsTable} (filename) values ($1)`, [migrationFile.filename]);
      await client.query("commit");
    }
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function printMigrationStatus(): Promise<void> {
  await ensureMigrationsTable();

  const appliedNames = await getAppliedMigrationNames();
  const migrationFiles = await loadMigrationFiles();

  for (const migrationFile of migrationFiles) {
    const status = appliedNames.has(migrationFile.filename) ? "applied" : "pending";
    logger.info(`${status}: ${migrationFile.filename}`);
  }
}

async function main(): Promise<void> {
  loadEnvConfig();

  if (process.argv.includes("--status")) {
    await printMigrationStatus();
    return;
  }

  await applyPendingMigrations();
}

main().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
