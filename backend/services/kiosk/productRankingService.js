const Product = require("../../models/productModel");
const { normalize } = require("../preferenceExtractor");

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const textOf = (product) =>
  normalize([
    product.name,
    product.brand,
    product.category,
    product.description,
    product.descriptionVi,
    ...(product.useCases || []),
    ...(product.highlights?.en || []),
    ...(product.highlights?.vi || []),
    ...(product.tradeoffs?.en || []),
    ...(product.tradeoffs?.vi || []),
    ...Object.values(product.specs || {}),
  ].join(" "));

const categoryMatches = (product, category) => {
  if (!category) return true;
  if (product.category) {
    if (category === "accessory") {
      return ["accessory", "audio", "keyboard", "mouse", "monitor", "storage", "gaming"].includes(product.category);
    }
    return product.category === category;
  }
  const text = normalize(`${product.name} ${product.category} ${product.description} ${product.descriptionVi || ""}`);
  if (category === "phone") return /phone|iphone|smartphone|android|dien thoai/.test(text);
  if (category === "laptop") return /laptop|macbook|notebook/.test(text);
  if (category === "tablet") return /tablet|ipad|may tinh bang/.test(text);
  if (category === "accessory") return /accessory|headphone|keyboard|mouse|charger|case|chuot|ban phim|tai nghe/.test(text);
  return text.includes(category);
};

const useCaseTerms = {
  gaming: ["gaming", "game", "rtx", "gtx", "gpu", "144hz", "radeon"],
  studying: ["student", "study", "office", "portable", "battery", "durable"],
  programming: ["programming", "coding", "developer", "ram", "ssd", "i5", "i7", "ryzen"],
  office: ["office", "work", "excel", "word", "portable"],
  camera: ["camera", "48mp", "mp", "ois", "photo", "video"],
  battery: ["battery", "mah", "pin"],
  portability: ["light", "thin", "portable", "weight"],
  editing: ["editing", "creator", "render", "video", "photo", "rtx"],
  durability: ["durable", "metal", "aluminum", "ben"],
  value: ["cheap", "budget", "value", "affordable"],
};

const scoreProduct = (product, needs) => {
  const text = textOf(product);
  const budgetValue = Number(needs.budget);
  const budget = Number.isFinite(budgetValue) && budgetValue > 0 ? budgetValue : null;
  const categoryMatch = categoryMatches(product, needs.category);
  const brandMatch = (needs.preferredBrands || []).some((brand) => text.includes(normalize(brand)));
  const dislikedBrand = (needs.dislikedBrands || []).some((brand) => text.includes(normalize(brand)));
  const useMatches = [...(needs.useCases || []), ...(needs.importantFactors || [])].filter((item) =>
    (product.useCases || []).includes(item) || (useCaseTerms[item] || [item]).some((term) => text.includes(normalize(term))),
  );
  const specMatches = Object.entries(needs.minSpecs || needs.specs || {}).filter(([, value]) =>
    value ? text.includes(normalize(value)) : false,
  );

  const budgetScore = !budget
    ? 12
    : product.price <= budget
      ? 20
      : Math.max(0, 20 - Math.round(((product.price - budget) / budget) * 40));

  const scoreDetails = {
    categoryScore: categoryMatch ? (needs.category ? 20 : 8) : -25,
    budgetScore,
    useCaseScore: Math.min(25, useMatches.length * 9),
    specScore: Math.min(20, specMatches.length * 7),
    brandScore: brandMatch ? 10 : dislikedBrand ? -15 : 0,
    ratingScore: product.rating ? Math.min(10, Math.round(product.rating * 2)) : 0,
    availabilityScore: product.stock > 0 ? 5 : -10,
    valueScore: budget && product.price <= budget * 0.85 ? 5 : 0,
  };
  scoreDetails.total = Object.values(scoreDetails).reduce((sum, value) => sum + value, 0);

  return {
    scoreDetails,
    matchedUseCases: [...new Set(useMatches)],
    matchedSpecs: specMatches.map(([key]) => key),
  };
};

const productPayload = (product) => ({
  _id: product._id,
  name: product.name,
  brand: product.brand || "",
  description: product.description,
  descriptionVi: product.descriptionVi || "",
  price: product.price,
  stock: product.stock,
  image: product.image,
  images: product.images || [],
  category: product.category,
  specs: product.specs || {},
  useCases: product.useCases || [],
  highlights: product.highlights || { en: [], vi: [] },
  tradeoffs: product.tradeoffs || { en: [], vi: [] },
  rating: product.rating || null,
  reviewCount: product.reviewCount || 0,
  warranty: product.warranty || "",
});

const makeRecommendation = (product, needs, ranking) => {
  const useText = ranking.matchedUseCases.slice(0, 2).join(" and ");
  const budgetText = needs.budget && product.price <= needs.budget ? `fits ${formatCurrency(needs.budget)}` : "";
  const reasonBits = [
    budgetText ? "it stays within your budget" : "",
    useText ? `it lines up well with ${useText}` : "",
    ranking.matchedSpecs.length ? `the catalog shows useful specs like ${ranking.matchedSpecs.slice(0, 2).join(", ")}` : "",
    product.rating ? `it has a ${product.rating}/5 review signal` : "",
    product.stock > 0 ? "it is available now" : "",
  ].filter(Boolean);

  const tradeoff =
    product.tradeoffs?.en?.[0] ||
    (needs.budget && product.price > needs.budget
      ? `It is above your budget by about ${formatCurrency(product.price - needs.budget)}.`
      : ranking.scoreDetails.useCaseScore < 10 && needs.useCases?.length
        ? "The catalog does not show enough evidence that it is strong for every use case you mentioned."
        : "It is not perfect in every area, so compare price, portability, and performance before choosing.");

  return {
    product: productPayload(product),
    score: ranking.scoreDetails.total,
    scoreDetails: ranking.scoreDetails,
    reason: reasonBits.length
      ? `This is a sensible pick because ${reasonBits.slice(0, 3).join(", ")}.`
      : "This is one of the closer matches in the current catalog, but the product data is still missing richer specs.",
    tradeoff,
    bestFor: useText ? `Best for ${useText}.` : "Best for a balanced buyer.",
    notBestFor: product.tradeoffs?.en?.[0] || "Not best if your top priority is different from the needs you described.",
    betterThan: "",
    comparisonNote: "",
    nextAction: "View details, compare it with another option, or add it to cart.",
  };
};

const rankProducts = async (needs, limit = 5) => {
  const allProducts = await Product.find().limit(150);
  const categoryProducts = needs.category ? allProducts.filter((product) => categoryMatches(product, needs.category)) : allProducts;
  const candidates = categoryProducts.length >= 2 ? categoryProducts : allProducts;

  const ranked = candidates
    .map((product) => makeRecommendation(product, needs, scoreProduct(product, needs)))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  const top = ranked.slice(0, limit);
  return top.map((item, index) => ({
    ...item,
    betterThan:
      index === 0 && top[1]
        ? `Compared with ${top[1].product.name}, this is the safer first recommendation for your stated needs.`
        : top[0]
          ? `Compared with ${top[0].product.name}, this may be better if you prefer its price, brand, or design.`
          : "",
    comparisonNote:
      index === 0 && top[1]
        ? `Compared with ${top[1].product.name}, this is the safer first recommendation for your stated needs.`
        : top[0]
          ? `Compared with ${top[0].product.name}, this may be better if you prefer its price, brand, or design.`
          : "",
  }));
};

module.exports = {
  categoryMatches,
  formatCurrency,
  productPayload,
  rankProducts,
  scoreProduct,
};
