const pool = require("../config/db");
const {
  COMMISSION_PERCENTAGE,
  calculateSellerBreakdown,
} = require("../config/commission");

// Prefer the stored payment/transfer amounts. They are produced by the same
// payment flow that creates the Stripe transfer. The shared calculation is a
// short-lived fallback if a seller opens an invoice before its transfer record
// has been written.
const addSellerFinancials = (invoice) => {
  const calculated = calculateSellerBreakdown(invoice.gross_amount);
  const grossAmount = Number(invoice.gross_amount || 0);
  const commissionAmount = invoice.admin_commission_amount == null
    ? calculated.commissionAmount
    : Number(invoice.admin_commission_amount);
  const sellerNetAmount = invoice.seller_net_amount == null
    ? calculated.sellerAmount
    : Number(invoice.seller_net_amount);

  return {
    ...invoice,
    seller_id: Number(invoice.seller_id),
    gross_amount: grossAmount,
    admin_commission_percentage: COMMISSION_PERCENTAGE,
    admin_commission_amount: commissionAmount,
    seller_net_amount: sellerNetAmount,
    seller_total: sellerNetAmount,
    total: sellerNetAmount,
  };
};

const getCustomerInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        i.id,
        i.invoice_number,
        i.currency,
        i.subtotal_amount,
        i.tax_amount,
        i.discount_amount,
        i.total_amount,
        i.issued_at,
        i.order_id,
        COUNT(ii.id)::INTEGER AS item_count
      FROM invoices i
      LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
      WHERE i.buyer_id = $1
      GROUP BY i.id
      ORDER BY i.issued_at DESC
      `,
      [req.user.id]
    );

    res.json({ invoices: result.rows });
  } catch (error) {
    console.error("Get customer invoices error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getCustomerInvoiceById = async (req, res) => {
  try {
    const invoiceResult = await pool.query(
      `
      SELECT
        i.id, i.invoice_number, i.order_id, i.currency, i.subtotal_amount,
        i.tax_amount, i.discount_amount, i.total_amount, i.issued_at,
        o.payment_status, o.created_at AS order_created_at,
        i.stripe_customer_id, i.stripe_payment_intent_id,
        u.name AS buyer_name, u.email AS buyer_email
      FROM invoices i
      INNER JOIN orders o ON o.id = i.order_id
      INNER JOIN users u ON u.id = i.buyer_id
      WHERE i.id = $1 AND i.buyer_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        id, product_id, seller_id, product_title, product_sku,
        seller_business_name, quantity, unit_price, line_total
      FROM invoice_items
      WHERE invoice_id = $1
      ORDER BY id ASC
      `,
      [req.params.id]
    );

    res.json({
      invoice: invoiceResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("Get customer invoice error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getSellerInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        i.id,
        i.invoice_number,
        i.currency,
        i.issued_at,
        i.order_id,
        COUNT(ii.id)::INTEGER AS item_count,
        ii.seller_id,
        MAX(ii.seller_business_name) AS seller_business_name,
        COALESCE(SUM(ii.line_total), 0) AS gross_amount,
        ot.commission_amount AS admin_commission_amount,
        ot.seller_amount AS seller_net_amount
      FROM invoices i
      INNER JOIN invoice_items ii ON ii.invoice_id = i.id
      LEFT JOIN order_transfers ot
        ON ot.order_id = i.order_id AND ot.seller_id = ii.seller_id
      WHERE ii.seller_id = $1
      GROUP BY i.id, ii.seller_id, ot.commission_amount, ot.seller_amount
      ORDER BY i.issued_at DESC
      `,
      [req.user.id]
    );

    res.json({ invoices: result.rows.map(addSellerFinancials) });
  } catch (error) {
    console.error("Get seller invoices error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getSellerInvoiceById = async (req, res) => {
  try {
    const invoiceResult = await pool.query(
      `
      SELECT
        i.id, i.invoice_number, i.order_id, i.currency, i.issued_at,
        i.stripe_customer_id, i.stripe_payment_intent_id,
        o.payment_status, o.created_at AS order_created_at,
        (
          SELECT COUNT(*)::INTEGER
          FROM invoice_items
          WHERE invoice_id = i.id AND seller_id = $2
        ) AS item_count,
        (
          SELECT COALESCE(SUM(line_total), 0)
          FROM invoice_items
          WHERE invoice_id = i.id AND seller_id = $2
        ) AS gross_amount,
        $2::INTEGER AS seller_id,
        (
          SELECT MAX(seller_business_name)
          FROM invoice_items
          WHERE invoice_id = i.id AND seller_id = $2
        ) AS seller_business_name,
        ot.commission_amount AS admin_commission_amount,
        ot.seller_amount AS seller_net_amount
      FROM invoices i
      INNER JOIN orders o ON o.id = i.order_id
      LEFT JOIN order_transfers ot
        ON ot.order_id = i.order_id AND ot.seller_id = $2
      WHERE i.id = $1
        AND EXISTS (
          SELECT 1
          FROM invoice_items
          WHERE invoice_id = i.id AND seller_id = $2
        )
      `,
      [req.params.id, req.user.id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        id, product_id, product_title, product_sku,
        seller_business_name, quantity, unit_price, line_total
      FROM invoice_items
      WHERE invoice_id = $1 AND seller_id = $2
      ORDER BY id ASC
      `,
      [req.params.id, req.user.id]
    );

    res.json({
      invoice: addSellerFinancials(invoiceResult.rows[0]),
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("Get seller invoice error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAdminInvoices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id, i.invoice_number, i.order_id, i.currency,
        i.subtotal_amount, i.tax_amount, i.discount_amount,
        i.total_amount, i.issued_at,
        u.id AS buyer_id, u.name AS buyer_name, u.email AS buyer_email,
        COUNT(ii.id)::INTEGER AS item_count
      FROM invoices i
      INNER JOIN users u ON u.id = i.buyer_id
      LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
      GROUP BY i.id, u.id
      ORDER BY i.issued_at DESC
    `);

    res.json({ invoices: result.rows });
  } catch (error) {
    console.error("Get admin invoices error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAdminInvoiceById = async (req, res) => {
  try {
    const invoiceResult = await pool.query(
      `
      SELECT
        i.id, i.invoice_number, i.order_id, i.currency,
        i.subtotal_amount, i.tax_amount, i.discount_amount,
        i.total_amount, i.issued_at,
        o.payment_status, o.created_at AS order_created_at,
        u.id AS buyer_id, u.name AS buyer_name, u.email AS buyer_email
      FROM invoices i
      INNER JOIN users u ON u.id = i.buyer_id
      INNER JOIN orders o ON o.id = i.order_id
      WHERE i.id = $1
      `,
      [req.params.id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        id, product_id, seller_id, product_title, product_sku,
        seller_business_name, quantity, unit_price, line_total
      FROM invoice_items
      WHERE invoice_id = $1
      ORDER BY id ASC
      `,
      [req.params.id]
    );

    res.json({
      invoice: invoiceResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("Get admin invoice error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getCustomerInvoices,
  getCustomerInvoiceById,
  getSellerInvoices,
  getSellerInvoiceById,
  getAdminInvoices,
  getAdminInvoiceById,
};
