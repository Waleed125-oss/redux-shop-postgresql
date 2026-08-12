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


module.exports = {
  getDashboardStats,
};