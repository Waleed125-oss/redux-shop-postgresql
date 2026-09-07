-- Phase 1: pgvector infrastructure for product semantic search.
--
-- Embedding contract:
--   Provider/model: OpenAI text-embedding-3-small
--   Dimensions:     1536 (the model default)
--   Distance:       cosine distance
--
-- Do not change the model or dimension without creating a new migration and
-- regenerating every stored embedding. Product embeddings are populated in
-- Phase 2; this migration intentionally leaves existing product behavior
-- untouched.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_model text,
  ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

-- HNSW supports efficient nearest-neighbor searches using cosine distance.
-- Rows with a NULL embedding are not indexed, so existing products remain
-- valid until Phase 2 generates their embeddings.
CREATE INDEX IF NOT EXISTS products_embedding_hnsw_cosine_idx
  ON products
  USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;
