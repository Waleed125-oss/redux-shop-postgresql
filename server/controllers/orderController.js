// const pool = require("../config/db");

// const checkout = async (req, res) => {
//   try {

//     // Step 1
//     // Read all items from cart
//     const cart = await pool.query(`
// SELECT
// cart.product_id,
// cart.quantity,
// products.price
// FROM cart
// JOIN products
// ON cart.product_id = products.id
// WHERE cart.user_id = $1
// `,
// [req.user.id]);

// if (cart.rows.length === 0) {
//   return res.status(400).json({
//     message: "Cart is empty",
//   });
// }


//     // Step 2
//     // Calculate total
//     const totalAmount = cart.rows.reduce((total, item) => {
//   return total + item.price * item.quantity;
// }, 0);


//     // Step 3
//     // Create Order

//     const order = await pool.query(
//       `INSERT INTO orders (user_id, total_amount)
//       VALUES ($1, $2)
//       RETURNING *`,
//       [req.user.id, totalAmount,]
//     );

//     // Step 4
//     // Insert Order Items
//     for (const item of cart.rows) {
//       await pool.query(
//         `INSERT INTO order_items
//         (order_id, product_id, quantity, price)
//         VALUES ($1, $2, $3, $4)`,
//         [
//           order.rows[0].id,
//           item.product_id,
//           item.quantity,
//           item.price,
//         ]
//       );
//     }


//     // Step 5
//     // Clear Cart
//      await pool.query("DELETE FROM cart WHERE user_id = $1",
//       [req.user.id]
//      );

//     // Step 6
//     // Send Response
//     res.status(201).json({
//       message: "Order placed successfully",
//       order: order.rows[0],
//     });

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });

//   }
// };

// const getOrders = async (req, res) => {
//   try {

//     let result;

//     if (req.user.role === "admin") {

//       result = await pool.query(`
//         SELECT *
//         FROM orders
//         ORDER BY created_at DESC
//       `);

//     } else {

//       result = await pool.query(
//         `
//         SELECT *
//         FROM orders
//         WHERE user_id = $1
//         ORDER BY created_at DESC
//         `,
//         [req.user.id]
//       );

//     }

//     res.json(result.rows);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });

//   }
// };

// const getSingleOrder = async (req, res) => {
//   try {

//     const { id } = req.params;

//     let order;

//     if (req.user.role === "admin") {

//       order = await pool.query(
//         `
//         SELECT *
//         FROM orders
//         WHERE id = $1
//         `,
//         [id]
//       );

//     } else {

//       order = await pool.query(
//         `
//         SELECT *
//         FROM orders
//         WHERE id = $1
//         AND user_id = $2
//         `,
//         [id, req.user.id]
//       );

//     }

//     if (order.rows.length === 0) {
//       return res.status(404).json({
//         message: "Order not found",
//       });
//     }

//     const items = await pool.query(
//       `
//       SELECT
//       order_items.id,
//       order_items.quantity,
//       order_items.price,
//       products.title,
//       products.image
//       FROM order_items
//       JOIN products
//       ON order_items.product_id = products.id
//       WHERE order_items.order_id = $1
//       `,
//       [id]
//     );

//     res.json({
//       order: order.rows[0],
//       items: items.rows,
//     });

//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });
//   }
// };

// const updateOrderStatus = async (req, res) => {

//   try {

//     const { id } = req.params;

//     const { status } = req.body;


//     const result = await pool.query(

//       `
//       UPDATE orders

//       SET status = $1

//       WHERE id = $2

//       RETURNING *
//       `,

//       [status, id]

//     );


//     if (result.rows.length === 0) {

//       return res.status(404).json({
//         message: "Order not found",
//       });

//     }


//     res.json(result.rows[0]);

//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });

//   }

// };

// module.exports = {
//   checkout,
//   getOrders,
//   getSingleOrder,
//   updateOrderStatus,
// };























const pool = require("../config/db");


// ======================================================
// CHECKOUT
// ======================================================

