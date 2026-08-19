const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getSellerApplications,
  approveSeller,
  rejectSeller,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


// Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  getDashboardStats
);


// Seller Applications
router.get(
  "/seller-applications",
  authMiddleware,
  adminMiddleware,
  getSellerApplications
);


// Approve Seller
router.put(
  "/seller-applications/:id/approve",
  authMiddleware,
  adminMiddleware,
  approveSeller
);


// Reject Seller
router.put(
  "/seller-applications/:id/reject",
  authMiddleware,
  adminMiddleware,
  rejectSeller
);


module.exports = router;