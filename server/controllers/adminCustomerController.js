const pool = require("../config/db");

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get customer information
    const customerResult = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role
      FROM users
      WHERE id = $1
      AND role = 'customer'
      `,
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const customer = customerResult.rows[0];

    // Get customer's orders
    const ordersResult = await pool.query(
      `
      SELECT
        id,
        total_amount,
        status,
        created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [id]
    );

    // Calculate statistics
    const totalOrders = ordersResult.rows.length;

    const totalSpent = ordersResult.rows.reduce(
      (total, order) => {
        return total + Number(order.total_amount);
      },
      0
    );

    res.json({
      customer,
      statistics: {
        totalOrders,
        totalSpent,
      },
      orders: ordersResult.rows,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch customer",
    });

  }
};

module.exports = {
  getCustomerById,
};