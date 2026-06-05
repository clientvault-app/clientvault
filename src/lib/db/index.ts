import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Module-level singleton (lazy initialized on first use)
let _db: NeonHttpDatabase<typeof schema> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is not set. Please configure your Neon database connection."
      );
    }
    const sql = neon(databaseUrl);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Export a getter function instead of a direct instance
// so the adapter doesn't check the type at import time
export { getDb };

// Also export a `db` proxy for backwards compatibility.
// The proxy delegates all property access to the lazy singleton.
export const db = new Proxy(
  {} as NeonHttpDatabase<typeof schema>,
  {
    get(_, prop, receiver) {
      const realDb = getDb();
      const value = Reflect.get(realDb, prop, realDb);
      if (typeof value === "function") {
        return value.bind(realDb);
      }
      return value;
    },
  }
);

export type Database = NeonHttpDatabase<typeof schema>;
