require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/productModel");

const obsoleteFields = [
  "availability", "bestFor", "categoryKey", "currency", "longDescription",
  "notBestFor", "originalCurrency", "originalPrice", "releaseYear",
  "reviewSummary", "searchTerms", "shortDescription", "source",
  "sourceProductId", "sourceUrl", "strengthKeys", "strengths", "tags",
  "translations", "useCaseKeys", "weaknessKeys", "weaknesses",
];

const unique = (values = []) => [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];

const normalizeCategory = (product) => {
  const name = String(product.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const text = `${name} ${product.category || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/laptop|notebook|macbook|vivobook|inspiron/.test(text)) return "laptop";
  if (/tablet|ipad|matepad|redmi.?pad|xiaomi.?pad|galaxy.?tab|lenovo.?tab|may tinh bang|\bpad\b|\btab\b/.test(text)) return "tablet";
  if (/headphone|earbud|airpod|audio|tai nghe/.test(text)) return "audio";
  if (/keyboard|keychron|ban phim/.test(text)) return "keyboard";
  if (/mouse|mice|chuot/.test(text)) return "mouse";
  if (/phone|iphone|smartphone|dien thoai/.test(text)) return "phone";
  if (product.categoryKey) return product.categoryKey;
  return "accessory";
};

const normalizeUseCases = (product) => unique(
  (product.useCaseKeys?.length ? product.useCaseKeys : product.useCases || [])
    .map((value) => ({ studying: "study", "office work": "office", "battery life": "battery" }[value] || value)),
);

const compactProduct = (product) => ({
  name: product.name,
  description: product.translations?.en?.description || product.description || product.name,
  descriptionVi: product.translations?.vi?.description || product.descriptionVi || product.description || "",
  price: product.price,
  stock: product.stock,
  image: product.image || "",
  images: unique(product.images || []),
  category: normalizeCategory(product),
  brand: product.brand || "",
  specs: product.specs || {},
  useCases: normalizeUseCases(product),
  highlights: {
    en: unique(product.translations?.en?.strengths || product.highlights?.en || product.strengths || []),
    vi: unique(product.translations?.vi?.strengths || product.highlights?.vi || product.strengths || []),
  },
  tradeoffs: {
    en: unique(product.translations?.en?.weaknesses || product.tradeoffs?.en || product.weaknesses || []),
    vi: unique(product.translations?.vi?.weaknesses || product.tradeoffs?.vi || product.weaknesses || []),
  },
  rating: product.rating ?? null,
  reviewCount: product.reviewCount || 0,
  warranty: product.warranty || "",
});

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI or MONGO_URI.");

  await mongoose.connect(uri);
  const products = await Product.collection.find({}).toArray();
  if (!products.length) {
    console.log("No products found.");
    return;
  }

  const backupName = `products_before_simplification_${new Date().toISOString().replace(/[-:.TZ]/g, "")}`;
  await mongoose.connection.db.collection(backupName).insertMany(products);

  const unset = Object.fromEntries(obsoleteFields.map((field) => [field, ""]));
  const operations = products.map((product) => ({
    updateOne: {
      filter: { _id: product._id },
      update: { $set: compactProduct(product), $unset: unset },
    },
  }));
  await Product.collection.bulkWrite(operations);
  const indexes = await Product.collection.indexes();
  for (const index of indexes) {
    if (index.name !== "_id_" && Object.keys(index.key).some((field) => obsoleteFields.includes(field))) {
      await Product.collection.dropIndex(index.name);
    }
  }
  await Product.collection.createIndex({ category: 1 });
  await Product.collection.createIndex({ useCases: 1 });
  console.log(`Simplified ${products.length} products. Backup collection: ${backupName}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => mongoose.disconnect());
