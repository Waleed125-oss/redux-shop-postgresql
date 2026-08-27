
const pool = require("../config/db");
const stripe = require("../config/stripe");
// ======================================================
// CUSTOMER REQUEST REFUND
// ======================================================
const requestRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // ==================================================
    // STEP 1: VALIDATE REASON
    // ==================================================
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        message: "Refund reason is required",
      });
    }

    // ==================================================
    // STEP 2: GET ORDER
    // ==================================================
    const orderResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
      AND user_id = $2
      `,
      [orderId, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    // ==================================================
    // STEP 3: CHECK PAYMENT
    // ==================================================
    if (order.payment_status !== "paid") {
      return res.status(400).json({
        message: "Only paid orders can be refunded",
      });
    }

    // ==================================================
    // STEP 4: CHECK EXISTING REFUND REQUEST
    // ==================================================
    const existingRefund = await pool.query(
      `
      SELECT *
      FROM refund_requests
      WHERE order_id = $1
      AND user_id = $2
      `,
      [orderId, req.user.id]
    );

    if (existingRefund.rows.length > 0) {
      return res.status(400).json({
        message: "A refund request already exists for this order",
      });
    }

    // ==================================================
    // STEP 5: GET PRODUCTS FROM THIS ORDER
    // ==================================================
    const productsResult = await pool.query(
      `
      SELECT
        oi.product_id,
        p.title,
        p.seller_id
      FROM order_items oi
      JOIN products p
        ON oi.product_id = p.id
      WHERE oi.order_id = $1
      `,
      [orderId]
    );

    if (productsResult.rows.length === 0) {
      return res.status(400).json({
        message: "No products found for this order",
      });
    }

    // ==================================================
    // STEP 6: DETERMINE WHO APPROVES REFUND
    // ==================================================

    const products = productsResult.rows;

    // Check if any product belongs to admin
    const hasAdminProduct = products.some(
      (product) => product.seller_id === null
    );

    // Get seller IDs from seller-owned products
    const sellerIds = [
      ...new Set(
        products
          .filter((product) => product.seller_id !== null)
          .map((product) => Number(product.seller_id))
      ),
    ];

    let approverType;
    let approverId = null;

    // ----------------------------------------------
    // ADMIN PRODUCT EXISTS
    // ----------------------------------------------
    if (hasAdminProduct) {
      approverType = "admin";
    }

    // ----------------------------------------------
    // PRODUCTS BELONG TO ONE SELLER
    // ----------------------------------------------
    else if (sellerIds.length === 1) {
      approverType = "seller";
      approverId = sellerIds[0];
    }

    // ----------------------------------------------
    // MULTIPLE SELLERS
    // ----------------------------------------------
    else {
      approverType = "admin";
    }

    // ==================================================
    // STEP 7: CREATE REFUND REQUEST
    // ==================================================
    const refund = await pool.query(
      `
      INSERT INTO refund_requests
      (
        order_id,
        user_id,
        reason,
        status,
        approver_type,
        approver_id
      )
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        orderId,
        req.user.id,
        reason.trim(),
        "pending",
        approverType,
        approverId,
      ]
    );

    // ==================================================
    // STEP 8: RESPONSE
    // ==================================================
    res.status(201).json({
      message: "Refund request submitted successfully",
      refund: refund.rows[0],
    });

  } catch (error) {
    console.error("Refund Request Error:", error);

    res.status(500).json({
      message: "Failed to submit refund request",
    });
  }
};




