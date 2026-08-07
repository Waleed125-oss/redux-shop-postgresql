const express = require("express");

const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { checkout,
    getOrders,
    getSingleOrder,
    updateOrderStatus,
 } = require("../controllers/orderController");

 // Customer
 router.post("/checkout", verifyToken, checkout);

 // Admin
 router.get("/", verifyToken,  getOrders);
 router.get("/:id", verifyToken, getSingleOrder);
router.put("/:id", verifyToken, updateOrderStatus);

module.exports = router;