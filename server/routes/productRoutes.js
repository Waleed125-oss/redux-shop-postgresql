
// const verifyToken = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");
// const express = require("express");

// const router = express.Router();

// const upload = require("../middleware/upload");

// const {
//   getProducts,
//   getSingleProduct,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// } = require("../controllers/productController");

// // GET
// router.get("/", getProducts);

// router.get("/:id", getSingleProduct);

// // CREATE PRODUCT (Image Upload)
// router.post(
//   "/",
//   verifyToken,
//   adminMiddleware,
//   upload.single("image"),
//   createProduct
// );

// // UPDATE PRODUCT (Image Upload)
// router.put(
//   "/:id",
//   verifyToken,
//   adminMiddleware,
//   upload.single("image"),
//   updateProduct
// );

// // DELETE
// router.delete("/:id", verifyToken, adminMiddleware, deleteProduct);

// module.exports = router;











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
  upload.single("image"),
  createProduct
);


// ================= UPDATE PRODUCT =================

router.put(
  "/:id",
  verifyToken,
  adminMiddleware,
  upload.single("image"),
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