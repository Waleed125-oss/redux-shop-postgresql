const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getCustomerById,
} = require("../controllers/adminCustomerController");

router.get(
  "/:id",
  verifyToken,
  getCustomerById
);

module.exports = router;