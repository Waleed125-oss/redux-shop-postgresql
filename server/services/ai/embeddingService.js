const OpenAI = require("openai");

const pool = require("../../config/db");

const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL ||
  "text-embedding-3-small";

const EMBEDDING_DIMENSIONS = 1536;

const buildProductEmbeddingText = ({
  title,
  category,
  description,
}) => [
  `Title: ${title || ""}`,
  `Category: ${category || ""}`,
  `Description: ${description || ""}`,
].join("\n");

const generateEmbedding = async (input) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
    encoding_format: "float",
  });

  const embedding = response.data?.[0]?.embedding;

  if (
    !Array.isArray(embedding) ||
    embedding.length !== EMBEDDING_DIMENSIONS ||
    !embedding.every(Number.isFinite)
  ) {
    throw new Error("Embedding response has an invalid vector shape");
  }

  return embedding;
};

const toVectorLiteral = (embedding) =>
  `[${embedding.join(",")}]`;

const updateProductEmbedding = async (product) => {
  const categoryResult = await pool.query(
    `
    SELECT name
    FROM categories
    WHERE id = $1
    `,
    [product.category_id]
  );

  const category =
    categoryResult.rows[0]?.name ||
    "";

  const embedding = await generateEmbedding(
    buildProductEmbeddingText({
      title: product.title,
      category,
      description: product.description,
    })
  );

  await pool.query(
    `
    UPDATE products
    SET
      embedding = $1::vector,
      embedding_model = $2,
      embedding_updated_at = NOW()
    WHERE id = $3
    `,
    [
      toVectorLiteral(embedding),
      EMBEDDING_MODEL,
      product.id,
    ]
  );
};

module.exports = {
  buildProductEmbeddingText,
  generateEmbedding,
  toVectorLiteral,
  updateProductEmbedding,
};
