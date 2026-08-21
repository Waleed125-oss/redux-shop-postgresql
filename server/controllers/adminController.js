const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    // ================= TOTAL PRODUCTS =================

    const productsResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM products
    `);


    // ================= TOTAL CUSTOMERS =================

    const customersResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'customer'
    `);


    // ================= TOTAL ORDERS =================

    const ordersResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM orders
    `);


    // ================= TOTAL REVENUE =================

    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total
      FROM orders
    `);


    // ================= RECENT ORDERS =================

    const recentOrdersResult = await pool.query(`
      SELECT
        orders.id,
        orders.total_amount,
        orders.status,
        orders.created_at,

        users.name AS customer_name,
        users.email AS customer_email

      FROM orders

      JOIN users
      ON orders.user_id = users.id

      ORDER BY orders.created_at DESC

      LIMIT 3
    `);


    // ================= RESPONSE =================

    res.json({

      statistics: {

        products: Number(
          productsResult.rows[0].total
        ),

        customers: Number(
          customersResult.rows[0].total
        ),

        orders: Number(
          ordersResult.rows[0].total
        ),

        revenue: Number(
          revenueResult.rows[0].total
        ),

      },

      recentOrders:
        recentOrdersResult.rows,

    });


  } catch (error) {

    console.error(
      "DASHBOARD ERROR:",
      error
    );

    res.status(500).json({

      message:
        "Failed to fetch dashboard statistics",

      error:
        error.message,

    });

  }
};

// ========================================
// Get pending seller applications
// ========================================

const getSellerApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        sa.id,
        sa.user_id,
        sa.business_name,
        sa.phone,
        sa.description,
        sa.status,
        sa.admin_note,
        sa.created_at,

        u.name,
        u.email

      FROM seller_applications sa

      JOIN users u
        ON sa.user_id = u.id

      WHERE sa.status = 'pending'

      ORDER BY sa.created_at DESC
      `
    );

    res.json({
      applications: result.rows,
    });

  } catch (error) {
    console.log(
      "Get seller applications error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};



// ========================================
// Approve seller application
// ========================================

const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;

    // Find application
    const applicationResult = await pool.query(
      `
      SELECT *
      FROM seller_applications
      WHERE id = $1
      `,
      [id]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({
        message: "Seller application not found",
      });
    }

    const application = applicationResult.rows[0];

    // Check status
    if (application.status !== "pending") {
      return res.status(400).json({
        message: "This application has already been processed",
      });
    }

    // Update user role
    await pool.query(
      `
      UPDATE users
      SET role = 'seller'
      WHERE id = $1
      `,
      [application.user_id]
    );

    // Update application
    const result = await pool.query(
      `
      UPDATE seller_applications

      SET
        status = 'approved',
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $1

      RETURNING *
      `,
      [id]
    );

    res.json({
      message: "Seller approved successfully",
      application: result.rows[0],
    });

  } catch (error) {
    console.log(
      "Approve seller error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};



// ========================================
// Reject seller application
// ========================================

const rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      adminNote,
    } = req.body;

    // Find application
    const applicationResult = await pool.query(
      `
      SELECT *
      FROM seller_applications
      WHERE id = $1
      `,
      [id]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({
        message: "Seller application not found",
      });
    }

    const application = applicationResult.rows[0];

    if (application.status !== "pending") {
      return res.status(400).json({
        message: "This application has already been processed",
      });
    }

    const result = await pool.query(
      `
      UPDATE seller_applications

      SET
        status = 'rejected',
        admin_note = $1,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2

      RETURNING *
      `,
      [
        adminNote || null,
        id,
      ]
    );

    res.json({
      message: "Seller application rejected",
      application: result.rows[0],
    });

  } catch (error) {
    console.log(
      "Reject seller error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ========================================
// GET APPROVED SELLERS WITH PRODUCTS
// ========================================

// ========================================
// Get approved sellers
// ========================================

// ========================================
// Get approved sellers
// ========================================

const getApprovedSellers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,

        sa.business_name,
        sa.phone,
        sa.description,
        sa.updated_at AS approved_at,

        COUNT(p.id) AS product_count

      FROM users u

      LEFT JOIN seller_applications sa
        ON sa.user_id = u.id
        AND sa.status = 'approved'

      LEFT JOIN products p
        ON p.seller_id = u.id
        AND p.approval_status = 'approved'

      WHERE u.role = 'seller'

      GROUP BY
        u.id,
        u.name,
        u.email,
        sa.business_name,
        sa.phone,
        sa.description,
        sa.updated_at

      ORDER BY u.name ASC
    `);

    res.json({
      sellers: result.rows,
    });

  } catch (error) {
    console.error(
      "Get approved sellers error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch approved sellers",
      error: error.message,
    });
  }
};


// ========================================
// GET APPROVED SELLER DETAILS
// ========================================
const getSellerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================
    // GET SELLER INFORMATION
    // ========================================
    const sellerResult = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        sa.business_name,
        sa.phone,
        sa.description,
        sa.status AS seller_status,
        sa.created_at AS application_date
      FROM users u
      LEFT JOIN seller_applications sa
        ON sa.user_id = u.id
      WHERE u.id = $1
        AND u.role = 'seller'
      `,
      [id]
    );

    if (sellerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const seller = sellerResult.rows[0];

    // ========================================
    // GET SELLER PRODUCTS
    // ========================================
   const productsResult = await pool.query(
  `
  SELECT
    p.id,
    p.title,
    p.price,
    p.description,
    p.image,
    p.rating,
    p.is_active,
    p.approval_status,
    p.created_at,
    p.category_id,
    c.name AS category_name
  FROM products p
  LEFT JOIN categories c
    ON p.category_id = c.id
  WHERE p.seller_id = $1
  ORDER BY p.created_at DESC
  `,
  [id]
);

    // ========================================
    // PRODUCT STATISTICS
    // ========================================
    const totalProducts = productsResult.rows.length;

    const approvedProducts = productsResult.rows.filter(
      (product) =>
        product.approval_status === "approved"
    ).length;

    const pendingProducts = productsResult.rows.filter(
      (product) =>
        product.approval_status === "pending"
    ).length;

    const rejectedProducts = productsResult.rows.filter(
      (product) =>
        product.approval_status === "rejected"
    ).length;

    // ========================================
    // RESPONSE
    // ========================================
    res.json({
      seller,
      statistics: {
        totalProducts,
        approvedProducts,
        pendingProducts,
        rejectedProducts,
      },
      products: productsResult.rows,
    });

  } catch (error) {
    console.error(
      "Get seller details error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch seller details",
    });
  }
};

module.exports = {
  getDashboardStats,
  getSellerApplications,
  approveSeller,
  rejectSeller,
  getApprovedSellers,
  getSellerDetails,
};