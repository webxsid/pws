import { Pool, type PoolConfig } from "pg";

import { getDatabaseConfig } from "@pws/config";

export interface DatabasePoolOptions {
  max?: number;
}

export function createDatabasePool(options: DatabasePoolOptions = {}): Pool {
  const database = getDatabaseConfig();
  const config: PoolConfig = {
    connectionString: database.connectionUri
  };

  if (options.max !== undefined) {
    config.max = options.max;
  }

  return new Pool(config);
}
