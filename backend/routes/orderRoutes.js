const express = require("express");
const {
  createOrder,
  getUserOrders,
  getUserOrderDetails,
  getAllOrders,
  cancelOrder,
} = require("../controllers/orderController");
const { protect, adminProtect } = require("../middleware/authMiddleware"); // Middleware bảo vệ route

const router = express.Router();

// Route tạo đơn hàng
router.post("/createOrder", protect, createOrder);

// Route lấy danh sách đơn hàng của người dùng
router.get("/", adminProtect, getAllOrders);

// Route lấy danh sách đơn hàng của người dùng
router.get("/userOrders", protect, getUserOrders);

// Route lấy chi tiết đơn hàng
router.get("/userOrderDetails/:orderId", protect, getUserOrderDetails);

// Route hủy đơn hàng
router.put("/cancelOrder", protect, cancelOrder);
module.exports = router;
