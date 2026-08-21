const express = require("express");

const router = express.Router();

const {
  getAllSellers,
  getSellerStore,
} = require("../controllers/shopController");


// ========================================
// SHOP BY SELLER
// ========================================

// Get all sellers
router.get(
  "/sellers",
  getAllSellers
);


// Get single seller store
router.get(
  "/sellers/:sellerId",
  getSellerStore
);


module.exports = router;