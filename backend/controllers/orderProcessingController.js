const Order = require("../models/orderModel.js");
const { releaseOrderInventory } = require("../services/inventoryService.js");

//Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body; // Trạng thái mới (Chờ xử lý, Đang giao, Hoàn thành, Đã hủy)

  try {
    // Kiểm tra trạng thái hợp lệ
    if (
      ![
        "Chờ thanh toán",
        "Chờ xử lý",
        "Đang giao",
        "Hoàn thành",
        "Đã hủy",
      ].includes(status)
    ) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });
    }

    if (existingOrder.status === "Đã hủy" && status !== "Đã hủy") {
      return res.status(409).json({
        message: "Không thể kích hoạt lại đơn hàng đã hủy vì tồn kho đã được hoàn trả.",
      });
    }

    if (status === "Đã hủy") {
      await releaseOrderInventory(existingOrder);
    }

    // Cập nhật trạng thái đơn hàng
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { status },
      { new: true }, // Trả về đơn hàng đã được cập nhật
    );

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });
    }

    res.status(200).json({
      message: "Trạng thái đơn hàng đã được cập nhật!",
      order,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi hệ thống khi cập nhật trạng thái đơn hàng!" });
  }
};

exports.refundOrder = (orderId) => {
  console.log("refuned order: " + orderId);
};
