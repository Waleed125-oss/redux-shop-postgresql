
const verifyToken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// GET
router.get("/", getProducts);

router.get("/:id", getSingleProduct);

// CREATE PRODUCT (Image Upload)
router.post(
  "/",
  verifyToken,
  adminMiddleware,
  upload.single("image"),
  createProduct
);

// UPDATE PRODUCT (Image Upload)
router.put(
  "/:id",
  verifyToken,
  adminMiddleware,
  upload.single("image"),
  updateProduct
);

// DELETE
router.delete("/:id", verifyToken, adminMiddleware, deleteProduct);

module.exports = router;