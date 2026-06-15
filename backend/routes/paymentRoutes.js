const express = require("express");
const {
  createPayosPayment,
  getStatus,
  payosWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/payos/create", protect, createPayosPayment);
router.post("/payos/webhook", payosWebhook);
router.get("/status/:orderId", protect, getStatus);

module.exports = router;
