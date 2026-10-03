import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!db) {
    const pool = new Pool({ connectionString: url });
    db = drizzle(pool, { schema }) as ReturnType<typeof drizzle<typeof schema>>;
  }
  return db;
}
