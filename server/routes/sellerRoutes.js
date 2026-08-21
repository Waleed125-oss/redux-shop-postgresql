const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");
const upload = require("../middleware/upload");

const {
  applyAsSeller,
  getMySellerApplication,

  // Seller Products
  createSellerProduct,
  getSellerProducts,
  updateSellerProduct,
  updateSellerProductStatus,
  getSellerProductById,

  // Seller Dashboard
  getSellerDashboardStats,

  // Seller Orders
  getSellerOrders,
  getSellerOrderDetails,
  updateSellerOrderStatus,

  // Seller Profile
  getSellerProfile,
  updateSellerProfile,

} = require("../controllers/sellerController");


// ========================================
// SELLER APPLICATION
// ========================================

// Apply to become seller
router.post(
  "/apply",
  verifyToken,
  applyAsSeller
);

// Get current user's application
router.get(
  "/application",
  verifyToken,
  getMySellerApplication
);


// ========================================
// SELLER DASHBOARD
// ========================================

router.get(
  "/dashboard/stats",
  verifyToken,
  sellerMiddleware,
  getSellerDashboardStats
);


// ========================================
// SELLER ORDERS
// ========================================

// Get seller orders
router.get(
  "/orders",
  verifyToken,
  sellerMiddleware,
  getSellerOrders
);

// Get single seller order
router.get(
  "/orders/:id",
  verifyToken,
  sellerMiddleware,
  getSellerOrderDetails
);

// Update seller order status
router.patch(
  "/orders/:id/status",
  verifyToken,
  sellerMiddleware,
  updateSellerOrderStatus
);


// ========================================
// SELLER PRODUCTS
// ========================================

// Get seller products
router.get(
  "/products",
  verifyToken,
  sellerMiddleware,
  getSellerProducts
);

// Get single seller product
router.get(
  "/products/:id",
  verifyToken,
  sellerMiddleware,
  getSellerProductById
);

// Create seller product
router.post(
  "/products",
  verifyToken,
  sellerMiddleware,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  createSellerProduct
);

// Update seller product
router.put(
  "/products/:id",
  verifyToken,
  sellerMiddleware,
  upload.single("image"),
  updateSellerProduct
);

// Activate / Deactivate seller product
router.patch(
  "/products/:id/status",
  verifyToken,
  sellerMiddleware,
  updateSellerProductStatus
);


// ========================================
// SELLER PROFILE
// ========================================

// Get seller profile
router.get(
  "/profile",
  verifyToken,
  sellerMiddleware,
  getSellerProfile
);

// Update seller profile
router.put(
  "/profile",
  verifyToken,
  sellerMiddleware,
  updateSellerProfile
);


module.exports = router;