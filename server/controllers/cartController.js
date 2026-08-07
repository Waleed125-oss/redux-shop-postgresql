const pool = require("../config/db");

// GET CART
const getCart = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cart.id,
             cart.quantity,
             products.id AS product_id,
             products.title,
             products.price,
             products.image
      FROM cart
      JOIN products
      ON cart.product_id = products.id
      WHERE cart.user_id = $1
    `,
  [req.user.id]
);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { product_id } = req.body;

    if(!product_id) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    const product = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [product_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Check if product already exists in cart
    const existing = await pool.query(
      `SELECT *
      FROM cart
      WHERE product_id = $1
      AND user_id = $2`,
      [product_id, req.user.id]
    );

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE cart
         SET quantity = quantity + 1
         WHERE product_id = $1
         AND user_id = $2
         RETURNING *`,
        [product_id,
          req.user.id,
        ]
      );

      return res.json(result.rows[0]);
    }

    const result = await pool.query(
      `INSERT INTO cart (product_id, quantity, user_id)
       VALUES ($1, 1, $2)
       RETURNING *`,
      [product_id, req.user.id,]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// UPDATE QUANTITY
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be alteat 1",
      });
    }

    const result = await pool.query(
      `UPDATE cart
       SET quantity = $1
       WHERE id = $2
       AND user_id = $3
       RETURNING *`,
      [quantity, id, req.user.id,]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// DELETE ITEM
const deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM cart
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [id, req.user.id,]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.json({
      message: "Item removed from cart",
      item: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  deleteCartItem,
};