// ======================================================
// ADMIN APPROVE REFUND
// ======================================================
const approveRefundByAdmin = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { refundId } = req.params;

    // ==================================================
    // STEP 1: GET REFUND REQUEST
    // ==================================================
    const refundResult = await client.query(
      `
      SELECT
        rr.*,
        o.stripe_session_id,
        o.payment_status
      FROM refund_requests rr
      JOIN orders o
        ON rr.order_id = o.id
      WHERE rr.id = $1
      FOR UPDATE
      `,
      [refundId]
    );

    if (refundResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Refund request not found",
      });
    }

    const refundRequest = refundResult.rows[0];

    // ==================================================
    // STEP 2: MAKE SURE ADMIN IS THE APPROVER
    // ==================================================
    if (refundRequest.approver_type !== "admin") {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "This refund must be approved by the admin",
      });
    }

    // ==================================================
    // STEP 3: CHECK REFUND STATUS
    // ==================================================
    if (refundRequest.status !== "pending") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "This refund request has already been processed",
      });
    }

    // ==================================================
    // STEP 4: CHECK PAYMENT STATUS
    // ==================================================
    if (refundRequest.payment_status !== "paid") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Order payment has not been completed",
      });
    }

    // ==================================================
    // STEP 5: GET STRIPE CHECKOUT SESSION
    // ==================================================
    const session = await stripe.checkout.sessions.retrieve(
      refundRequest.stripe_session_id
    );

    // ==================================================
    // STEP 6: GET PAYMENT INTENT
    // ==================================================
    if (!session.payment_intent) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Stripe payment intent not found",
      });
    }

    // ==================================================
    // STEP 7: CREATE STRIPE REFUND
    // ==================================================
    const stripeRefund = await stripe.refunds.create({
      payment_intent: session.payment_intent,
    });

    // ==================================================
    // STEP 8: UPDATE REFUND REQUEST
    // ==================================================
    const updatedRefund = await client.query(
      `
      UPDATE refund_requests
      SET
        status = $1,
        approver_id = $2,
        approved_at = NOW(),
        stripe_refund_id = $3
      WHERE id = $4
      RETURNING *
      `,
      [
        "approved",
        req.user.id,
        stripeRefund.id,
        refundId,
      ]
    );

    // ==================================================
    // STEP 9: UPDATE ORDER PAYMENT STATUS
    // ==================================================
    await client.query(
      `
      UPDATE orders
      SET payment_status = $1
      WHERE id = $2
      `,
      [
        "refunded",
        refundRequest.order_id,
      ]
    );

    await client.query("COMMIT");

    res.json({
      message: "Refund approved and Stripe refund created successfully",
      refund: updatedRefund.rows[0],
      stripeRefundId: stripeRefund.id,
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Admin Refund Approval Error:", error);

    res.status(500).json({
      message: "Failed to approve refund",
    });
  } finally {
    client.release();
  }
};


