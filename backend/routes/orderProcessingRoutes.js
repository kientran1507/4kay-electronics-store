const express = require("express");
const {
  updateOrderStatus,
} = require("../controllers/orderProcessingController.js");
const router = express.Router();

const { protect, adminProtect } = require("../middleware/authMiddleware"); // Middleware bảo vệ route

// Route cập nhật trạng thái đơn hàng
router.put("/status", adminProtect, updateOrderStatus);

module.exports = router;
