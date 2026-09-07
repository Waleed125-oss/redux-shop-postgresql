# Supabase + Vercel database setup

The API now reads `DATABASE_URL`, which is the connection string Supabase
provides for PostgreSQL. No Supabase JavaScript client is required because the
application already talks to PostgreSQL through `pg`.

## 1. Create and populate the Supabase database

1. Create a Supabase project.
2. In its SQL Editor, run the schema that created your current local database
   (export it first with `pg_dump` if the local database contains live data).
3. Run each SQL file in `database/migrations` after the base schema. The
   included embedding migration needs the `vector` extension, which Supabase
   supports.

## 2. Add Vercel environment variables

In the Vercel project for the `server` directory, add these for **Production**,
**Preview**, and **Development** as appropriate:

```text
DATABASE_URL=<Supabase Session pooler connection string>
DB_POOL_MAX=1
DB_SSL=true
```

Copy the Session pooler URI from Supabase's **Connect** panel. Do not commit it
to `.env` or expose it in the React client. If the password contains special
characters, use the URI copied by Supabase rather than building one by hand.

The remaining server secrets (`JWT_SECRET`, Stripe, email, Cloudinary, and AI
keys) must also be configured in Vercel; values in a local `.env` are not
available to deployed functions.

## 3. Redeploy and verify

Redeploy the server project, then request `GET /health` and perform an API
request that reads the database. A successful `/health` response only proves
the function is running; a database-backed endpoint confirms the connection.

For local development, set `DATABASE_URL` to the Supabase URI, or leave it
empty and use the legacy `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and
`DB_PASSWORD` variables. Set `DB_SSL=false` only for a non-TLS local database.
