const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const refundOrder = require("./orderProcessingController.js").refundOrder;
const { buildCartPricing } = require("../services/pricingService");
const {
  releaseOrderInventory,
  reserveInventory,
  restoreInventory,
} = require("../services/inventoryService");

const WAITING_PAYMENT_STATUS = "Chờ thanh toán";
const PROCESSING_STATUS = "Chờ xử lý";
const SHIPPING_STATUS = "Đang giao";
const COMPLETED_STATUS = "Hoàn thành";
const CANCELLED_STATUS = "Đã hủy";

function isCashPayment(paymentMethod = "") {
  const value = String(paymentMethod).toLowerCase();
  return value.includes("ti") || value.includes("cash");
}

function serializePricing(pricing) {
  return {
    subtotal: pricing.subtotal,
    discountAmount: pricing.discountAmount,
    voucherCode: pricing.voucherCode,
    shippingFee: pricing.shippingFee,
    shippingZone: pricing.shippingZone,
    shippingLabel: pricing.shippingLabel,
    freeShippingMin: pricing.freeShippingMin,
    totalPrice: pricing.totalPrice,
  };
}

exports.quoteOrder = async (req, res) => {
  try {
    const pricing = await buildCartPricing(req.user.id, {
      shippingAddress: req.body?.shippingAddress,
      voucherCode: req.body?.voucherCode,
    });

    return res.status(200).json({
      message: "Pricing quote calculated.",
      pricing: serializePricing(pricing),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not calculate pricing quote.",
    });
  }
};

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod, voucherCode } = req.body;
  let reservedItems = [];
  let orderSaved = false;
  let newOrder;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart does not exist or is empty." });
    }
    if (!shippingAddress || !String(shippingAddress).trim()) {
      return res.status(400).json({ message: "Shipping address is required." });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required." });
    }

    const pricing = await buildCartPricing(userId, {
      shippingAddress: String(shippingAddress).trim(),
      voucherCode,
    });
    const orderItems = pricing.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));
    const cashPayment = isCashPayment(paymentMethod);
    reservedItems = await reserveInventory(orderItems);

    newOrder = new Order({
      userId,
      items: orderItems,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      voucherCode: pricing.voucherCode,
      shippingFee: pricing.shippingFee,
      shippingZone: pricing.shippingZone,
      shippingLabel: pricing.shippingLabel,
      totalPrice: pricing.totalPrice,
      shippingAddress: String(shippingAddress).trim(),
      paymentMethod,
      paymentProvider: cashPayment ? "cash" : "payos",
      paymentStatus: cashPayment ? "unpaid" : "pending",
      status: cashPayment ? PROCESSING_STATUS : WAITING_PAYMENT_STATUS,
    });

    await newOrder.save();
    orderSaved = true;
    if (pricing.voucher) {
      pricing.voucher.usedCount += 1;
      await pricing.voucher.save();
    }
    await Cart.deleteOne({ userId });

    return res.status(201).json({
      message: "Order created successfully.",
      order: newOrder,
      pricing: serializePricing(pricing),
      cart: { items: [], totalPrice: 0 },
    });
  } catch (error) {
    console.error(error);

    if (reservedItems.length && !orderSaved) {
      try {
        await restoreInventory(reservedItems);
      } catch (restoreError) {
        console.error("Could not restore inventory after order failure:", restoreError);
      }
    }

    if (orderSaved) {
      return res.status(201).json({
        message: "Order was created, but cart or voucher cleanup needs attention.",
        order: newOrder,
        cart: { items: [], totalPrice: 0 },
      });
    }

    return res.status(error.statusCode || 500).json({
      message: error.message || "System error while creating order.",
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.productId", "name price image");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load orders.",
      error: error.message,
    });
  }
};

exports.getUserOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.id,
    }).populate("items.productId", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({
      message: "Order details",
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "System error while loading order details." });
  }
};

exports.getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  try {
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items.productId", "name price image");

    return res.status(200).json({
      message: "Order list",
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error("Could not load orders:", error);
    return res.status(500).json({ message: "System error." });
  }
};

exports.cancelOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or does not belong to you.",
      });
    }

    if ([SHIPPING_STATUS, COMPLETED_STATUS, CANCELLED_STATUS].includes(order.status)) {
      return res.status(200).json({
        message: "This order can no longer be cancelled.",
      });
    }

    if (order.status === PROCESSING_STATUS && !isCashPayment(order.paymentMethod)) {
      await refundOrder(orderId);
    }

    await releaseOrderInventory(order);
    await Order.updateOne(
      { _id: order._id },
      { $set: { status: CANCELLED_STATUS, updatedAt: new Date() } },
    );

    return res.status(200).json({
      message: "Order cancelled.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "System error while cancelling order." });
  }
};
