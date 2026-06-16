const express = require("express");
const {
  registerCustomer,
  loginCustomer,
  updateCustomer,
  adminCreateCustomer,
  adminUpdateCustomer,
  adminDeleteCustomer,
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
router.post("/admin", adminProtect, adminCreateCustomer);
router.get("/", adminProtect, getAllCustomers);
router.put("/:id", adminProtect, adminUpdateCustomer);
router.delete("/:id", adminProtect, adminDeleteCustomer);
router.get("/:id", protectCustomerOrAdmin, getCustomerById);

module.exports = router;
