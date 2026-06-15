const Order = require("../models/orderModel");
const Cart = require("../models/cartModel"); // Lấy giỏ hàng của người dùng
const Product = require("../models/productModel"); // Lấy thông tin sản phẩm
const removeCart = require("./cartController.js").removeCart;
const refundOrder = require("./orderProcessingController.js").refundOrder;
//Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  const userId = req.user.id; // Lấy userId từ middleware xác thực
  const { shippingAddress, paymentMethod } = req.body; // `items` là mảng chứa các sản phẩm và số lượng

  try {
    const cart = await Cart.findOne({ userId: userId });
    // Nếu không có `items`, trả về lỗi
    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Giỏ hàng không tồn tại hoặc giỏ hàng rỗng." });
    }

    // Kiểm tra xem các sản phẩm có trong cơ sở dữ liệu không và tính toán giá trị
    let totalPrice = cart.totalPrice;
    const orderItems = [];

    for (const item of cart.items) {
      // Thêm sản phẩm vào đơn hàng
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalPrice,
      shippingAddress,
      paymentMethod,
      paymentProvider: paymentMethod == "Tiá»n máº·t" ? "cash" : "payos",
      paymentStatus: paymentMethod == "Tiá»n máº·t" ? "unpaid" : "pending",
      status: "Chờ thanh toán", // Đặt trạng thái mặc định là "Chờ xử lý"
    });
    if (paymentMethod == "Tiền mặt") newOrder.status = "Chờ xử lý";
    // Lưu đơn hàng vào cơ sở dữ liệu
    await newOrder.save();
    await Cart.deleteOne({ userId });
    // Nếu bạn muốn xóa giỏ hàng sau khi tạo đơn hàng, có thể xóa giỏ hàng của người dùng ở đây
    // await Cart.findOneAndDelete({ userId });

    return res.status(201).json({
      message: "Đơn hàng đã được tạo thành công!",
      order: newOrder,
      cart: { items: [], totalPrice: 0 },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo đơn hàng!" });
  }
};

//Lấy danh sách đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    // Changed 'user' to 'userId' to match the schema field
    const orders = await Order.find({ userId: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('items.productId', 'name price image'); // Populate product details if needed
    
    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng nào."
      });
    }

    return res.status(200).json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng.",
      error: error.message
    });
  }
};

//Lấy chi tiết đơn hàng
exports.getUserOrderDetails = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id; // Lấy userId từ middleware xác thực

  try {
    // Tìm đơn hàng theo ID và người dùng
    const order = await Order.findOne({ _id: orderId, userId: userId });

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy." });
    }

    res.status(200).json({
      message: "Chi tiết đơn hàng",
      order,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi hệ thống khi lấy chi tiết đơn hàng!" });
  }
};

// Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
  const limit = parseInt(req.query.limit) || 10; // Mặc định mỗi trang sẽ hiển thị 10 s��n phẩm
  const skip = (page - 1) * limit;

  try {
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    // Lấy các sản phẩm trong trang hiện tại
    const orders = await Order.find().skip(skip).limit(limit);

    res.status(200).json({
      message: "Danh sách đơn hàng",
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi hệ thống!" });
  }
};

exports.cancelOrder = async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user.id; // Lấy userId từ middleware xác thực

  try {
    // Xóa đơn hàng
    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Đơn hàng không tìm thấy hoặc không phải của bạn.",
      });
    }

    if (["Đang giao", "Hoàn thành", "Đã hủy"].includes(order.status)) {
      return res.status(200).json({
        message: "Quá muộn để hủy hàng hoặc đơn đã được hủy!",
      });
    }

    if (order.status == "Chờ xử lý" && order.paymentMethod == "Chuyển khoản") {
      await refundOrder(orderId);
    }
    order.status = "Đã hủy";
    await order.save();
    res.status(200).json({
      message: "Đơn hàng đã được hủy!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi hủy đơn hàng!" });
  }
};
