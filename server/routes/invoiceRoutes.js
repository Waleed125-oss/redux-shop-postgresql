const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getCustomerInvoices,
  getCustomerInvoiceById,
  getSellerInvoices,
  getSellerInvoiceById,
  getAdminInvoices,
  getAdminInvoiceById,
} = require("../controllers/invoiceController");

const router = express.Router();

router.get("/my", verifyToken, getCustomerInvoices);
router.get("/my/:id", verifyToken, getCustomerInvoiceById);

router.get("/seller", verifyToken, sellerMiddleware, getSellerInvoices);
router.get("/seller/:id", verifyToken, sellerMiddleware, getSellerInvoiceById);

router.get("/admin", verifyToken, adminMiddleware, getAdminInvoices);
router.get("/admin/:id", verifyToken, adminMiddleware, getAdminInvoiceById);

module.exports = router;
