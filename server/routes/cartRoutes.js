const express = require("express");

const router = express.Router();

const {
  getCart,
  addToCart,
  updateCart,
  deleteCartItem,
} = require("../controllers/cartController");

const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, getCart);

router.post("/", verifyToken, addToCart);

router.put("/:id", verifyToken, updateCart);

router.delete("/:id", verifyToken, deleteCartItem);

module.exports = router;