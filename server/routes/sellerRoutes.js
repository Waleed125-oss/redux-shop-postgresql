const express = require("express");


const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");
const upload = require("../middleware/upload");
const {
  applyAsSeller,
  getMySellerApplication,
  createSellerProduct,
  getMyProducts,
  updateSellerProduct,
  deleteSellerProduct,
  toggleProductStatus,
  getSellerDashboardStats,
  getSellerProducts,
  getSellerOrders,
  getSellerProductById,
  updateSellerOrderStatus,

  getSellerProfile,
  updateSellerProfile,
  getSellerOrderDetails,
} = require("../controllers/sellerController");




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

router.get(
  "/dashboard/stats",
  verifyToken,
  sellerMiddleware,
  getSellerDashboardStats
);

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
  getSellerOrderDetails,
);

router.get(
  "/products/:id",
  verifyToken,
  sellerMiddleware,
  getSellerProductById,
);

// ========================================
// Create Product as Seller
// ========================================

 router.get(
  "/products",
  verifyToken,
  sellerMiddleware,
  getSellerProducts
);

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

// ========================================
// Get My Products
// ========================================

router.get(
  "/products",
  verifyToken,
  sellerMiddleware,
  getMyProducts
);

router.put(
  "/products/:id",
  verifyToken,
  sellerMiddleware,
  upload.single("image"),
  updateSellerProduct
);


router.delete(
  "/products/:id",
  verifyToken,
  sellerMiddleware,
  deleteSellerProduct
);


router.patch(
  "/products/:id/status",
  verifyToken,
  sellerMiddleware,
  toggleProductStatus
);

router.patch(
  "/orders/:id/status",
  verifyToken,
  sellerMiddleware,
  updateSellerOrderStatus
);

// ========================================
// SELLER PROFILE
// ========================================

router.get(
  "/profile",
  verifyToken,
  sellerMiddleware,
  getSellerProfile
);

router.put(
  "/profile",
  verifyToken,
  sellerMiddleware,
  updateSellerProfile
);
module.exports = router;