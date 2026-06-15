// routes/adminRoutes.js
const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  updateAdmin,
  getAdminById,
  getAllAdmins,
} = require("../controllers/adminController"); // Import controller
const { protect, adminProtect } = require("../middleware/authMiddleware"); // Middleware bảo vệ route

const router = express.Router();

// Đăng ký admin mới
router.post("/register", adminProtect, registerAdmin);

// Đăng nhập admin
router.post("/login", loginAdmin);

// Cập nhật thông tin admin
router.put("/update", adminProtect, updateAdmin);

// Lấy thông tin admin
router.get("/:id", adminProtect, getAdminById);

// Lấy tất cả admin trong csdl
router.get("/", adminProtect, getAllAdmins);
module.exports = router;
