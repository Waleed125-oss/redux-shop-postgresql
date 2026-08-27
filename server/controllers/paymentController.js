const stripe = require("../config/stripe");
const pool = require("../config/db");


// ======================================================
// CREATE STRIPE CHECKOUT SESSION
// ======================================================

const createCheckoutSession = async (req, res) => {
  const client = await pool.connect();

  try {

    // ==================================================
    // START DATABASE TRANSACTION
    // ==================================================

    await client.query("BEGIN");


    // ==================================================
    // GET USER CART
    // ==================================================

    const cart = await client.query(
      `
      SELECT
        cart.product_id,
        cart.quantity,
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


    // ==================================================
    // CART EMPTY
    // ==================================================

    if (cart.rows.length === 0) {

      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Cart is empty",
      });
    }


    // ==================================================
    // CALCULATE TOTAL
    // ==================================================

    const totalAmount = cart.rows.reduce(
      (total, item) => {

        return (
          total +
          Number(item.price) *
          Number(item.quantity)
        );

      },
      0
    );


    // ==================================================
    // CREATE PENDING ORDER
    // ==================================================

    const order = await client.query(
      `
      INSERT INTO orders
      (
        user_id,
        total_amount,
        status,
        payment_status
      )
      VALUES
      ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        req.user.id,
        totalAmount,
        "Pending",
        "pending",
      ]
    );


    const orderId = order.rows[0].id;


    // ==================================================
    // CREATE ORDER ITEMS
    // ==================================================

    for (const item of cart.rows) {

      await client.query(
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
          orderId,
          item.product_id,
          item.quantity,
          item.price,
        ]
      );

    }


    // ==================================================
    // CREATE STRIPE LINE ITEMS
    // ==================================================

    const lineItems = cart.rows.map((item) => ({

      price_data: {

        currency: "usd",

        product_data: {
          name: item.title,

          metadata: {
            productId: String(item.product_id),
          },
        },

        unit_amount:
          Math.round(
            Number(item.price) * 100
          ),
      },

      quantity: item.quantity,

    }));


    // ==================================================
    // CREATE STRIPE SESSION
    // ==================================================

    const session =
      await stripe.checkout.sessions.create({

        mode: "payment",

        line_items: lineItems,

        success_url:
          `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${process.env.CLIENT_URL}/cart`,

        metadata: {

          userId:
            String(req.user.id),

          orderId:
            String(orderId),

        },

      });


    // ==================================================
    // SAVE STRIPE SESSION ID
    // ==================================================

    await client.query(
      `
      UPDATE orders
      SET stripe_session_id = $1
      WHERE id = $2
      `,
      [
        session.id,
        orderId,
      ]
    );


    // ==================================================
    // COMMIT DATABASE TRANSACTION
    // ==================================================

    await client.query("COMMIT");


    // ==================================================
    // SEND STRIPE URL
    // ==================================================

    res.json({
      url: session.url,
    });


  } catch (error) {

    // ==================================================
    // ROLLBACK IF SOMETHING FAILED
    // ==================================================

    await client.query("ROLLBACK");

    console.error(
      "Stripe Checkout Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create Stripe checkout session",
    });

  } finally {

    client.release();

  }
};

// ======================================================
// VERIFY STRIPE CHECKOUT SESSION
// ======================================================

// const verifyCheckoutSession = async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     // Get Stripe session
//     const session =
//       await stripe.checkout.sessions.retrieve(sessionId);

//     // Make sure this session belongs to logged-in user
//     if (
//       session.metadata?.userId !==
//       String(req.user.id)
//     ) {
//       return res.status(403).json({
//         message: "Unauthorized payment session",
//       });
//     }

//     // Check payment status
//     if (session.payment_status !== "paid") {
//       return res.status(400).json({
//         message: "Payment has not been completed",
//       });
//     }

//     const orderId = session.metadata.orderId;

