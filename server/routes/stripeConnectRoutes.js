const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");

const {
  createConnectedAccount,
  createOnboardingLink,
  getStripeAccountStatus,
} = require("../controllers/stripeConnectController");

// ======================================================
// CREATE STRIPE CONNECTED ACCOUNT
// ======================================================

router.post(
  "/create-account",
  verifyToken,
  sellerMiddleware,
  createConnectedAccount
);
// ======================================================
// CREATE STRIPE SELLER ONBOARDING LINK
// ======================================================
router.post(
  "/onboarding",
  verifyToken,
  sellerMiddleware,
  createOnboardingLink
);

// ======================================================
// GET STRIPE SELLER ACCOUNT STATUS
// ======================================================

router.get(
  "/status",
  verifyToken,
  sellerMiddleware,
  getStripeAccountStatus
);

module.exports = router;