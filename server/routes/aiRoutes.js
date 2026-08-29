const express = require("express");

const {
  generateProduct,
  generateImage,
} = require("../controllers/aiController");

const authMiddleware = require("../middleware/authMiddleware");
const adminOrSellerMiddleware = require(
  "../middleware/adminOrSellerMiddleware"
);

const router = express.Router();

// Generate product text
router.post(
  "/generate-product",
  authMiddleware,
  adminOrSellerMiddleware,
  generateProduct
);

// Generate product image
router.post(
  "/generate-image",
  authMiddleware,
  adminOrSellerMiddleware,
  generateImage
);

module.exports = router;