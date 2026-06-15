const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const {
  createPayosPayment,
  getPayosPayment,
  verifyPayosWebhook,
} = require("../services/payment/payosService");

const findOwnedOrder = (orderId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;
  return Order.findOne({ _id: orderId, userId });
};

const mapProviderStatus = (status) => {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "PAID") return "paid";
  if (["CANCELLED", "EXPIRED"].includes(normalized)) return "cancelled";
  if (["FAILED", "UNDERPAID"].includes(normalized)) return "failed";
  return "pending";
};

const serializePayment = (order, extra = {}) => ({
  orderId: order._id,
  orderCode: order.paymentOrderCode,
  paymentLinkId: order.paymentLinkId,
  paymentUrl: order.paymentUrl || "",
  qrCode: order.paymentQrCode || "",
  amount: order.totalPrice,
  status: order.paymentStatus || "unpaid",
  provider: order.paymentProvider || "cash",
  ...extra,
});

exports.createPayosPayment = async (req, res) => {
  const { orderId } = req.body || {};

  try {
    const order = orderId ? await findOwnedOrder(orderId, req.user.id) : null;
    if (!order) {
      return res.status(404).json({ message: "Order does not exist or does not belong to this customer." });
    }
    if (order.paymentStatus === "paid") {
      return res.status(200).json(serializePayment(order, { message: "This order is already paid." }));
    }
    if (order.paymentUrl && order.paymentStatus === "pending") {
      return res.status(200).json(serializePayment(order, { message: "Existing payment session loaded." }));
    }

    const payment = await createPayosPayment({
      orderId: String(order._id),
      amount: order.totalPrice,
    });

    order.paymentProvider = payment.provider;
    order.paymentStatus = mapProviderStatus(payment.status);
    order.paymentOrderCode = payment.orderCode;
    order.paymentLinkId = payment.paymentLinkId;
    order.paymentUrl = payment.paymentUrl;
    order.paymentQrCode = payment.qrCode;
    order.updatedAt = new Date();
    await order.save();

    return res.status(200).json(serializePayment(order, { message: payment.message }));
  } catch (error) {
    console.error("Create payOS payment failed:", error);
    return res.status(502).json({
      message: "Could not create the online payment session. Check payOS credentials and account status.",
    });
  }
};

exports.payosWebhook = async (req, res) => {
  try {
    const webhookData = await verifyPayosWebhook(req.body);
    const order = await Order.findOne({ paymentOrderCode: webhookData.orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    order.paymentStatus = webhookData.code === "00" ? "paid" : "failed";
    if (order.paymentStatus === "paid") {
      order.status = "Chá» xá»­ lÃ½";
    }
    order.updatedAt = new Date();
    await order.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("payOS webhook verification failed:", error);
    return res.status(400).json({ success: false, message: "Invalid payOS webhook." });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const order = await findOwnedOrder(req.params.orderId, req.user.id);
    if (!order) {
      return res.status(404).json({ message: "Order does not exist or does not belong to this customer." });
    }

    if (order.paymentProvider === "payos" && order.paymentOrderCode && order.paymentStatus === "pending") {
      try {
        const providerPayment = await getPayosPayment(order.paymentOrderCode);
        const nextStatus = mapProviderStatus(providerPayment?.status);
        if (nextStatus !== order.paymentStatus) {
          order.paymentStatus = nextStatus;
          if (nextStatus === "paid") order.status = "Chá» xá»­ lÃ½";
          order.updatedAt = new Date();
          await order.save();
        }
      } catch (error) {
        console.warn("Could not refresh payOS status:", error.message);
      }
    }

    return res.status(200).json(serializePayment(order));
  } catch (error) {
    console.error("Payment status lookup failed:", error);
    return res.status(500).json({ message: "Could not load payment status." });
  }
};
