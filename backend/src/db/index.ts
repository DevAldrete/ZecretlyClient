import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.ZECRETLY_DB_CONNECTION_URI!,
});

export const db = drizzle(pool);
