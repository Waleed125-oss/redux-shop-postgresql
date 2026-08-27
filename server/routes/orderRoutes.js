


const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  checkout,
  getOrders,
  getSingleOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

// ================= CUSTOMER =================

// Place Order
router.post(
  "/checkout",
  verifyToken,
  checkout
);


// ================= ORDERS =================

// Customer:
// Can see their own orders
//
// Admin:
// Can see all orders

router.get(
  "/",
  verifyToken,
  getOrders
);


// ================= SINGLE ORDER =================

// Customer:
// Can see their own order
//
// Admin:
// Can see any order

router.get(
  "/:id",
  verifyToken,
  getSingleOrder
);


// ================= ADMIN ONLY =================

// Only admin can update order status

router.put(
  "/:id",
  verifyToken,
  adminMiddleware,
  updateOrderStatus
);


module.exports = router;