require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const shopRoutes = require("./routes/shopRoutes");
const productImageRoutes = require("./routes/productImageRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const sellerRoutes = require("./routes/sellerRoutes")
const paymentRoutes = require("./routes/paymentRoutes");
const refundRoutes = require("./routes/refundRoutes");

const path = require("path");


const app = express();

app.use(cors());

// ======================================================
// STRIPE WEBHOOK
// MUST COME BEFORE express.json()
// ======================================================
app.use(
  "/api/payment/webhook",
  express.raw({ type: "application/json" })
);

// ======================================================
// NORMAL JSON REQUESTS
// ======================================================
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/product-images", productImageRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/refunds", refundRoutes);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {
  res.send("Redux Shop PostgreSQL Backend Running...");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test PostgreSQL connection
    await pool.query("SELECT NOW()");

    console.log("✅ PostgreSQL Connected Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.log("❌ PostgreSQL Connection Failed");
    console.log(error.message);
  }
}

startServer();