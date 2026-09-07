





const express = require("express");

const router = express.Router();

const sellerMiddleware = require("../middleware/sellerMiddleware")
const verifyToken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

const {
  getProducts,
  aiSearchProducts,
  getProductRecommendations,
  getHomeProductSections,
  getSingleProduct,
  createProduct,
  createSellerProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  permanentlyDeleteProduct,
  getPendingSellerProducts,
  approveSellerProduct,
  rejectSellerProduct,
} = require("../controllers/productController");


// ================= GET PRODUCTS =================

// User + Admin
router.get("/", getProducts);

// AI SEMANTIC PRODUCT SEARCH
// Must stay before /:id so Express does not treat "ai-search" as an ID.
router.get("/ai-search", aiSearchProducts);


// HOME PRODUCT SECTIONS
router.get(
  "/home/sections",
  getHomeProductSections
);

// ================= GET SELLER PRODUCTS =================

router.get(
  "/seller",

  verifyToken,

  sellerMiddleware,

  getSellerProducts
);


router.get(
  "/admin/pending",
  verifyToken,
  adminMiddleware,
  getPendingSellerProducts
);


router.patch(
  "/admin/:id/approve",
  verifyToken,
  adminMiddleware,
  approveSellerProduct
);

router.patch(
  "/admin/:id/reject",
  verifyToken,
  adminMiddleware,
  rejectSellerProduct
);

// ================= GET SINGLE PRODUCT =================

// Must stay before /:id so Express does not treat "recommendations" as an ID.
router.get("/:id/recommendations", getProductRecommendations);

// User + Admin
router.get("/:id", getSingleProduct);


// ================= CREATE PRODUCT =================

router.post(
  "/",
  verifyToken,
  adminMiddleware,

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

  createProduct
);


// ================= CREATE SELLER PRODUCT =================

router.post(
  "/seller",

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



// ================= UPDATE PRODUCT =================

router.put(
  "/:id",
  verifyToken,
  adminMiddleware,

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

  updateProduct
);

// ================= TOGGLE ACTIVE / INACTIVE =================

router.patch(
  "/:id/status",
  verifyToken,
  adminMiddleware,
  toggleProductStatus
);


// ================= DEACTIVATE PRODUCT =================
// Soft delete

router.delete(
  "/:id",
  verifyToken,
  adminMiddleware,
  deleteProduct
);

// PERMANENT DELETE PRODUCT
router.delete(
  "/:id/permanent",
  verifyToken,
  adminMiddleware,
  permanentlyDeleteProduct
);







module.exports = router;
