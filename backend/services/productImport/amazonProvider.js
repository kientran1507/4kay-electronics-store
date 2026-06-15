const fs = require("fs");
const path = require("path");
const { normalizeExternalProduct } = require("./productNormalizer");

const hasAmazonCredentials = () =>
  Boolean(process.env.AMAZON_ACCESS_KEY && process.env.AMAZON_SECRET_KEY && process.env.AMAZON_PARTNER_TAG);

const fetchAmazonProducts = async () => {
  if (!hasAmazonCredentials()) {
    console.log("Amazon API credentials are missing. Skipping official API fetch. Use local JSON/CSV import instead.");
    return [];
  }

  console.log("Amazon official API integration placeholder. Do not scrape Amazon pages directly.");
  return [];
};

const loadAmazonDataset = (filePath = "data/amazon-products.json") => {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) return [];
  const content = fs.readFileSync(absolutePath, "utf8");
  if (absolutePath.endsWith(".json")) {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.products || [];
  }
  throw new Error("Amazon local dataset currently supports JSON in this provider.");
};

const mapAmazonProduct = (product) =>
  normalizeExternalProduct(product, "amazon", Number(process.env.USD_TO_VND || 25000));

module.exports = {
  fetchAmazonProducts,
  loadAmazonDataset,
  mapAmazonProduct,
};
