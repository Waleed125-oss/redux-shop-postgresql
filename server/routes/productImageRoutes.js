const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  deleteProductImage,
} = require("../controllers/productImageController");


router.delete(
  "/:id",
  verifyToken,
  adminMiddleware,
  deleteProductImage
);


module.exports = router;