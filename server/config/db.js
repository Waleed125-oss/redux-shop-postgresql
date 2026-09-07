const { Pool } = require("pg");
require("dotenv").config();

// Supabase provides a complete PostgreSQL connection string. Use its pooler
// connection string in Vercel's DATABASE_URL environment variable.
const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required. Set it to the Supabase PostgreSQL connection string."
  );
}

const pool = new Pool({
  // Serverless functions can create many concurrent instances. A small pool
  // avoids exhausting Supabase's connection limit.
  connectionString,
  max: 1,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});

module.exports = pool;
