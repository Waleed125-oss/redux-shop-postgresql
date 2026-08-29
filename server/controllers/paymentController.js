const stripe = require("../config/stripe");
const pool = require("../config/db");

// ======================================================
// PLATFORM COMMISSION
// ======================================================

const COMMISSION_PERCENTAGE = 10;


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
        products.image,
        products.seller_id
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
        payment_status,
        commission_amount,
        platform_amount,
        seller_amount,
        transfer_status
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        req.user.id,
        totalAmount,
        "Pending",
        "pending",
        0,
        0,
        0,
        "pending",
      ]
    );


    const orderId =
      order.rows[0].id;


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
            productId: String(
              item.product_id
            ),

            // NULL means admin-owned product
            sellerId: item.seller_id
              ? String(item.seller_id)
              : "admin",
          },
        },

        unit_amount: Math.round(
          Number(item.price) * 100
        ),
      },

      quantity: item.quantity,
    }));


    // ==================================================
    // CREATE STRIPE CHECKOUT SESSION
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
          userId: String(req.user.id),
          orderId: String(orderId),
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
    // COMMIT
    // ==================================================

    await client.query("COMMIT");


    // ==================================================
    // SEND CHECKOUT URL
    // ==================================================

    return res.json({
      url: session.url,
    });

  } catch (error) {

    // ==================================================
    // ROLLBACK
    // ==================================================

    await client.query("ROLLBACK");

    console.error(
      "Stripe Checkout Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create Stripe checkout session",
    });

  } finally {

    client.release();
  }
};



// ======================================================
// VERIFY CHECKOUT SESSION
// ======================================================

const verifyCheckoutSession = async (
  req,
  res
) => {

  try {

    const { sessionId } =
      req.params;


    // ==================================================
    // GET STRIPE SESSION
    // ==================================================

    const session =
      await stripe.checkout.sessions.retrieve(
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
        message:
          "Unauthorized payment session",
      });
    }


    // ==================================================
    // CHECK PAYMENT STATUS
    // ==================================================

    if (
      session.payment_status !==
      "paid"
    ) {

      return res.status(400).json({
        message:
          "Payment has not been completed",
      });
    }


    // ==================================================
    // GET ORDER ID
    // ==================================================

    const orderId =
      session.metadata?.orderId;


    if (!orderId) {

      return res.status(400).json({
        message:
          "Order ID not found in payment session",
      });
    }


    // ==================================================
    // UPDATE ORDER
    // ==================================================

    const result =
      await pool.query(
        `
        UPDATE orders
        SET
          payment_status = 'paid',
          status = 'Processing'
        WHERE id = $1
        RETURNING *
        `,
        [orderId]
      );


    // ==================================================
    // ORDER NOT FOUND
    // ==================================================

    if (
      result.rows.length === 0
    ) {

      return res.status(404).json({
        message:
          "Order not found",
      });
    }


    // ==================================================
    // CLEAR CUSTOMER CART
    // ==================================================

    await pool.query(
      `
      DELETE FROM cart
      WHERE user_id = $1
      `,
      [req.user.id]
    );


    // ==================================================
    // SUCCESS
    // ==================================================

    return res.json({

      message:
        "Payment verified successfully",

      order:
        result.rows[0],
    });


  } catch (error) {

    console.error(
      "Stripe Verification Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to verify payment",
    });
  }
};



// ======================================================
// HANDLE STRIPE WEBHOOK
// ======================================================

