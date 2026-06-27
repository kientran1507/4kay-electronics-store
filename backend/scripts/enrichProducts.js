require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("../db");
const Product = require("../models/productModel");

const inputPath = process.argv[2];

const splitList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(/[|;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseScalar = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
};

const parseSpecs = (row) => {
  if (row.specs && typeof row.specs === "object") return row.specs;
  if (row.specs && typeof row.specs === "string") {
    try {
      return JSON.parse(row.specs);
    } catch {
      return {};
    }
  }

  return {
    cpu: row.cpu,
    gpu: row.gpu,
    ram: row.ram,
    storage: row.storage,
    screenSize: row.screenSize || row.screen,
    battery: row.battery,
    camera: row.camera,
    weight: row.weight,
    operatingSystem: row.operatingSystem || row.os,
  };
};

const parseCsvLine = (line) => {
  const values = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value);
  return values.map((item) => item.trim());
};

const parseCsv = (content) => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
};

const loadRows = (filePath) => {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, "utf8");
  if (absolutePath.endsWith(".json")) {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.products || [];
  }
  if (absolutePath.endsWith(".csv")) return parseCsv(content);
  throw new Error("Only .json and .csv enrichment files are supported.");
};

const mapRowToProductUpdate = (row) => ({
  specs: parseSpecs(row),
  useCases: splitList(row.useCases || row.use_cases),
  descriptionVi: row.descriptionVi || row.description_vi,
  highlights: {
    en: splitList(row.highlightsEn || row.highlights_en || row.strengths),
    vi: splitList(row.highlightsVi || row.highlights_vi),
  },
  tradeoffs: {
    en: splitList(row.tradeoffsEn || row.tradeoffs_en || row.weaknesses),
    vi: splitList(row.tradeoffsVi || row.tradeoffs_vi),
  },
  rating: parseScalar(row.rating),
  reviewCount: parseScalar(row.reviewCount || row.review_count),
});

const removeUndefined = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null) return false;
      if (Array.isArray(entry)) return entry.length > 0;
      if (typeof entry === "object") return Object.values(entry).some(Boolean);
      return entry !== "";
    }),
  );

const findProduct = async (row) => {
  if (row._id || row.id || row.productId) {
    const byId = await Product.findById(row._id || row.id || row.productId);
    if (byId) return byId;
  }

  if (row.name) {
    const escapedName = String(row.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return Product.findOne({ name: { $regex: `^${escapedName}$`, $options: "i" } });
  }

  return null;
};

const run = async () => {
  if (!inputPath) {
    console.error("Usage: node scripts/enrichProducts.js <products.json|products.csv>");
    process.exitCode = 1;
    return;
  }

  const rows = loadRows(inputPath);
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const product = await findProduct(row);
    if (!product) {
      skipped += 1;
      continue;
    }

    const update = removeUndefined(mapRowToProductUpdate(row));
    await Product.findByIdAndUpdate(product._id, update, { new: true });
    updated += 1;
  }

  console.log(`Enrichment complete. Updated ${updated} products. Skipped ${skipped} rows.`);
};

run()
  .catch((error) => {
    console.error("Failed to enrich products:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
