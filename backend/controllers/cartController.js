const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const formatCart = (cart) => ({
  items: (cart?.items || [])
    .filter((item) => item.productId)
    .map((item) => ({
      productId: item.productId._id || item.productId,
      quantity: item.quantity,
      price: item.productId.price ?? item.price / item.quantity,
      name: item.productId.name || "",
      category: item.productId.category || "",
      image: item.productId.image || "",
    })),
  totalPrice: cart?.totalPrice || 0,
});

const loadFormattedCart = async (cartId) => {
  const cart = await Cart.findById(cartId).populate("items.productId");
  return formatCart(cart);
};

exports.addToCart = async (req, res) => {
  const { productId } = req.body || {};
  const quantity = Number.parseInt(req.body?.quantity, 10);
  if (!productId || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "A product id and positive quantity are required." });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product does not exist." });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [], totalPrice: 0 });

    const item = cart.items.find((entry) => entry.productId.toString() === productId);
    const nextQuantity = (item?.quantity || 0) + quantity;
    if (nextQuantity > product.stock) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock." });
    }

    if (item) {
      item.quantity = nextQuantity;
      item.price = product.price * nextQuantity;
    } else {
      cart.items.push({ productId, quantity, price: product.price * quantity });
    }

    cart.totalPrice = cart.items.reduce((total, entry) => total + entry.price, 0);
    await cart.save();
    return res.status(200).json({ message: "Cart updated.", ...(await loadFormattedCart(cart._id)) });
  } catch (error) {
    console.error("Add to cart failed:", error.message);
    return res.status(500).json({ message: "Could not update cart." });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
    return res.status(200).json({
      message: cart ? "Cart loaded." : "Cart is empty.",
      ...formatCart(cart),
    });
  } catch (error) {
    console.error("Cart lookup failed:", error.message);
    return res.status(500).json({ message: "Could not load cart." });
  }
};

exports.removeCart = async (req, res) => {
  try {
    await Cart.deleteOne({ userId: req.user.id });
    return res.status(200).json({ message: "Cart cleared.", items: [], totalPrice: 0 });
  } catch (error) {
    console.error("Cart removal failed:", error.message);
    return res.status(500).json({ message: "Could not clear cart." });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ message: "Product id is required." });

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(200).json({ message: "Cart is empty.", items: [], totalPrice: 0 });

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    if (!cart.items.length) {
      await Cart.deleteOne({ _id: cart._id });
      return res.status(200).json({ message: "Item removed.", items: [], totalPrice: 0 });
    }

    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    await cart.save();
    return res.status(200).json({ message: "Item removed.", ...(await loadFormattedCart(cart._id)) });
  } catch (error) {
    console.error("Cart item removal failed:", error.message);
    return res.status(500).json({ message: "Could not remove cart item." });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  const { productId } = req.body || {};
  const quantity = Number.parseInt(req.body?.quantity, 10);
  if (!productId || !Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ message: "Product id and a non-negative quantity are required." });
  }
  if (quantity === 0) return exports.removeFromCart(req, res);

  try {
    const [cart, product] = await Promise.all([
      Cart.findOne({ userId: req.user.id }),
      Product.findById(productId),
    ]);
    if (!cart) return res.status(404).json({ message: "Cart does not exist." });
    if (!product) return res.status(404).json({ message: "Product does not exist." });
    if (quantity > product.stock) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock." });
    }

    const item = cart.items.find((entry) => entry.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product is not in the cart." });

    item.quantity = quantity;
    item.price = product.price * quantity;
    cart.totalPrice = cart.items.reduce((total, entry) => total + entry.price, 0);
    await cart.save();
    return res.status(200).json({ message: "Cart updated.", ...(await loadFormattedCart(cart._id)) });
  } catch (error) {
    console.error("Cart quantity update failed:", error.message);
    return res.status(500).json({ message: "Could not update cart." });
  }
};

exports.formatCart = formatCart;
