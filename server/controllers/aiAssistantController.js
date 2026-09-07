const pool = require("../config/db");
const {
  generateEmbedding,
  toVectorLiteral,
} = require("../services/ai/embeddingService");

const MAX_MESSAGE_LENGTH = 500;
const MAX_RESULTS = 8;

const parseNumber = (value) => Number(value.replace(/,/g, ""));

const getFilters = (message) => {
  const text = message.toLowerCase();
  const priceText = text.replace(/(?:at least|more than|over)\s*\d+\s*(?:items?|units?)?\s*in stock/g, "");
  const filters = {};

  const between = priceText.match(/between\s*\$?([\d,]+)\s*(?:and|-)\s*\$?([\d,]+)/i);
  const under = priceText.match(/(?:under|below|less than|up to|at most)\s*\$?([\d,]+)/i);
  const over = priceText.match(/(?:over|above|more than|at least|minimum of)\s*\$?([\d,]+)/i);
  const stockAtLeast = text.match(/(?:at least|more than|over)\s*(\d+)\s*(?:items?|units?)?\s*in stock/i);

  if (between) {
    filters.minPrice = parseNumber(between[1]);
    filters.maxPrice = parseNumber(between[2]);
  } else if (under) {
    filters.maxPrice = parseNumber(under[1]);
  } else if (over) {
    filters.minPrice = parseNumber(over[1]);
  }

  if (stockAtLeast) {
    filters.minStock = Number(stockAtLeast[1]);
  } else if (/low stock/i.test(text)) {
    filters.maxStock = 5;
  }

  return filters;
};

const getMatchingCategoryIds = async (message) => {
  const result = await pool.query(
    `
    SELECT id
    FROM categories
    WHERE $1 ILIKE '%' || name || '%'
    `,
    [message]
  );

  return result.rows.map((category) => category.id);
};

const buildProductQuery = ({ filters, categoryIds, embedding }) => {
  const values = [];
  const addValue = (value) => {
    values.push(value);
    return `$${values.length}`;
  };

  const conditions = [
    "p.is_active = TRUE",
    "p.approval_status = 'approved'",
    "p.stock > 0",
  ];

  if (embedding) {
    conditions.push("p.embedding IS NOT NULL");
  }

  if (categoryIds.length) {
    conditions.push(`p.category_id = ANY(${addValue(categoryIds)}::int[])`);
  }
  if (Number.isFinite(filters.minPrice)) {
    conditions.push(`p.price >= ${addValue(filters.minPrice)}::numeric`);
  }
  if (Number.isFinite(filters.maxPrice)) {
    conditions.push(`p.price <= ${addValue(filters.maxPrice)}::numeric`);
  }
  if (Number.isInteger(filters.minStock)) {
    conditions.push(`p.stock >= ${addValue(filters.minStock)}::int`);
  }
  if (Number.isInteger(filters.maxStock)) {
    conditions.push(`p.stock <= ${addValue(filters.maxStock)}::int`);
  }

  const similarity = embedding
    ? `1 - (p.embedding <=> ${addValue(toVectorLiteral(embedding))}::vector)`
    : "NULL";
  const orderBy = embedding
    ? `p.embedding IS NULL, p.embedding <=> $${values.length}::vector, p.id DESC`
    : "p.id DESC";

  values.push(MAX_RESULTS);

  return {
    text: `
      SELECT
        p.id, p.title, p.price, p.description, p.image, p.rating, p.stock,
        p.category_id, c.name AS category, ${similarity} AS similarity
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT $${values.length}
    `,
    values,
  };
};

const buildFallbackQuery = ({ filters, categoryIds, message }) => {
  const query = buildProductQuery({ filters, categoryIds, embedding: null });
  query.values.splice(query.values.length - 1, 0, `%${message}%`);
  const searchIndex = query.values.length - 1;
  query.text = query.text.replace(
    "WHERE ",
    `WHERE (p.title ILIKE $${searchIndex} OR p.description ILIKE $${searchIndex} OR c.name ILIKE $${searchIndex}) AND `
  );
  query.text = query.text.replace(/LIMIT \$\d+/, `LIMIT $${query.values.length}`);
  return query;
};

const chat = async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!message) {
    return res.status(400).json({ message: "A shopping question is required" });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ message: `Questions must be ${MAX_MESSAGE_LENGTH} characters or fewer` });
  }

  try {
    const [categoryIds, filters] = await Promise.all([
      getMatchingCategoryIds(message),
      Promise.resolve(getFilters(message)),
    ]);

    let embedding = null;
    let aiAvailable = true;
    try {
      embedding = await generateEmbedding(message);
    } catch (error) {
      aiAvailable = false;
      console.error("AI assistant embedding error:", error.message);
    }

    let result = embedding
      ? await pool.query(buildProductQuery({ filters, categoryIds, embedding }))
      : await pool.query(buildFallbackQuery({ filters, categoryIds, message }));

    // Products without historical embeddings remain discoverable while the
    // background embedding rollout is still in progress.
    if (embedding && result.rows.length === 0) {
      result = await pool.query(buildFallbackQuery({ filters, categoryIds, message }));
    }

    const products = result.rows;
    const response = products.length
      ? `I found ${products.length} currently available product${products.length === 1 ? "" : "s"} that match your request.`
      : "I couldn't find any currently available products that match your request.";

    return res.json({
      response,
      products,
      aiAvailable,
    });
  } catch (error) {
    console.error("AI assistant chat error:", error.message);
    return res.status(503).json({
      message: "The shopping assistant is temporarily unavailable. You can still browse products normally.",
    });
  }
};

module.exports = { chat };
