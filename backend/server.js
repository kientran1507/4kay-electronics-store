require("dotenv").config();
const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const mongoose = require("./db");
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes.js");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderProcessingRoutes = require("./routes/orderProcessingRoutes.js");
const aiRoutes = require("./routes/aiRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");

const app = express();

const parseAllowedOrigins = () => {
  const rawOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    "http://localhost:3000",
  ].filter(Boolean);

  return rawOrigins
    .flatMap((origin) => origin.split(","))
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
const port = process.env.PORT || 5000;
// Middleware
app.use(bodyParser.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "4kay-store-api",
    timestamp: new Date().toISOString(),
  });
});

// Sử dụng các route cho khách hàng
app.use("/api/customers", customerRoutes);

// Sử dụng các route cho admin
app.use("/api/admins", adminRoutes);

// Sử dụng các route cho sản phẩm
app.use("/api/products", productRoutes);

// Đăng ký route giỏ hàng
app.use("/api/cart", cartRoutes);

// Tạo đơn hàng
app.use("/api/orders", orderRoutes);

// Xử lý đơn hàng
app.use("/api/orderProcessing", orderProcessingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);

// Chạy server
app.listen(port, () => {
  console.log(`Server đang chạy trên cổng ${port}`);
});
