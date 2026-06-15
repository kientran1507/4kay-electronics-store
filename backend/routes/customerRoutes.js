const express = require("express");
const {
  registerCustomer,
  loginCustomer,
  updateCustomer,
  getCustomerById,
  getAllCustomers,
} = require("../controllers/customerController");
const {
  protect,
  adminProtect,
  protectCustomerOrAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.put("/update", protect, updateCustomer);
router.get("/", adminProtect, getAllCustomers);
router.get("/:id", protectCustomerOrAdmin, getCustomerById);

module.exports = router;
