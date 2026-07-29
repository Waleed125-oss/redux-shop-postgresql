const pool = require("../config/db");

const checkout = async (req, res) => {
  try {

    // Step 1
    // Read all items from cart
    const cart = await pool.query(`
SELECT
cart.product_id,
cart.quantity,
products.price
FROM cart
JOIN products
ON cart.product_id = products.id
`);

if (cart.rows.length === 0) {
  return res.status(400).json({
    message: "Cart is empty",
  });
}


    // Step 2
    // Calculate total
    const totalAmount = cart.rows.reduce((total, item) => {
  return total + item.price * item.quantity;
}, 0);


    // Step 3
    // Create Order

    const order = await pool.query(
      `INSERT INTO orders (total_amount)
      VALUES ($1)
      RETURNING *`,
      [totalAmount]
    );

    // Step 4
    // Insert Order Items
    for (const item of cart.rows) {
      await pool.query(
        `INSERT INTO order_items
        (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)`,
        [
          order.rows[0].id,
          item.product_id,
          item.quantity,
          item.price,
        ]
      );
    }


    // Step 5
    // Clear Cart
     await pool.query("DELETE FROM cart");

    // Step 6
    // Send Response
    res.status(201).json({
      message: "Order placed successfully",
      order: order.rows[0],
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

module.exports = {
  checkout,
};