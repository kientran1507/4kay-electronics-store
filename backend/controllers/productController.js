const mongoose = require("mongoose");
const Product = require("../models/productModel");

const writableFields = [
  "name", "description", "price", "currency", "originalPrice",
  "originalCurrency", "stock", "image", "images", "category", "brand",
  "shortDescription", "longDescription", "specs", "useCases", "strengths",
  "weaknesses", "bestFor", "notBestFor", "reviewSummary", "tags", "rating",
  "reviewCount", "source", "sourceProductId", "sourceUrl", "availability",
  "warranty", "releaseYear",
];

const pickProductFields = (body = {}) =>
  Object.fromEntries(
    writableFields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]]),
  );

const getPagination = (query) => ({
  page: Math.max(1, Number.parseInt(query.page, 10) || 1),
  limit: Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10)),
});

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(pickProductFields(req.body));
    return res.status(201).json({ message: "Product created.", product });
  } catch (error) {
    console.error("Product creation failed:", error.message);
    return res.status(400).json({ message: error.message || "Could not create product." });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: pickProductFields(req.body) },
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ message: "Product does not exist." });
    return res.status(200).json({ message: "Product updated.", product });
  } catch (error) {
    console.error("Product update failed:", error.message);
    return res.status(400).json({ message: error.message || "Could not update product." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product does not exist." });
    return res.status(200).json({ message: "Product deleted." });
  } catch (error) {
    console.error("Product deletion failed:", error.message);
    return res.status(400).json({ message: "Could not delete product." });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    if (!req.query.page && !req.query.limit) {
      const products = await Product.find();
      return res.status(200).json({
        message: "Product list.",
        products,
        currentPage: 1,
        totalPages: 1,
        totalProducts,
      });
    }

    const { page, limit } = getPagination(req.query);
    const products = await Product.find().skip((page - 1) * limit).limit(limit);
    return res.status(200).json({
      message: "Product list.",
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error("Product list failed:", error.message);
    return res.status(500).json({ message: "Could not load products." });
  }
};

exports.getProductById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id." });
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product does not exist." });
    return res.status(200).json({ message: "Product found.", product });
  } catch (error) {
    console.error("Product lookup failed:", error.message);
    return res.status(500).json({ message: "Could not load product." });
  }
};

exports.findProducts = async (req, res) => {
  const keyword = String(req.query.keyword || "").trim();
  if (!keyword) return res.status(400).json({ message: "A search keyword is required." });

  const { page, limit } = getPagination(req.query);
  const value = escapeRegex(keyword);
  const search = {
    $or: [
      { name: { $regex: value, $options: "i" } },
      { description: { $regex: value, $options: "i" } },
      { category: { $regex: value, $options: "i" } },
      { brand: { $regex: value, $options: "i" } },
    ],
  };

  try {
    const [products, totalProducts] = await Promise.all([
      Product.find(search).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(search),
    ]);
    return res.status(200).json({
      message: "Search results.",
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error("Product search failed:", error.message);
    return res.status(500).json({ message: "Could not search products." });
  }
};

exports.findProductsByCategory = async (req, res) => {
  const category = String(req.query.category || "").trim();
  if (!category) return res.status(400).json({ message: "Category is required." });

  const { page, limit } = getPagination(req.query);
  const priceRanges = {
    under1m: { $lt: 1_000_000 },
    "1mTo3m": { $gte: 1_000_000, $lt: 3_000_000 },
    "3mTo10m": { $gte: 3_000_000, $lt: 10_000_000 },
    "10mTo20m": { $gte: 10_000_000, $lt: 20_000_000 },
    above20m: { $gte: 20_000_000 },
  };
  const filter = {
    category: { $regex: `^${escapeRegex(category)}$`, $options: "i" },
  };
  if (priceRanges[req.query.priceRange]) filter.price = priceRanges[req.query.priceRange];

  try {
    const [products, totalProducts] = await Promise.all([
      Product.find(filter).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);
    return res.status(200).json({
      message: "Category products.",
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error("Category lookup failed:", error.message);
    return res.status(500).json({ message: "Could not load category products." });
  }
};

exports.pickProductFields = pickProductFields;
exports.escapeRegex = escapeRegex;
