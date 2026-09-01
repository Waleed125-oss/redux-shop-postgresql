// const pool = require("../config/db");

// // Creates the invoice only once. Both the Stripe webhook and the customer
// // verification endpoint may report the same paid order.
// const createInvoiceForPaidOrder = async (orderId) => {
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     const orderResult = await client.query(
//       `
//       SELECT id, user_id, payment_status
//       FROM orders
//       WHERE id = $1
//       FOR UPDATE
//       `,
//       [orderId]
//     );

//     if (orderResult.rows.length === 0) {
//       throw new Error("Order not found while creating invoice");
//     }

//     const order = orderResult.rows[0];

//     if (order.payment_status !== "paid") {
//       throw new Error("Cannot create an invoice for an unpaid order");
//     }

//     const existingInvoice = await client.query(
//       `
//       SELECT id, invoice_number
//       FROM invoices
//       WHERE order_id = $1
//       `,
//       [order.id]
//     );

//     if (existingInvoice.rows.length > 0) {
//       await client.query("COMMIT");
//       return {
//         invoice: existingInvoice.rows[0],
//         created: false,
//       };
//     }

//     const itemsResult = await client.query(
//       `
//       SELECT
//         oi.product_id,
//         oi.quantity,
//         oi.price AS unit_price,
//         p.title AS product_title,
//         p.seller_id,
//         sa.business_name AS seller_business_name
//       FROM order_items oi
//       INNER JOIN products p
//         ON p.id = oi.product_id
//       LEFT JOIN LATERAL (
//         SELECT business_name
//         FROM seller_applications
//         WHERE user_id = p.seller_id
//           AND status = 'approved'
//         ORDER BY updated_at DESC, id DESC
//         LIMIT 1
//       ) sa ON TRUE
//       WHERE oi.order_id = $1
//       ORDER BY oi.id ASC
//       `,
//       [order.id]
//     );

//     if (itemsResult.rows.length === 0) {
//       throw new Error("Cannot create an invoice without order items");
//     }

//     const subtotalAmount = itemsResult.rows.reduce(
//       (total, item) =>
//         total + Number(item.unit_price) * Number(item.quantity),
//       0
//     );

//     const invoiceResult = await client.query(
//       `
//       INSERT INTO invoices
//       (
//         invoice_number,
//         order_id,
//         buyer_id,
//         currency,
//         subtotal_amount,
//         tax_amount,
//         discount_amount,
//         total_amount
//       )
//       VALUES ($1, $2, $3, 'USD', $4, 0, 0, $4)
//       RETURNING id, invoice_number
//       `,
//       [
//         `INV-${String(order.id).padStart(10, "0")}`,
//         order.id,
//         order.user_id,
//         subtotalAmount.toFixed(2),
//       ]
//     );

//     const invoice = invoiceResult.rows[0];

//     for (const item of itemsResult.rows) {
//       const lineTotal =
//         Number(item.unit_price) * Number(item.quantity);

//       await client.query(
//         `
//         INSERT INTO invoice_items
//         (
//           invoice_id,
//           product_id,
//           seller_id,
//           product_title,
//           seller_business_name,
//           quantity,
//           unit_price,
//           line_total
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//         `,
//         [
//           invoice.id,
//           item.product_id,
//           item.seller_id,
//           item.product_title,
//           item.seller_business_name,
//           item.quantity,
//           item.unit_price,
//           lineTotal.toFixed(2),
//         ]
//       );
//     }

//     await client.query("COMMIT");

//     return { invoice, created: true };
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// module.exports = {
//   createInvoiceForPaidOrder,
// };
















const pool = require("../config/db");

// ======================================================
// CREATE INVOICE FOR PAID ORDER
// ======================================================
//
// This function is idempotent.
// Both:
//
// 1. Stripe webhook
// 2. Customer payment verification
//
// can call this function.
//
// Only ONE invoice will be created for an order.
//
// ======================================================

const createInvoiceForPaidOrder = async (orderId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ==================================================
    // GET ORDER + STRIPE PAYMENT INFORMATION
    // ==================================================

    const orderResult = await client.query(
      `
      SELECT
        o.id,
        o.user_id,
        o.payment_status,

        o.stripe_session_id,
        o.stripe_customer_id,
        o.stripe_payment_intent_id

      FROM orders o

      WHERE o.id = $1

      FOR UPDATE
      `,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error(
        "Order not found while creating invoice"
      );
    }

    const order =
      orderResult.rows[0];

    // ==================================================
    // CHECK PAYMENT STATUS
    // ==================================================

    if (
      order.payment_status !==
      "paid"
    ) {
      throw new Error(
        "Cannot create an invoice for an unpaid order"
      );
    }

    // ==================================================
    // CHECK EXISTING INVOICE
    // ==================================================

    const existingInvoice =
      await client.query(
        `
        SELECT
          id,
          invoice_number,

          stripe_invoice_id,
          stripe_customer_id,
          stripe_payment_intent_id

        FROM invoices

        WHERE order_id = $1

        LIMIT 1
        `,
        [order.id]
      );

    // ==================================================
    // INVOICE ALREADY EXISTS
    // ==================================================

    if (
      existingInvoice.rows.length > 0
    ) {

      await client.query("COMMIT");

      return {
        invoice:
          existingInvoice.rows[0],

        created: false,
      };
    }

    // ==================================================
    // GET ORDER ITEMS
    // ==================================================

    const itemsResult =
      await client.query(
        `
        SELECT
          oi.product_id,
          oi.quantity,
          oi.price AS unit_price,

          p.title AS product_title,

          p.seller_id,

          sa.business_name
            AS seller_business_name

        FROM order_items oi

        INNER JOIN products p
          ON p.id = oi.product_id

        LEFT JOIN LATERAL (
          SELECT
            business_name

          FROM seller_applications

          WHERE user_id = p.seller_id

          AND status = 'approved'

          ORDER BY
            updated_at DESC,
            id DESC

          LIMIT 1

        ) sa ON TRUE

        WHERE oi.order_id = $1

        ORDER BY oi.id ASC
        `,
        [order.id]
      );

    // ==================================================
    // NO ITEMS
    // ==================================================

    if (
      itemsResult.rows.length === 0
    ) {
      throw new Error(
        "Cannot create an invoice without order items"
      );
    }

    // ==================================================
    // CALCULATE SUBTOTAL
    // ==================================================

    const subtotalAmount =
      itemsResult.rows.reduce(
        (total, item) =>
          total +
          Number(item.unit_price) *
            Number(item.quantity),

        0
      );

    // ==================================================
    // TAX
    // ==================================================
    //
    // Your current application does not have a tax
    // calculation configured.
    //
    // Therefore we preserve your current behavior:
    //
    // tax = 0
    //
    // Do NOT invent a tax percentage here.
    //
    // When your actual tax rule is decided, this
    // section should calculate and store the real tax.
    //
    // ==================================================

    const taxAmount = 0;

    // ==================================================
    // DISCOUNT
    // ==================================================

    const discountAmount = 0;

    // ==================================================
    // TOTAL
    // ==================================================

    const totalAmount =
      subtotalAmount +
      taxAmount -
      discountAmount;

    // ==================================================
    // CREATE INVOICE NUMBER
    // ==================================================

    const invoiceNumber =
      `INV-${String(order.id).padStart(10, "0")}`;

    // ==================================================
    // CREATE INVOICE
    // ==================================================

    const invoiceResult =
      await client.query(
        `
        INSERT INTO invoices
        (
          invoice_number,
          order_id,
          buyer_id,

          currency,

          subtotal_amount,
          tax_amount,
          discount_amount,
          total_amount,

          stripe_invoice_id,
          stripe_customer_id,
          stripe_payment_intent_id
        )

        VALUES
        (
          $1,
          $2,
          $3,

          'USD',

          $4,
          $5,
          $6,
          $7,

          $8,
          $9,
          $10
        )

        RETURNING
          id,
          invoice_number,

          stripe_invoice_id,
          stripe_customer_id,
          stripe_payment_intent_id
        `,
        [
          invoiceNumber,

          order.id,

          order.user_id,

          subtotalAmount.toFixed(2),

          taxAmount.toFixed(2),

          discountAmount.toFixed(2),

          totalAmount.toFixed(2),

          // Your current Checkout flow does not
          // create a Stripe Invoice object.
          //
          // Therefore this remains NULL.
          null,

          order.stripe_customer_id,

          order.stripe_payment_intent_id,
        ]
      );

    const invoice =
      invoiceResult.rows[0];

    // ==================================================
    // CREATE INVOICE ITEMS
    // ==================================================

    for (
      const item of itemsResult.rows
    ) {

      const lineTotal =
        Number(item.unit_price) *
        Number(item.quantity);

      await client.query(
        `
        INSERT INTO invoice_items
        (
          invoice_id,
          product_id,
          seller_id,

          product_title,
          seller_business_name,

          quantity,
          unit_price,
          line_total
        )

        VALUES
        (
          $1,
          $2,
          $3,

          $4,
          $5,

          $6,
          $7,
          $8
        )
        `,
        [
          invoice.id,

          item.product_id,

          item.seller_id,

          item.product_title,

          item.seller_business_name,

          item.quantity,

          item.unit_price,

          lineTotal.toFixed(2),
        ]
      );
    }

    // ==================================================
    // COMMIT
    // ==================================================

    await client.query("COMMIT");

    // ==================================================
    // RETURN
    // ==================================================

    return {
      invoice,
      created: true,
    };

  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createInvoiceForPaidOrder,
};