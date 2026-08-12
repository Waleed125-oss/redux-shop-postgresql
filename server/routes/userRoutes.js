const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  getCustomers,
} = require("../controllers/userController");


// Logged-in user's profile
router.get(
  "/profile",
  verifyToken,
  getProfile
);


// Update logged-in user's profile
router.put(
  "/profile",
  verifyToken,
  updateProfile
);


// Admin - get all customers
router.get(
  "/customers",
  verifyToken,
  getCustomers
);


module.exports = router;