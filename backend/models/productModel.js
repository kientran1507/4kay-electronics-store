const mongoose = require("mongoose");

const specsSchema = new mongoose.Schema(
  {
    cpu: String,
    gpu: String,
    ram: String,
    storage: String,
    screenSize: String,
    battery: String,
    camera: String,
    weight: String,
    operatingSystem: String,
  },
  { _id: false, strict: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "VND",
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    originalCurrency: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      required: true,
    },
    image: {
      type: String, // Lưu URL của ảnh sản phẩm
      required: false,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    longDescription: {
      type: String,
      default: "",
    },
    specs: {
      type: specsSchema,
      default: {},
    },
    useCases: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    bestFor: {
      type: [String],
      default: [],
    },
    notBestFor: {
      type: [String],
      default: [],
    },
    reviewSummary: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    source: {
      type: String,
      default: "local",
    },
    sourceProductId: {
      type: String,
      default: "",
    },
    sourceUrl: {
      type: String,
      default: "",
    },
    availability: {
      type: String,
      default: "",
    },
    warranty: {
      type: String,
      default: "",
    },
    releaseYear: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
