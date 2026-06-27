require("dotenv").config();
const mongoose = require("../db");
const Product = require("../models/productModel");
const {
  fetchAmazonProducts,
  loadAmazonDataset,
  mapAmazonProduct,
} = require("../services/productImport/amazonProvider");

const upsertProduct = async (product) => {
  const existing = await Product.findOne({ name: product.name });
  if (existing) {
    await Product.findByIdAndUpdate(existing._id, product);
    return "updated";
  }
  await Product.create(product);
  return "imported";
};

const run = async () => {
  const datasetPath = process.argv[2];
  const rawProducts = datasetPath ? loadAmazonDataset(datasetPath) : await fetchAmazonProducts();
  const summary = { imported: 0, updated: 0, skipped: 0, errors: 0 };

  for (const raw of rawProducts) {
    try {
      const product = mapAmazonProduct(raw);
      if (!product.name) {
        summary.skipped += 1;
        continue;
      }
      const result = await upsertProduct(product);
      summary[result] += 1;
    } catch (error) {
      summary.errors += 1;
      console.error("Amazon import row failed:", error.message);
    }
  }

  console.log("Amazon import summary:", summary);
};

run().finally(async () => mongoose.connection.close());
