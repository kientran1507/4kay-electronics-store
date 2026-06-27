const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Voucher = require("../models/voucherModel");

const FREE_SHIPPING_MIN = Number(process.env.FREE_SHIPPING_MIN || 20000000);

const shippingZones = [
  {
    key: "same_city",
    label: "Same city",
    fee: Number(process.env.SHIPPING_SAME_CITY_FEE || 25000),
    keywords: [
      "ho chi minh",
      "hcm",
      "tp hcm",
      "tphcm",
      "sai gon",
      "saigon",
      "thu duc",
    ],
  },
  {
    key: "nearby_province",
    label: "Nearby province",
    fee: Number(process.env.SHIPPING_NEARBY_FEE || 35000),
    keywords: [
      "binh duong",
      "dong nai",
      "long an",
      "tay ninh",
      "ba ria",
      "vung tau",
      "tien giang",
    ],
  },
  {
    key: "remote_area",
    label: "Remote area",
    fee: Number(process.env.SHIPPING_REMOTE_FEE || 70000),
    keywords: [
      "ha giang",
      "cao bang",
      "lao cai",
      "dien bien",
      "lai chau",
      "son la",
      "kon tum",
      "dak nong",
      "ca mau",
      "phu quoc",
    ],
  },
];

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function detectShippingZone(address = "") {
  const normalized = normalizeText(address);
  const zone = shippingZones.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return zone || {
    key: "national",
    label: "National delivery",
    fee: Number(process.env.SHIPPING_NATIONAL_FEE || 50000),
    keywords: [],
  };
}

function calculateShippingFee(subtotal, address = "") {
  const zone = detectShippingZone(address);
  const freeShipping = subtotal >= FREE_SHIPPING_MIN;

  return {
    shippingFee: freeShipping ? 0 : zone.fee,
    shippingZone: zone.key,
    shippingLabel: freeShipping ? "Free shipping" : zone.label,
    freeShippingMin: FREE_SHIPPING_MIN,
  };
}

function validateVoucher(voucher, subtotal, items) {
  if (!voucher) return { valid: true };
  if (!voucher.active) return { valid: false, message: "This voucher is not active." };

  const now = new Date();
  if (voucher.startDate && voucher.startDate > now) {
    return { valid: false, message: "This voucher is not active yet." };
  }
  if (voucher.endDate && voucher.endDate < now) {
    return { valid: false, message: "This voucher has expired." };
  }
  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
    return { valid: false, message: "This voucher has reached its usage limit." };
  }
  if (subtotal < voucher.minOrderValue) {
    return {
      valid: false,
      message: `This voucher requires a minimum order of ${voucher.minOrderValue} VND.`,
    };
  }

  const categories = (voucher.appliesToCategories || []).map(normalizeText);
  const productIds = (voucher.appliesToProducts || []).map((id) => String(id));
  if (categories.length || productIds.length) {
    const hasEligibleItem = items.some((item) => {
      const product = item.product || {};
      return categories.includes(normalizeText(product.category)) || productIds.includes(String(product._id));
    });
    if (!hasEligibleItem) {
      return { valid: false, message: "This voucher does not apply to items in your cart." };
    }
  }

  return { valid: true };
}

function calculateVoucherDiscount(voucher, subtotal) {
  if (!voucher) return 0;

  if (voucher.type === "fixed") {
    return Math.min(voucher.value, subtotal);
  }

  const discount = Math.floor((subtotal * voucher.value) / 100);
  return Math.min(discount, voucher.maxDiscount || discount, subtotal);
}

async function buildCartPricing(userId, { shippingAddress = "", voucherCode = "" } = {}) {
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    const error = new Error("Cart does not exist or is empty.");
    error.statusCode = 400;
    throw error;
  }

  const productIds = cart.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const items = cart.items.map((item) => {
    const product = productMap.get(String(item.productId));
    const price = product ? product.price : item.price;
    return {
      product,
      productId: item.productId,
      quantity: item.quantity,
      price,
      lineTotal: price * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const normalizedVoucherCode = String(voucherCode || "").trim().toUpperCase();
  const voucher = normalizedVoucherCode
    ? await Voucher.findOne({ code: normalizedVoucherCode })
    : null;

  if (normalizedVoucherCode && !voucher) {
    const error = new Error("Voucher code was not found.");
    error.statusCode = 400;
    throw error;
  }

  const voucherValidation = validateVoucher(voucher, subtotal, items);
  if (!voucherValidation.valid) {
    const error = new Error(voucherValidation.message);
    error.statusCode = 400;
    throw error;
  }

  const discountAmount = calculateVoucherDiscount(voucher, subtotal);
  const shipping = calculateShippingFee(subtotal - discountAmount, shippingAddress);
  const totalPrice = Math.max(0, subtotal - discountAmount + shipping.shippingFee);

  return {
    items,
    subtotal,
    voucher,
    voucherCode: voucher ? voucher.code : "",
    discountAmount,
    ...shipping,
    totalPrice,
  };
}

module.exports = {
  FREE_SHIPPING_MIN,
  calculateShippingFee,
  calculateVoucherDiscount,
  detectShippingZone,
  validateVoucher,
  buildCartPricing,
};