const checkout = async (req, res) => {

  try {

    // ================= STEP 1 =================
    // Get user's cart

    const cart = await pool.query(
      `
      SELECT
        cart.product_id,
        cart.quantity,
        products.price

      FROM cart

      JOIN products
        ON cart.product_id = products.id

      WHERE cart.user_id = $1
      `,
      [req.user.id]
    );


    // Cart empty

    if (cart.rows.length === 0) {

      return res.status(400).json({
        message: "Cart is empty",
      });

    }


    // ================= STEP 2 =================
    // Calculate total

    const totalAmount = cart.rows.reduce(
      (total, item) => {

        return total + (
          Number(item.price) *
          Number(item.quantity)
        );

      },
      0
    );


    // ================= STEP 3 =================
    // Create order

    const order = await pool.query(
      `
      INSERT INTO orders
      (
        user_id,
        total_amount
      )

      VALUES
      ($1, $2)

      RETURNING *
      `,
      [
        req.user.id,
        totalAmount,
      ]
    );


    // ================= STEP 4 =================
    // Create order items

    for (const item of cart.rows) {

      await pool.query(
        `
        INSERT INTO order_items
        (
          order_id,
          product_id,
          quantity,
          price
        )

        VALUES
        ($1, $2, $3, $4)
        `,
        [
          order.rows[0].id,
          item.product_id,
          item.quantity,
          item.price,
        ]
      );

    }


    // ================= STEP 5 =================
    // Clear cart

    await pool.query(
      `
      DELETE FROM cart

      WHERE user_id = $1
      `,
      [req.user.id]
    );


    // ================= STEP 6 =================
    // Response

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



// ======================================================
// GET ORDERS
// ======================================================

// const getOrders = async (req, res) => {

//   try {

//     let result;


//     // ================= ADMIN =================

//     if (req.user.role === "admin") {

//       result = await pool.query(
//         `
//         SELECT *

//         FROM orders

//         ORDER BY created_at DESC
//         `
//       );

//     }


//     // ================= CUSTOMER =================

//     else {

//       result = await pool.query(
//         `
//         SELECT *

//         FROM orders

//         WHERE user_id = $1

//         ORDER BY created_at DESC
//         `,
//         [req.user.id]
//       );

//     }


//     res.json(result.rows);


//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });

//   }

// };

const getOrders = async (req, res) => {
  try {
    let result;

    // ==================================================
    // ADMIN
    // ==================================================

    if (req.user.role === "admin") {
      result = await pool.query(`
        SELECT *
        FROM orders
        ORDER BY created_at DESC
      `);
    }

    // ==================================================
    // SELLER
    // ==================================================

    else if (req.user.role === "seller") {
      result = await pool.query(
        `
        SELECT DISTINCT orders.*
        FROM orders
        JOIN order_items
          ON orders.id = order_items.order_id
        JOIN products
          ON order_items.product_id = products.id
        WHERE products.seller_id = $1
        ORDER BY orders.created_at DESC
        `,
        [req.user.id]
      );
    }

    // ==================================================
    // CUSTOMER
    // ==================================================

    else {
      result = await pool.query(
        `
        SELECT *
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );
    }

    res.json(result.rows);

  } catch (error) {
    console.error("Get Orders Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ======================================================
// GET SINGLE ORDER
// ======================================================

// const getSingleOrder = async (req, res) => {

//   try {

//     const { id } = req.params;

//     let order;


//     // ================= ADMIN =================

//     if (req.user.role === "admin") {

//       order = await pool.query(
//         `
//         SELECT *

//         FROM orders

//         WHERE id = $1
//         `,
//         [id]
//       );

//     }


//     // ================= CUSTOMER =================

//     else {

//       order = await pool.query(
//         `
//         SELECT *

//         FROM orders

//         WHERE id = $1
//         AND user_id = $2
//         `,
//         [
//           id,
//           req.user.id,
//         ]
//       );

//     }


//     // ================= ORDER NOT FOUND =================

//     if (order.rows.length === 0) {

//       return res.status(404).json({
//         message: "Order not found",
//       });

//     }


//     // ================= ORDER ITEMS =================

//     const items = await pool.query(
//       `
//       SELECT
//         order_items.id,
//         order_items.quantity,
//         order_items.price,
//         products.title,
//         products.image

//       FROM order_items

//       JOIN products
//         ON order_items.product_id = products.id

//       WHERE order_items.order_id = $1
//       `,
//       [id]
//     );


//     // ================= RESPONSE =================

//     res.json({

//       order: order.rows[0],

//       items: items.rows,

//     });


//   } catch (error) {

//     console.error(error);

//     res.status(500).json({
//       message: "Server Error",
//     });

//   }

// };


const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    let order;

    // ==================================================
    // ADMIN
    // ==================================================

    if (req.user.role === "admin") {
      order = await pool.query(
        `
        SELECT *
        FROM orders
        WHERE id = $1
        `,
        [id]
      );
    }

    // ==================================================
    // SELLER
    // ==================================================

    else if (req.user.role === "seller") {
      order = await pool.query(
        `
        SELECT DISTINCT orders.*
        FROM orders
        JOIN order_items
          ON orders.id = order_items.order_id
        JOIN products
          ON order_items.product_id = products.id
        WHERE orders.id = $1
        AND products.seller_id = $2
        `,
        [id, req.user.id]
      );
    }

    // ==================================================
    // CUSTOMER
    // ==================================================

    else {
      order = await pool.query(
        `
        SELECT *
        FROM orders
        WHERE id = $1
        AND user_id = $2
        `,
        [id, req.user.id]
      );
    }

    // ==================================================
    // ORDER NOT FOUND
    // ==================================================

    if (order.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // ==================================================
    // GET ORDER ITEMS
    // ==================================================

    let items;

    // Seller only sees THEIR products
    if (req.user.role === "seller") {
      items = await pool.query(
        `
        SELECT
          order_items.id,
          order_items.quantity,
          order_items.price,
          order_items.stripe_transfer_id,
          products.title,
          products.image,
          products.seller_id
        FROM order_items
        JOIN products
          ON order_items.product_id = products.id
        WHERE order_items.order_id = $1
        AND products.seller_id = $2
        `,
        [id, req.user.id]
      );
    }

    // Admin/customer see all order items
    else {
      items = await pool.query(
        `
        SELECT
          order_items.id,
          order_items.quantity,
          order_items.price,
          order_items.stripe_transfer_id,
          products.title,
          products.image,
          products.seller_id
        FROM order_items
        JOIN products
          ON order_items.product_id = products.id
        WHERE order_items.order_id = $1
        `,
        [id]
      );
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({
      order: order.rows[0],
      items: items.rows,
    });

  } catch (error) {
    console.error("Get Single Order Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ======================================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// ======================================================

const updateOrderStatus = async (req, res) => {

  try {

    // ==================================================
    // EXTRA SECURITY CHECK
    // ==================================================

    if (req.user.role !== "admin") {

      return res.status(403).json({
        message: "Only admin can update order status",
      });

    }


    const { id } = req.params;

    const { status } = req.body;


    // ==================================================
    // VALIDATE STATUS
    // ==================================================

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];


    if (!allowedStatuses.includes(status)) {

      return res.status(400).json({
        message: "Invalid order status",
      });

    }


    // ==================================================
    // UPDATE ORDER
    // ==================================================

    const result = await pool.query(
      `
      UPDATE orders

      SET status = $1

      WHERE id = $2

      RETURNING *
      `,
      [
        status,
        id,
      ]
    );


    // ==================================================
    // ORDER NOT FOUND
    // ==================================================

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "Order not found",
      });

    }


    // ==================================================
    // RESPONSE
    // ==================================================

    res.json(result.rows[0]);


  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

};



// ======================================================
// EXPORT
// ======================================================

module.exports = {
  checkout,
  getOrders,
  getSingleOrder,
  updateOrderStatus,
};