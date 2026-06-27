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

const localizedListSchema = new mongoose.Schema(
  {
    en: { type: [String], default: [] },
    vi: { type: [String], default: [] },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    descriptionVi: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    // Language-neutral key: phone, laptop, tablet, audio, keyboard, mouse, accessory.
    category: { type: String, required: true, trim: true, index: true },
    brand: { type: String, default: "", trim: true },
    specs: { type: specsSchema, default: {} },
    // Language-neutral recommendation keys such as gaming, study, camera, and battery.
    useCases: { type: [String], default: [], index: true },
    highlights: { type: localizedListSchema, default: () => ({}) },
    tradeoffs: { type: localizedListSchema, default: () => ({}) },
    rating: { type: Number, min: 0, max: 5, default: null },
    reviewCount: { type: Number, min: 0, default: 0 },
    warranty: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
