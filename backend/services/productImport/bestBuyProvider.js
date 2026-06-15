const { normalizeExternalProduct } = require("./productNormalizer");

const fetchBestBuyProducts = async ({ keyword, page = 1, pageSize = 20 }) => {
  if (!process.env.BESTBUY_API_KEY) {
    throw new Error("BESTBUY_API_KEY is missing.");
  }

  const query = encodeURIComponent(`search=${keyword}`);
  const url = `https://api.bestbuy.com/v1/products(${query})?apiKey=${process.env.BESTBUY_API_KEY}&format=json&page=${page}&pageSize=${pageSize}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Best Buy API failed: ${response.status}`);
  const data = await response.json();
  return data.products || [];
};

const mapBestBuyProduct = (product) =>
  normalizeExternalProduct(
    {
      ...product,
      features: product.features?.map((item) => item.feature) || [],
      specifications: Object.fromEntries((product.details || []).map((item) => [item.name, item.value])),
    },
    "bestbuy",
    Number(process.env.USD_TO_VND || 25000),
  );

module.exports = {
  fetchBestBuyProducts,
  mapBestBuyProduct,
};
