const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  items: [orderItemSchema], // Danh sách sản phẩm trong đơn hàng
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Chờ thanh toán", "Chờ xử lý", "Đang giao", "Hoàn thành", "Đã hủy"],
    default: "Chờ thanh toán",
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Tiền mặt", "Chuyển khoản"],
    required: true,
  },
  paymentAccount: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "paid", "failed", "cancelled"],
    default: "unpaid",
  },
  paymentProvider: {
    type: String,
    enum: ["cash", "payos", "manual_bank_transfer"],
    default: "cash",
  },
  paymentOrderCode: {
    type: Number,
  },
  paymentLinkId: {
    type: String,
  },
  paymentUrl: {
    type: String,
  },
  paymentQrCode: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
