const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");

const {
  requestRefund,
  approveRefundByAdmin,
  approveRefundBySeller,
  getAdminRefundRequests,
  getSellerRefundRequests,
  getCustomerRefundRequests,
} = require("../controllers/refundController");


// ======================================================
// CUSTOMER REQUEST REFUND
// ======================================================

router.post(
  "/request/:orderId",
  verifyToken,
  requestRefund
);

router.get(
  "/mine",
  verifyToken,
  getCustomerRefundRequests
);


// ======================================================
// ADMIN REFUND REQUESTS
// ======================================================

router.get(
  "/admin",
  verifyToken,
  adminMiddleware,
  getAdminRefundRequests
);


// ======================================================
// ADMIN APPROVE REFUND
// ======================================================

router.put(
  "/admin/:refundId/approve",
  verifyToken,
  adminMiddleware,
  approveRefundByAdmin
);


// ======================================================
// SELLER REFUND REQUESTS
// ======================================================

router.get(
  "/seller",
  verifyToken,
  sellerMiddleware,
  getSellerRefundRequests
);


// ======================================================
// SELLER APPROVE REFUND
// ======================================================

router.put(
  "/seller/:refundId/approve",
  verifyToken,
  sellerMiddleware,
  approveRefundBySeller
);


module.exports = router;