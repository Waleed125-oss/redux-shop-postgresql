const stripe = require("../config/stripe");
const pool = require("../config/db");
const { calculateSellerBreakdown } = require("../config/commission");

const upsertTransfer = async ({
  orderId,
  sellerId,
  stripeAccountId,
  grossAmount,
  commissionAmount,
  sellerAmount,
  transferStatus,
}) => {
  await pool.query(
    `
    INSERT INTO order_transfers
      (order_id, seller_id, stripe_account_id, gross_amount, commission_amount,
       seller_amount, transfer_status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (order_id, seller_id)
    DO UPDATE SET
      stripe_account_id = EXCLUDED.stripe_account_id,
      gross_amount = EXCLUDED.gross_amount,
      commission_amount = EXCLUDED.commission_amount,
      seller_amount = EXCLUDED.seller_amount,
      transfer_status = EXCLUDED.transfer_status,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      orderId,
      sellerId,
      stripeAccountId || "not_connected",
      grossAmount.toFixed(2),
      commissionAmount.toFixed(2),
      sellerAmount.toFixed(2),
      transferStatus,
    ]
  );
};

const syncSellerStripeState = async (sellerId, account) => {
  const currentlyDue = account.requirements?.currently_due || [];
  const pastDue = account.requirements?.past_due || [];
  const active =
    Boolean(account.charges_enabled) &&
    Boolean(account.payouts_enabled) &&
    Boolean(account.details_submitted) &&
    currentlyDue.length === 0 &&
    pastDue.length === 0;

  // The live schema stores a descriptive status (not a boolean) alongside the
  // boolean onboarding flag. "connected" is the true/active state.
  await pool.query(
    `
    UPDATE users
    SET
      stripe_account_id = $1,
      stripe_account_status = $2,
      stripe_onboarding_complete = $3
    WHERE id = $4
    `,
    [account.id, active ? "connected" : "pending", active, sellerId]
  );

  return active;
};

// This is deliberately callable from both the customer verification endpoint
// and Stripe's webhook. Stripe's idempotency key plus the unique
// (order_id, seller_id) database record make repeat deliveries safe.
const processSellerTransfersForPaidOrder = async (orderId) => {
  const orderResult = await pool.query(
    `
    SELECT id, total_amount, payment_status
    FROM orders
    WHERE id = $1
    `,
    [orderId]
  );

  if (orderResult.rows.length === 0) {
    throw new Error(`Order ${orderId} was not found for transfer processing`);
  }

  const order = orderResult.rows[0];
  if (order.payment_status !== "paid") {
    throw new Error(`Cannot transfer funds for unpaid order ${orderId}`);
  }

  const itemsResult = await pool.query(
    `
    SELECT oi.product_id, oi.quantity, oi.price, p.seller_id, u.stripe_account_id
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    LEFT JOIN users u ON u.id = p.seller_id
    WHERE oi.order_id = $1
    `,
    [orderId]
  );

  if (itemsResult.rows.length === 0) {
    await pool.query(
      "UPDATE orders SET transfer_status = 'failed' WHERE id = $1",
      [orderId]
    );
    return { status: "failed", reason: "no_order_items" };
  }

  let adminAmount = 0;
  const sellers = new Map();

  for (const item of itemsResult.rows) {
    const amount = Number(item.price) * Number(item.quantity);

    if (!item.seller_id) {
      adminAmount += amount;
      continue;
    }

    const sellerId = Number(item.seller_id);
    const seller = sellers.get(sellerId) || {
      sellerId,
      stripeAccountId: item.stripe_account_id,
      grossAmount: 0,
    };
    seller.grossAmount += amount;
    sellers.set(sellerId, seller);
  }

  let totalCommission = 0;
  let totalSellerPayout = 0;
  for (const seller of sellers.values()) {
    const breakdown = calculateSellerBreakdown(seller.grossAmount);
    seller.grossAmount = breakdown.grossAmount;
    seller.commissionAmount = breakdown.commissionAmount;
    seller.sellerAmount = breakdown.sellerAmount;
    totalCommission += breakdown.commissionAmount;
    totalSellerPayout += breakdown.sellerAmount;
  }

  await pool.query(
    `
    UPDATE orders
    SET commission_amount = $1, platform_amount = $2, seller_amount = $3
    WHERE id = $4
    `,
    [
      totalCommission.toFixed(2),
      (adminAmount + totalCommission).toFixed(2),
      totalSellerPayout.toFixed(2),
      orderId,
    ]
  );

  for (const seller of sellers.values()) {
    const {
      sellerId,
      stripeAccountId,
      grossAmount,
      commissionAmount,
      sellerAmount,
    } = seller;

    const existingResult = await pool.query(
      `
      SELECT stripe_transfer_id
      FROM order_transfers
      WHERE order_id = $1 AND seller_id = $2
      `,
      [orderId, sellerId]
    );
    if (existingResult.rows[0]?.stripe_transfer_id) {
      continue;
    }

    let account;
    try {
      account = stripeAccountId
        ? await stripe.accounts.retrieve(stripeAccountId)
        : null;
    } catch (error) {
      console.warn(`Stripe account lookup failed for seller ${sellerId}:`, error.message);
      account = null;
    }

    if (!account || !account.payouts_enabled) {
      await upsertTransfer({
        orderId,
        sellerId,
        stripeAccountId,
        grossAmount,
        commissionAmount,
        sellerAmount,
        transferStatus: "seller_not_connected",
      });
      continue;
    }

    await syncSellerStripeState(sellerId, account);

    const transferAmount = Math.round(sellerAmount * 100);
    if (transferAmount <= 0) {
      await upsertTransfer({
        orderId,
        sellerId,
        stripeAccountId,
        grossAmount,
        commissionAmount,
        sellerAmount,
        transferStatus: "invalid_amount",
      });
      continue;
    }

    await upsertTransfer({
      orderId,
      sellerId,
      stripeAccountId,
      grossAmount,
      commissionAmount,
      sellerAmount,
      transferStatus: "pending",
    });

    try {
      const transfer = await stripe.transfers.create(
        {
          amount: transferAmount,
          currency: "usd",
          destination: stripeAccountId,
          metadata: {
            orderId: String(orderId),
            sellerId: String(sellerId),
            grossAmount: grossAmount.toFixed(2),
            commissionAmount: commissionAmount.toFixed(2),
            sellerAmount: sellerAmount.toFixed(2),
          },
        },
        { idempotencyKey: `order-${orderId}-seller-${sellerId}` }
      );

      await pool.query(
        `
        UPDATE order_transfers
        SET stripe_transfer_id = $1, transfer_status = 'completed',
            updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $2 AND seller_id = $3
        `,
        [transfer.id, orderId, sellerId]
      );
    } catch (error) {
      console.error(`Stripe transfer failed for seller ${sellerId}:`, error.message);
      await pool.query(
        `
        UPDATE order_transfers
        SET transfer_status = 'failed', updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $1 AND seller_id = $2
        `,
        [orderId, sellerId]
      );
    }
  }

  const summaryResult = await pool.query(
    `
    SELECT
      COUNT(*) FILTER (WHERE transfer_status = 'completed') AS completed,
      COUNT(*) FILTER (WHERE transfer_status = 'failed') AS failed,
      COUNT(*) FILTER (WHERE transfer_status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE transfer_status = 'seller_not_connected') AS seller_not_connected
    FROM order_transfers
    WHERE order_id = $1
    `,
    [orderId]
  );
  const summary = summaryResult.rows[0];
  const status = Number(summary.failed) || Number(summary.seller_not_connected)
    ? "partial"
    : Number(summary.pending)
      ? "pending"
      : Number(summary.completed)
        ? "completed"
        : "not_required";

  await pool.query(
    "UPDATE orders SET transfer_status = $1 WHERE id = $2",
    [status, orderId]
  );

  return { status, summary };
};

module.exports = {
  processSellerTransfersForPaidOrder,
  syncSellerStripeState,
};
