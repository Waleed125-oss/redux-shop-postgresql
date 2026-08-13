





const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

const {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  permanentlyDeleteProduct,
} = require("../controllers/productController");


// ================= GET PRODUCTS =================

// User + Admin
router.get("/", getProducts);


// ================= GET SINGLE PRODUCT =================

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