const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  createCheckoutSession,
  verifyCheckoutSession,
  handleStripeWebhook,
} = require("../controllers/paymentController");

// ================= CREATE STRIPE CHECKOUT =================

router.post(
  "/create-checkout-session",
  verifyToken,
  createCheckoutSession
);

// ================= VERIFY STRIPE PAYMENT =================

router.get(
  "/verify-session/:sessionId",
  verifyToken,
  verifyCheckoutSession
);

// ======================================================
// STRIPE WEBHOOK
// ======================================================

router.post(
  "/webhook",
  handleStripeWebhook
);

module.exports = router;