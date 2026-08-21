const pool = require("../config/db");

// ========================================
// Get All Public Sellers
// ========================================

// ========================================
// Get All Public Sellers
// ========================================
const getAllSellers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id AS seller_id,
        u.name AS seller_name,
        sa.business_name,
        sa.description,

        COUNT(p.id) AS product_count

      FROM users u

      INNER JOIN seller_applications sa
        ON sa.user_id = u.id

      LEFT JOIN products p
        ON p.seller_id = u.id
        AND p.approval_status = 'approved'
        AND p.is_active = true

      WHERE
        u.role = 'seller'
        AND sa.status = 'approved'

      GROUP BY
        u.id,
        u.name,
        sa.business_name,
        sa.description

      ORDER BY
        sa.business_name ASC
    `);

    res.status(200).json({
      message: "Sellers fetched successfully",
      sellers: result.rows,
    });

  } catch (error) {
    console.error("Get all sellers error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ========================================
// Get Seller Store
// ========================================

const getSellerStore = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // ----------------------------------------
    // Get seller information
    // ----------------------------------------

    const sellerResult = await pool.query(
      `
      SELECT
        u.id AS seller_id,
        u.name AS seller_name,
        sa.business_name,
        sa.description

      FROM users u

      INNER JOIN seller_applications sa
        ON sa.user_id = u.id

      WHERE
        u.id = $1
        AND u.role = 'seller'
        AND sa.status = 'approved'
      `,
      [sellerId]
    );

    if (sellerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const seller = sellerResult.rows[0];

    // ----------------------------------------
    // Get seller's public products
    // ----------------------------------------

    const productsResult = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.price,
        p.description,
        p.image,
        p.rating,
        p.category_id,
        p.seller_id,
        p.created_at

      FROM products p

      WHERE
        p.seller_id = $1
        AND p.approval_status = 'approved'
        AND p.is_active = true

      ORDER BY
        p.created_at DESC,
        p.id DESC
      `,
      [sellerId]
    );

    res.status(200).json({
      message: "Seller store fetched successfully",

      seller,

      products: productsResult.rows,

      totalProducts: productsResult.rows.length,
    });

  } catch (error) {
    console.error("Get seller store error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


module.exports = {
  getAllSellers,
  getSellerStore,
};