import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { config as loadDotenv } from "dotenv";

export interface DatabaseConfig {
  connectionUri: string;
}

export interface PwsConfig {
  managerPort: number;
  database: DatabaseConfig;
}

export function loadEnvConfig(): void {
  const candidates = [".env", ".env.local", ".env.dev.local"];
  let currentDir = process.cwd();
  const visited = new Set<string>();

  while (!visited.has(currentDir)) {
    visited.add(currentDir);

    for (const candidate of candidates) {
      const path = resolve(currentDir, candidate);

      if (existsSync(path)) {
        loadDotenv({ path, override: false });
      }
    }

    currentDir = dirname(currentDir);
  }
}

export function getDatabaseConfig(): DatabaseConfig {
  const connectionUri = process.env.DATABASE_URI ?? process.env.DATABSE_URI;

  if (!connectionUri) {
    throw new Error("DATABASE_URI is required.");
  }

  return { connectionUri };
}

export function getDefaultConfig(): PwsConfig {
  return {
    managerPort: 7000,
    database: getDatabaseConfig()
  };
}
