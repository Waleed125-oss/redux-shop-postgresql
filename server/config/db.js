const { Pool } = require("pg");
require("dotenv").config();

// Supabase provides a complete PostgreSQL connection string. Use its pooler
// connection string in Vercel's DATABASE_URL environment variable.
const connectionString = process.env.DATABASE_URL;
const isVercel = Boolean(process.env.VERCEL);
const useSsl = process.env.DB_SSL !== "false" && (Boolean(connectionString) || isVercel);

const pool = new Pool({
  ...(connectionString
    ? { connectionString }
    : {
        // Keep the existing local-development configuration as a fallback.
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }),
  // Serverless functions can create many concurrent instances. A small pool
  // avoids exhausting Supabase's connection limit.
  max: Number(process.env.DB_POOL_MAX) || (isVercel ? 1 : 10),
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});

module.exports = pool;