//     // Update order
//     // const result = await pool.query(
//     //   `
//     //   UPDATE orders
//     //   SET payment_status = $1
//     //   WHERE id = $2
//     //   RETURNING *
//     //   `,
//     //   [
//     //     "paid",
//     //     orderId,
//     //   ]
//     // );


//     const result = await pool.query(
//   `
//   UPDATE orders
//   SET payment_status = $1
//   WHERE id = $2
//   RETURNING *
//   `,
//   [
//     "paid",
//     orderId,
//   ]
// );

// if (result.rows.length === 0) {
//   return res.status(404).json({
//     message: "Order not found",
//   });
// }

// // Clear cart only AFTER successful payment verification
// await pool.query(
//   `
//   DELETE FROM cart
//   WHERE user_id = $1
//   `,
//   [req.user.id]
// );

// res.json({
//   message: "Payment verified successfully",
//   order: result.rows[0],
// });

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Order not found",
//       });
//     }

//     res.json({
//       message: "Payment verified successfully",
//       order: result.rows[0],
//     });

//   } catch (error) {
//     console.error(
//       "Stripe Verification Error:",
//       error
//     );

//     res.status(500).json({
//       message: "Failed to verify payment",
//     });
//   }
// };

const verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // ==================================================
    // GET STRIPE SESSION
    // ==================================================

    const session = await stripe.checkout.sessions.retrieve(
      sessionId
    );

    // ==================================================
    // CHECK SESSION USER
    // ==================================================

    if (
      session.metadata?.userId !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        message: "Unauthorized payment session",
      });
    }

    // ==================================================
    // CHECK PAYMENT STATUS
    // ==================================================

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        message: "Payment has not been completed",
      });
    }

    // ==================================================
    // GET ORDER ID
    // ==================================================

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID not found in payment session",
      });
    }

    // ==================================================
    // UPDATE ORDER
    // ==================================================

    const result = await pool.query(
      `
      UPDATE orders
      SET payment_status = $1
      WHERE id = $2
      RETURNING *
      `,
      [
        "paid",
        orderId,
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

    await pool.query(
      `DELETE FROM cart WHERE user_id = $1`,
      [req.user.id]
    );

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.json({
      message: "Payment verified successfully",
      order: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Stripe Verification Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to verify payment",
    });
  }
};

// ======================================================
// STRIPE WEBHOOK
// ======================================================
// ======================================================
// HANDLE STRIPE WEBHOOK
// ======================================================
const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    // Verify that the webhook really came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);

    return res.status(400).send(
      `Webhook Error: ${error.message}`
    );
  }

  try {
    // ==================================================
    // PAYMENT COMPLETED
    // ==================================================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.log("No orderId found in Stripe session metadata");
        return res.json({ received: true });
      }

      // Make sure Stripe says payment was successful
      if (session.payment_status === "paid") {
        await pool.query(
          `
          UPDATE orders
          SET payment_status = $1
          WHERE id = $2
          `,
          ["paid", orderId]
        );

        await pool.query(
          `
          DELETE FROM cart
          WHERE user_id = $1
          `,
          [session.metadata?.userId]
        );

        console.log(
          `✅ Order ${orderId} payment marked as paid`
        );
      }
    }

    // ==================================================
    // PAYMENT FAILED
    // ==================================================
    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;

      const orderId = session.metadata?.orderId;

      if (orderId) {
        await pool.query(
          `
          UPDATE orders
          SET payment_status = $1
          WHERE id = $2
          `,
          ["failed", orderId]
        );

        console.log(
          `❌ Order ${orderId} payment marked as failed`
        );
      }
    }

    // ==================================================
    // RESPONSE TO STRIPE
    // ==================================================
    res.json({
      received: true,
    });

  } catch (error) {
    console.error(
      "Stripe Webhook Processing Error:",
      error
    );

    res.status(500).json({
      message: "Webhook processing failed",
    });
  }
};

module.exports = {
  createCheckoutSession,
  verifyCheckoutSession,
  handleStripeWebhook,
};