// ======================================================
// SELLER APPROVE REFUND
// ======================================================
const approveRefundBySeller = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { refundId } = req.params;

    // ==================================================
    // STEP 1: GET REFUND REQUEST
    // ==================================================
    const refundResult = await client.query(
      `
      SELECT
        rr.*,
        o.stripe_session_id,
        o.payment_status
      FROM refund_requests rr
      JOIN orders o
        ON rr.order_id = o.id
      WHERE rr.id = $1
      FOR UPDATE
      `,
      [refundId]
    );

    if (refundResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Refund request not found",
      });
    }

    const refundRequest = refundResult.rows[0];

    // ==================================================
    // STEP 2: MAKE SURE SELLER IS THE APPROVER
    // ==================================================
    if (refundRequest.approver_type !== "seller") {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "This refund must be approved by the admin",
      });
    }

    // ==================================================
    // STEP 3: CHECK SELLER AUTHORIZATION
    // ==================================================
    if (
      req.user.role !== "seller" ||
      Number(req.user.id) !== Number(refundRequest.approver_id)
    ) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "You are not authorized to approve this refund",
      });
    }

    // ==================================================
    // STEP 4: CHECK REFUND STATUS
    // ==================================================
    if (refundRequest.status !== "pending") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "This refund request has already been processed",
      });
    }

    // ==================================================
    // STEP 5: CHECK PAYMENT STATUS
    // ==================================================
    if (refundRequest.payment_status !== "paid") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Order payment has not been completed",
      });
    }

    // ==================================================
    // STEP 6: CHECK STRIPE SESSION
    // ==================================================
    if (!refundRequest.stripe_session_id) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Stripe checkout session not found",
      });
    }

    // ==================================================
    // STEP 7: GET STRIPE CHECKOUT SESSION
    // ==================================================
    const session = await stripe.checkout.sessions.retrieve(
      refundRequest.stripe_session_id
    );

    // ==================================================
    // STEP 8: GET PAYMENT INTENT
    // ==================================================
    if (!session.payment_intent) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Stripe payment intent not found",
      });
    }

    // ==================================================
    // STEP 9: CREATE STRIPE REFUND
    // ==================================================
    const stripeRefund = await stripe.refunds.create({
      payment_intent: session.payment_intent,
    });

    // ==================================================
    // STEP 10: UPDATE REFUND REQUEST
    // ==================================================
    const updatedRefund = await client.query(
      `
      UPDATE refund_requests
      SET
        status = $1,
        approver_id = $2,
        approved_at = NOW(),
        stripe_refund_id = $3
      WHERE id = $4
      RETURNING *
      `,
      [
        "approved",
        req.user.id,
        stripeRefund.id,
        refundId,
      ]
    );

    // ==================================================
    // STEP 11: UPDATE ORDER PAYMENT STATUS
    // ==================================================
    await client.query(
      `
      UPDATE orders
      SET payment_status = $1
      WHERE id = $2
      `,
      [
        "refunded",
        refundRequest.order_id,
      ]
    );

    // ==================================================
    // STEP 12: COMMIT
    // ==================================================
    await client.query("COMMIT");

    // ==================================================
    // STEP 13: RESPONSE
    // ==================================================
    res.json({
      message: "Refund approved and Stripe refund created successfully",
      refund: updatedRefund.rows[0],
      stripeRefund: {
        id: stripeRefund.id,
        status: stripeRefund.status,
        amount: stripeRefund.amount,
        currency: stripeRefund.currency,
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Seller Refund Approval Error:", error);

    res.status(500).json({
      message: "Failed to approve refund",
    });

  } finally {
    client.release();
  }
};



// GET ADMIN REFUND REQUESTS
// ======================================================
const getAdminRefundRequests = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        rr.id,
        rr.order_id,
        rr.user_id,
        rr.reason,
        rr.status,
        rr.approver_type,
        rr.approver_id,
        rr.stripe_refund_id,
        rr.created_at,
        rr.approved_at,

        o.total_amount,
        o.payment_status,

        u.name AS customer_name,
        u.email AS customer_email,

        COALESCE(
          STRING_AGG(DISTINCT p.title, ', '),
          'Unknown Product'
        ) AS products

      FROM refund_requests rr

      JOIN orders o
        ON rr.order_id = o.id

      JOIN users u
        ON rr.user_id = u.id

      LEFT JOIN order_items oi
        ON oi.order_id = o.id

      LEFT JOIN products p
        ON p.id = oi.product_id

      WHERE rr.approver_type = 'admin'

      GROUP BY
        rr.id,
        o.id,
        u.id

      ORDER BY rr.created_at DESC
    `);

    res.json({
      refundRequests: result.rows,
    });
  } catch (error) {
    console.error("Get Admin Refund Requests Error:", error);

    res.status(500).json({
      message: "Failed to fetch admin refund requests",
    });
  }
};


// ======================================================
// GET SELLER REFUND REQUESTS
// ======================================================
const getSellerRefundRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        rr.id,
        rr.order_id,
        rr.user_id,
        rr.reason,
        rr.status,
        rr.approver_type,
        rr.approver_id,
        rr.stripe_refund_id,
        rr.created_at,
        rr.approved_at,

        o.total_amount,
        o.payment_status,

        u.name AS customer_name,
        u.email AS customer_email,

        COALESCE(
          STRING_AGG(DISTINCT p.title, ', '),
          'Unknown Product'
        ) AS products

      FROM refund_requests rr

      JOIN orders o
        ON rr.order_id = o.id

      JOIN users u
        ON rr.user_id = u.id

      LEFT JOIN order_items oi
        ON oi.order_id = o.id

      LEFT JOIN products p
        ON p.id = oi.product_id

      WHERE rr.approver_type = 'seller'
        AND rr.approver_id = $1

      GROUP BY
        rr.id,
        o.id,
        u.id

      ORDER BY rr.created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      refundRequests: result.rows,
    });
  } catch (error) {
    console.error("Get Seller Refund Requests Error:", error);

    res.status(500).json({
      message: "Failed to fetch seller refund requests",
    });
  }
};

// GET CUSTOMER REFUND REQUESTS
const getCustomerRefundRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        rr.id,
        rr.order_id,
        rr.reason,
        rr.status,
        rr.stripe_refund_id,
        rr.created_at,
        rr.approved_at,
        o.payment_status,
        o.total_amount
      FROM refund_requests rr
      JOIN orders o ON rr.order_id = o.id
      WHERE rr.user_id = $1
      ORDER BY rr.created_at DESC
      `,
      [req.user.id]
    );

    res.json({ refundRequests: result.rows });
  } catch (error) {
    console.error("Get Customer Refund Requests Error:", error);
    res.status(500).json({
      message: "Failed to fetch customer refund requests",
    });
  }
};


module.exports = {
  requestRefund,
  approveRefundByAdmin,
  approveRefundBySeller,
  getAdminRefundRequests,
  getSellerRefundRequests,
  getCustomerRefundRequests,
};