const handleStripeWebhook = async (
  req,
  res
) => {

  const signature =
    req.headers["stripe-signature"];


  let event;


  // ======================================================
  // VERIFY STRIPE WEBHOOK
  // ======================================================

  try {

    event =
      stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

  } catch (error) {

    console.error(
      "❌ Webhook signature verification failed:",
      error.message
    );

    return res.status(400).send(
      `Webhook Error: ${error.message}`
    );
  }


  // ======================================================
  // ONLY PROCESS RELEVANT EVENTS
  // ======================================================

  if (
    event.type !==
      "checkout.session.completed" &&

    event.type !==
      "checkout.session.async_payment_failed" &&

    event.type !==
      "checkout.session.expired"
  ) {

    return res.json({
      received: true,
    });
  }


  let orderId;


  try {

    // ====================================================
    // PAYMENT COMPLETED
    // ====================================================

    if (
      event.type ===
      "checkout.session.completed"
    ) {

      const session =
        event.data.object;


      orderId =
        session.metadata?.orderId;


      const userId =
        session.metadata?.userId;


      console.log(
        "======================================"
      );

      console.log(
        "🔥 STRIPE CHECKOUT COMPLETED"
      );

      console.log(
        "Session:",
        session.id
      );

      console.log(
        "Order:",
        orderId
      );

      console.log(
        "User:",
        userId
      );

      console.log(
        "Payment status:",
        session.payment_status
      );

      console.log(
        "======================================"
      );


      // ==================================================
      // CHECK METADATA
      // ==================================================

      if (
        !orderId ||
        !userId
      ) {

        console.log(
          "❌ Missing orderId or userId"
        );

        return res.json({
          received: true,
        });
      }


      // ==================================================
      // CHECK PAYMENT STATUS
      // ==================================================

      if (
        session.payment_status !==
        "paid"
      ) {

        console.log(
          `⚠️ Order ${orderId} is not paid`
        );

        return res.json({
          received: true,
        });
      }


      // ==================================================
      // 1. GET ORDER
      // ==================================================

      const orderResult =
        await pool.query(
          `
          SELECT
            id,
            user_id,
            total_amount,
            payment_status,
            stripe_transfer_id,
            transfer_status,
            commission_amount,
            platform_amount,
            seller_amount
          FROM orders
          WHERE id = $1
          FOR UPDATE
          `,
          [orderId]
        );


      // ==================================================
      // ORDER NOT FOUND
      // ==================================================

      if (
        orderResult.rows.length === 0
      ) {

        console.log(
          `❌ Order ${orderId} not found`
        );

        return res.json({
          received: true,
        });
      }


      const order =
        orderResult.rows[0];


      // ==================================================
      // 2. MARK PAYMENT AS PAID
      // ==================================================

      await pool.query(
        `
        UPDATE orders
        SET
          payment_status = 'paid',
          status = 'Processing'
        WHERE id = $1
        `,
        [orderId]
      );


      console.log(
        `✅ Order ${orderId} marked as paid`
      );


      // ==================================================
      // 3. CHECK WHETHER SELLER TRANSFERS
      //    ALREADY EXIST
      // ==================================================

      const existingTransfers =
        await pool.query(
          `
          SELECT
            id,
            seller_id,
            stripe_transfer_id,
            transfer_status
          FROM order_transfers
          WHERE order_id = $1
          `,
          [orderId]
        );


      // ==================================================
      // IF TRANSFERS ALREADY EXIST
      // DON'T CREATE DUPLICATES
      // ==================================================

      if (
        existingTransfers.rows.some(
          (transfer) =>
            transfer.stripe_transfer_id
        )
      ) {

        console.log(
          `⚠️ Order ${orderId} already has seller transfers`
        );

        return res.json({
          received: true,
        });
      }


      // ==================================================
      // 4. GET ORDER ITEMS
      //
      // IMPORTANT:
      //
      // LEFT JOIN users is required because
      // admin products have seller_id = NULL.
      // ==================================================

      const itemsResult =
        await pool.query(
          `
          SELECT
            oi.product_id,
            oi.quantity,
            oi.price,

            p.seller_id,

            u.stripe_account_id

          FROM order_items oi

          JOIN products p
            ON oi.product_id = p.id

          LEFT JOIN users u
            ON p.seller_id = u.id

          WHERE oi.order_id = $1
          `,
          [orderId]
        );


      // ==================================================
      // NO ITEMS
      // ==================================================

      if (
        itemsResult.rows.length === 0
      ) {

        await pool.query(
          `
          UPDATE orders
          SET transfer_status = 'failed'
          WHERE id = $1
          `,
          [orderId]
        );

        console.log(
          `❌ No order items found for order ${orderId}`
        );

        return res.json({
          received: true,
        });
      }


      // ==================================================
      // 5. CALCULATE ADMIN + SELLER AMOUNTS
      // ==================================================

      let adminAmount = 0;


      const sellerAmounts = {};


      for (
        const item
        of itemsResult.rows
      ) {

        const amount =
          Number(item.price) *
          Number(item.quantity);


        // =================================================
        // ADMIN PRODUCT
        //
        // seller_id = NULL
        // =================================================

        if (
          !item.seller_id //true
        ) {

          adminAmount +=
            amount;


          console.log(
            `🏦 Admin product ${item.product_id}: $${amount.toFixed(2)}`
          );


          continue;
        }


        // =================================================
        // SELLER PRODUCT
        // =================================================

        const sellerId =
          String(item.seller_id);


        if (
          !sellerAmounts[sellerId]
        ) {

          sellerAmounts[sellerId] = {

            grossAmount: 0,

            stripeAccountId:
              item.stripe_account_id,

            commissionAmount: 0,

            sellerAmount: 0,
          };
        }


        sellerAmounts[
          sellerId
        ].grossAmount +=
          amount;
      }


      // ==================================================
      // 6. CALCULATE COMMISSION FOR EVERY SELLER
      // ==================================================

      let totalCommission = 0;

      let totalSellerPayout = 0;


      for (
        const sellerId
        of Object.keys(
          sellerAmounts
        )
      ) {

        const seller =
          sellerAmounts[
            sellerId
          ];


        const grossAmount =
          Number(
            seller.grossAmount
          );


        // =================================================
        // COMMISSION
        // =================================================

        const commissionAmount =
          Number(
            (
              grossAmount *
              (
                COMMISSION_PERCENTAGE /
                100
              )
            ).toFixed(2)
          );


        // =================================================
        // SELLER PAYOUT
        // =================================================

        const sellerAmount =
          Number(
            (
              grossAmount -
              commissionAmount
            ).toFixed(2)
          );


        seller.commissionAmount =
          commissionAmount;


        seller.sellerAmount =
          sellerAmount;


        totalCommission +=
          commissionAmount;


        totalSellerPayout +=
          sellerAmount;


        console.log(
          "--------------------------------------"
        );

        console.log(
          `👤 Seller ${sellerId}`
        );

        console.log(
          `Gross amount: $${grossAmount.toFixed(2)}`
        );

        console.log(
          `Commission: $${commissionAmount.toFixed(2)}`
        );

        console.log(
          `Seller payout: $${sellerAmount.toFixed(2)}`
        );

        console.log(
          "--------------------------------------"
        );
      }


      // ==================================================
      // 7. PLATFORM AMOUNT
      //
      // Admin products remain on platform.
      //
      // Platform also keeps seller commissions.
      // ==================================================

      const platformAmount =
        Number(
          (
            adminAmount +
            totalCommission
          ).toFixed(2)
        );


      // ==================================================
      // PAYMENT BREAKDOWN
      // ==================================================

      console.log(
        "======================================"
      );

      console.log(
        "💰 FINAL PAYMENT BREAKDOWN"
      );

      console.log(
        `Order total: $${Number(
          order.total_amount
        ).toFixed(2)}`
      );

      console.log(
        `Admin products: $${adminAmount.toFixed(2)}`
      );

      console.log(
        `Total commission: $${totalCommission.toFixed(2)}`
      );

      console.log(
        `Platform amount: $${platformAmount.toFixed(2)}`
      );

      console.log(
        `Seller payouts: $${totalSellerPayout.toFixed(2)}`
      );

      console.log(
        "======================================"
      );


      // ==================================================
      // 8. SAVE ORDER FINANCIAL SUMMARY
      // ==================================================

      await pool.query(
        `
        UPDATE orders
        SET
          commission_amount = $1,
          platform_amount = $2,
          seller_amount = $3
        WHERE id = $4
        `,
        [
          totalCommission.toFixed(2),
          platformAmount.toFixed(2),
          totalSellerPayout.toFixed(2),
          orderId,
        ]
      );


      // ==================================================
      // 9. CREATE TRANSFER RECORDS + STRIPE TRANSFERS
      // ==================================================

      for (
        const sellerId
        of Object.keys(
          sellerAmounts
        )
      ) {

        const seller =
          sellerAmounts[
            sellerId
          ];


        const grossAmount =
          Number(
            seller.grossAmount
          );


        const commissionAmount =
          Number(
            seller.commissionAmount
          );


        const sellerAmount =
          Number(
            seller.sellerAmount
          );


        // =================================================
        // SELLER HAS NO CONNECTED ACCOUNT
        // =================================================

        if (
          !seller.stripeAccountId
        ) {

          console.log(
            `⚠️ Seller ${sellerId} has no Stripe connected account`
          );


          await pool.query(
            `
            INSERT INTO order_transfers
            (
              order_id,
              seller_id,
              stripe_account_id,
              gross_amount,
              commission_amount,
              seller_amount,
              transfer_status
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)

            ON CONFLICT (order_id, seller_id)
            DO UPDATE SET

              transfer_status =
                EXCLUDED.transfer_status,

              updated_at =
                CURRENT_TIMESTAMP
            `,
            [
              orderId,
              sellerId,
              "not_connected",
              grossAmount,
              commissionAmount,
              sellerAmount,
              "seller_not_connected",
            ]
          );


          continue;
        }


        // =================================================
        // CONVERT TO STRIPE CENTS
        // =================================================

        const transferAmount =
          Math.round(
            sellerAmount * 100
          );


        // =================================================
        // INVALID AMOUNT
        // =================================================

        if (
          transferAmount <= 0
        ) {

          await pool.query(
            `
            INSERT INTO order_transfers
            (
              order_id,
              seller_id,
              stripe_account_id,
              gross_amount,
              commission_amount,
              seller_amount,
              transfer_status
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7)

            ON CONFLICT (order_id, seller_id)
            DO UPDATE SET

              transfer_status =
                EXCLUDED.transfer_status,

              updated_at =
                CURRENT_TIMESTAMP
            `,
            [
              orderId,
              sellerId,
              seller.stripeAccountId,
              grossAmount,
              commissionAmount,
              sellerAmount,
              "invalid_amount",
            ]
          );


          continue;
        }


        // =================================================
        // CHECK EXISTING SELLER TRANSFER RECORD
        // =================================================

        const transferRecord =
          await pool.query(
            `
            SELECT
              id,
              stripe_transfer_id,
              transfer_status
            FROM order_transfers
            WHERE order_id = $1
            AND seller_id = $2
            `,
            [
              orderId,
              sellerId,
            ]
          );


        // =================================================
        // TRANSFER ALREADY CREATED
        // =================================================

        if (
          transferRecord.rows.length > 0 &&
          transferRecord.rows[0]
            .stripe_transfer_id
        ) {

          console.log(
            `⚠️ Transfer already exists for seller ${sellerId}`
          );

          continue;
        }


        // =================================================
        // CREATE / UPDATE TRANSFER RECORD
        // =================================================

        await pool.query(
          `
          INSERT INTO order_transfers
          (
            order_id,
            seller_id,
            stripe_account_id,
            gross_amount,
            commission_amount,
            seller_amount,
            transfer_status
          )
          VALUES
          ($1,$2,$3,$4,$5,$6,$7)

          ON CONFLICT (order_id, seller_id)
          DO UPDATE SET

            stripe_account_id =
              EXCLUDED.stripe_account_id,

            gross_amount =
              EXCLUDED.gross_amount,

            commission_amount =
              EXCLUDED.commission_amount,

            seller_amount =
              EXCLUDED.seller_amount,

            transfer_status =
              'pending',

            updated_at =
              CURRENT_TIMESTAMP
          `,
          [
            orderId,
            sellerId,
            seller.stripeAccountId,
            grossAmount,
            commissionAmount,
            sellerAmount,
            "pending",
          ]
        );


        // =================================================
        // CREATE STRIPE TRANSFER
        // =================================================

        try {

          console.log(
            "======================================"
          );

          console.log(
            `🚀 CREATING TRANSFER`
          );

          console.log(
            `Order: ${orderId}`
          );

          console.log(
            `Seller: ${sellerId}`
          );

          console.log(
            `Stripe account: ${seller.stripeAccountId}`
          );

          console.log(
            `Gross: $${grossAmount.toFixed(2)}`
          );

          console.log(
            `Commission: $${commissionAmount.toFixed(2)}`
          );

          console.log(
            `Seller payout: $${sellerAmount.toFixed(2)}`
          );

          console.log(
            "======================================"
          );


          // =================================================
          // STRIPE TRANSFER
          // =================================================

          const transfer =
            await stripe.transfers.create(

              {
                amount:
                  transferAmount,

                currency:
                  "usd",

                destination:
                  seller.stripeAccountId,

                metadata: {

                  orderId:
                    String(orderId),

                  sellerId:
                    String(sellerId),

                  grossAmount:
                    grossAmount.toFixed(2),

                  commissionAmount:
                    commissionAmount.toFixed(2),

                  sellerAmount:
                    sellerAmount.toFixed(2),
                },
              },

              {
                // =================================================
                // IMPORTANT
                //
                // Stripe will not create another transfer if the
                // same webhook is processed again.
                // =================================================

                idempotencyKey:
                  `order-${orderId}-seller-${sellerId}`,
              }
            );


          // =================================================
          // SAVE TRANSFER ID
          // =================================================

          await pool.query(
            `
            UPDATE order_transfers
            SET
              stripe_transfer_id = $1,
              transfer_status = $2,
              updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $3
            AND seller_id = $4
            `,
            [
              transfer.id,
              "completed",
              orderId,
              sellerId,
            ]
          );


          console.log(
            `✅ Transfer ${transfer.id} created`
          );

          console.log(
            `👤 Seller ${sellerId} received $${sellerAmount.toFixed(2)}`
          );


        } catch (transferError) {

          console.error(
            `❌ Transfer failed for seller ${sellerId}:`,
            transferError.message
          );


          // =================================================
          // SAVE FAILED STATUS
          // =================================================

          await pool.query(
            `
            UPDATE order_transfers
            SET
              transfer_status = $1,
              updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $2
            AND seller_id = $3
            `,
            [
              "failed",
              orderId,
              sellerId,
            ]
          );
        }
      }


      // ==================================================
      // 10. GET FINAL TRANSFER SUMMARY
      // ==================================================

      const transferSummary =
        await pool.query(
          `
          SELECT

            COUNT(*) FILTER (
              WHERE transfer_status = 'completed'
            ) AS completed,

            COUNT(*) FILTER (
              WHERE transfer_status = 'failed'
            ) AS failed,

            COUNT(*) FILTER (
              WHERE transfer_status = 'pending'
            ) AS pending,

            COUNT(*) FILTER (
              WHERE transfer_status = 'seller_not_connected'
            ) AS seller_not_connected,

            COUNT(*) AS total

          FROM order_transfers

          WHERE order_id = $1
          `,
          [orderId]
        );


      const summary =
        transferSummary.rows[0];


      console.log(
        "======================================"
      );

      console.log(
        "📊 TRANSFER SUMMARY"
      );

      console.log(
        summary
      );

      console.log(
        "======================================"
      );


      // ==================================================
      // 11. UPDATE ORDER TRANSFER STATUS
      // ==================================================

      if (
        Number(summary.failed) > 0
      ) {

        await pool.query(
          `
          UPDATE orders
          SET transfer_status = 'partial'
          WHERE id = $1
          `,
          [orderId]
        );


        console.log(
          `⚠️ Order ${orderId} has failed seller transfers`
        );

      } else if (
        Number(summary.seller_not_connected) > 0
      ) {

        await pool.query(
          `
          UPDATE orders
          SET transfer_status = 'partial'
          WHERE id = $1
          `,
          [orderId]
        );


        console.log(
          `⚠️ Order ${orderId} has seller(s) without connected accounts`
        );

      } else if (
        Number(summary.pending) > 0
      ) {

        await pool.query(
          `
          UPDATE orders
          SET transfer_status = 'pending'
          WHERE id = $1
          `,
          [orderId]
        );

      } else if (
        Number(summary.completed) > 0
      ) {

        await pool.query(
          `
          UPDATE orders
          SET transfer_status = 'completed'
          WHERE id = $1
          `,
          [orderId]
        );


        console.log(
          `✅ All seller transfers completed for order ${orderId}`
        );

      } else {

        // =================================================
        // ONLY ADMIN PRODUCTS
        // =================================================

        await pool.query(
          `
          UPDATE orders
          SET transfer_status = 'not_required'
          WHERE id = $1
          `,
          [orderId]
        );


        console.log(
          `🏦 Order ${orderId} contains only admin products`
        );
      }


      // ==================================================
      // 12. CLEAR CART
      // ==================================================

      await pool.query(
        `
        DELETE FROM cart
        WHERE user_id = $1
        `,
        [userId]
      );


      console.log(
        `🛒 Cart cleared for user ${userId}`
      );


      console.log(
        "======================================"
      );

      console.log(
        `✅ WEBHOOK COMPLETED FOR ORDER ${orderId}`
      );

      console.log(
        "======================================"
      );
    }


    // ====================================================
    // PAYMENT FAILED
    // ====================================================

    if (
      event.type ===
      "checkout.session.async_payment_failed"
    ) {

      const session =
        event.data.object;


      const failedOrderId =
        session.metadata?.orderId;


      if (
        failedOrderId
      ) {

        await pool.query(
          `
          UPDATE orders
          SET payment_status = 'failed'
          WHERE id = $1
          `,
          [failedOrderId]
        );


        console.log(
          `❌ Order ${failedOrderId} payment failed`
        );
      }
    }


    // ====================================================
    // CHECKOUT EXPIRED
    // ====================================================

    if (
      event.type ===
      "checkout.session.expired"
    ) {

      const session =
        event.data.object;


      const expiredOrderId =
        session.metadata?.orderId;


      if (
        expiredOrderId
      ) {

        await pool.query(
          `
          UPDATE orders
          SET payment_status = 'failed'
          WHERE id = $1
          AND payment_status = 'pending'
          `,
          [expiredOrderId]
        );


        console.log(
          `⌛ Checkout session expired for order ${expiredOrderId}`
        );
      }
    }


    // ====================================================
    // STRIPE RESPONSE
    // ====================================================

    return res.json({
      received: true,
    });


  } catch (error) {

    // ====================================================
    // UPDATE ORDER STATUS
    // ====================================================

    if (
      typeof orderId !==
      "undefined"
    ) {

      try {

        await pool.query(
          `
          UPDATE orders
          SET transfer_status = 'failed'
          WHERE id = $1
          AND transfer_status = 'pending'
          `,
          [orderId]
        );

      } catch (statusError) {

        console.error(
          "❌ Failed to update transfer status:",
          statusError
        );
      }
    }


    // ====================================================
    // LOG ERROR
    // ====================================================

    console.error(
      `❌ Stripe Webhook Processing Error for order ${
        typeof orderId !== "undefined"
          ? orderId
          : "unknown"
      }:`,
      error
    );


    return res.status(500).json({
      message:
        "Webhook processing failed",
    });
  }
};



// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  createCheckoutSession,
  verifyCheckoutSession,
  handleStripeWebhook,
};