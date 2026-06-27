require("dotenv").config();
const mongoose = require("mongoose");
const Voucher = require("../models/voucherModel");

const vouchers = [
  {
    code: "STUDENT10",
    description: "10% off for student laptop and tablet orders.",
    type: "percentage",
    value: 10,
    maxDiscount: 1500000,
    minOrderValue: 5000000,
    appliesToCategories: ["Laptop", "Laptops", "Tablet", "Tablets"],
    active: true,
  },
  {
    code: "FREESHIP",
    description: "Small fixed discount to offset delivery fees.",
    type: "fixed",
    value: 50000,
    maxDiscount: 50000,
    minOrderValue: 1000000,
    active: true,
  },
  {
    code: "PHONE500",
    description: "500,000 VND off eligible phone orders.",
    type: "fixed",
    value: 500000,
    maxDiscount: 500000,
    minOrderValue: 10000000,
    appliesToCategories: ["Phone", "Phones", "Điện thoại", "Äiá»‡n thoáº¡i"],
    active: true,
  },
];

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI in backend environment.");
  }

  await mongoose.connect(uri);
  for (const voucher of vouchers) {
    await Voucher.findOneAndUpdate(
      { code: voucher.code },
      { $set: voucher },
      { upsert: true, new: true },
    );
  }
  await mongoose.disconnect();
  console.log(`Seeded ${vouchers.length} vouchers.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
