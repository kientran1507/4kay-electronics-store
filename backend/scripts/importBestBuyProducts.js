require("dotenv").config();
const mongoose = require("../db");
const Product = require("../models/productModel");
const { fetchBestBuyProducts, mapBestBuyProduct } = require("../services/productImport/bestBuyProvider");

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
  const keywords = (process.argv.slice(2).join(",") || process.env.BESTBUY_IMPORT_KEYWORDS || "laptop,gaming laptop,phone,tablet")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const summary = { imported: 0, updated: 0, skipped: 0, errors: 0 };

  for (const keyword of keywords) {
    try {
      const products = await fetchBestBuyProducts({ keyword });
      for (const raw of products) {
        const product = mapBestBuyProduct(raw);
        if (!product.name) {
          summary.skipped += 1;
          continue;
        }
        const result = await upsertProduct(product);
        summary[result] += 1;
      }
    } catch (error) {
      summary.errors += 1;
      console.error(`Best Buy import failed for "${keyword}":`, error.message);
    }
  }

  console.log("Best Buy import summary:", summary);
};

run().finally(async () => mongoose.connection.close());
