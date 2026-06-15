const express = require("express");
const {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  removeCart,
} = require("../controllers/cartController"); // Kiểm tra lại đường dẫn đúng

const router = express.Router();
const { protect, adminProtect } = require("../middleware/authMiddleware"); // Middleware bảo vệ route

// Route thêm sản phẩm vào giỏ hàng
router.post("/add", protect, addToCart);

// Route lấy giỏ hàng của người dùng
router.get("/", protect, getCart);

// Route cập nhật giỏ hàng (Cần xác thực)
router.put("/updateCartItemQuantity", protect, updateCartItemQuantity); // Đảm bảo rằng bạn đã có controller updateCart

// Route xóa sản phẩm khỏi giỏ hàng
router.delete("/removeFromCart", protect, removeFromCart);

// Route xóa giỏ hàng
router.delete("/removeCart", protect, removeCart);
module.exports = router;
