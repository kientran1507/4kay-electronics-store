const Product = require("../models/productModel");
const { normalize } = require("./preferenceExtractor");

const USE_CASE_TERMS = {
  gaming: ["gaming", "game", "rtx", "gtx", "radeon", "gpu", "144hz"],
  studying: ["student", "study", "school", "office", "portable", "battery"],
  study: ["student", "study", "school", "portable", "battery"],
  office: ["office", "work", "business", "word", "excel", "portable"],
  programming: ["programming", "coding", "developer", "ram", "ssd", "i5", "i7", "ryzen"],
  editing: ["editing", "creator", "render", "photo", "video", "rtx", "oled"],
  battery: ["battery", "mah", "pin"],
  portability: ["light", "thin", "portable", "inch"],
  camera: ["camera", "mp", "photo", "video", "ois"],
  durability: ["durable", "metal", "aluminum", "ben"],
  value: ["cheap", "budget", "affordable", "value", "gia tot"],
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const validBudget = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};

const localizedList = (field, locale = "en") =>
  field?.[locale]?.length ? field[locale] : field?.en || field?.vi || [];

const productText = (product) =>
  normalize([
    product.name,
    product.description,
    product.descriptionVi,
    product.brand,
    product.category,
    ...(product.useCases || []),
    ...localizedList(product.highlights, "en"),
    ...localizedList(product.highlights, "vi"),
    ...localizedList(product.tradeoffs, "en"),
    ...localizedList(product.tradeoffs, "vi"),
    ...Object.values(product.specs || {}),
  ].join(" "));

const matchesCategory = (product, category) => {
  if (!category) return true;
  if (product.category) {
    if (category === "accessory") {
      return ["accessory", "audio", "keyboard", "mouse", "monitor", "storage", "gaming"].includes(product.category);
    }
    return product.category === category;
  }
  const text = productText(product);
  if (category === "phone") return /phone|iphone|smartphone|android|dien thoai/.test(text);
  if (category === "laptop") return /laptop|macbook|notebook/.test(text);
  if (category === "tablet") return /tablet|ipad|may tinh bang/.test(text);
  if (category === "accessory") return /accessory|audio|headphone|keyboard|mouse|charger|case|chuot|ban phim|tai nghe/.test(text);
  return text.includes(normalize(category));
};

const matchUseCases = (product, useCases = []) => {
  const text = productText(product);
  const keys = new Set(product.useCases || []);
  return useCases.filter((useCase) => {
    const terms = USE_CASE_TERMS[useCase] || [useCase];
    return keys.has(useCase) || terms.some((term) => text.includes(normalize(term)));
  });
};

const matchSpecs = (product, specs = {}) => {
  const text = productText(product);
  return Object.entries(specs)
    .filter(([, value]) => value && text.includes(normalize(value)))
    .map(([key]) => key);
};

const getRatingScore = (product) => {
  if (!product.rating) return 0;
  const ratingScore = Math.max(0, Math.min(5, product.rating)) * 2;
  const confidence = product.reviewCount ? Math.min(5, Math.log10(product.reviewCount + 1) * 2) : 0;
  return ratingScore + confidence;
};

const scoreProduct = (product, needs = {}) => {
  let score = 0;
  const budget = validBudget(needs.budget);
  const category = needs.category || needs.deviceType;
  const text = productText(product);
  const details = {
    categoryMatch: false,
    budgetMatch: false,
    brandMatch: false,
    avoidedBrandMatch: false,
    matchedUseCases: [],
    matchedSpecs: [],
  };

  if (matchesCategory(product, category)) {
    details.categoryMatch = Boolean(category);
    score += category ? 32 : 0;
  } else if (category) score -= 45;

  if (budget) {
    if (product.price <= budget) {
      details.budgetMatch = true;
      score += 28;
    } else {
      score -= Math.min(35, ((product.price - budget) / budget) * 55);
    }
  }

  const preferredBrands = needs.preferredBrands || (needs.brand ? [needs.brand] : []);
  if (preferredBrands.some((brand) => text.includes(normalize(brand)))) {
    details.brandMatch = true;
    score += 14;
  }
  if ((needs.avoidedBrands || []).some((brand) => text.includes(normalize(brand)))) {
    details.avoidedBrandMatch = true;
    score -= 60;
  }

  details.matchedUseCases = matchUseCases(product, [...(needs.useCases || []), ...(needs.importantFactors || [])]);
  details.matchedSpecs = matchSpecs(product, needs.specs);
  score += details.matchedUseCases.length * 10;
  score += details.matchedSpecs.length * 8;
  score += getRatingScore(product);
  score += product.stock > 0 ? 6 : -18;

  return { score: Math.round(score), details };
};

const buildReason = (product, needs, scoring, locale = "en") => {
  const parts = [];
  if (scoring.details.categoryMatch) parts.push(locale === "vi" ? "đúng loại thiết bị bạn cần" : "it is the device type you asked for");
  if (scoring.details.budgetMatch) parts.push(locale === "vi" ? `nằm trong ngân sách ${formatCurrency(needs.budget)}` : `it stays within ${formatCurrency(needs.budget)}`);
  if (scoring.details.brandMatch) parts.push(locale === "vi" ? "đúng thương hiệu bạn thích" : "it matches your preferred brand");
  if (scoring.details.matchedUseCases.length) {
    parts.push(locale === "vi" ? `phù hợp cho ${scoring.details.matchedUseCases.slice(0, 2).join(" và ")}` : `it fits ${scoring.details.matchedUseCases.slice(0, 2).join(" and ")}`);
  }
  const highlight = localizedList(product.highlights, locale)[0];
  if (highlight) parts.push(highlight);
  if (!parts.length) return locale === "vi" ? "Đây là một trong những lựa chọn phù hợp nhất trong danh mục hiện tại." : "This is one of the closest matches in the current catalog.";
  return locale === "vi" ? `Tôi gợi ý sản phẩm này vì ${parts.slice(0, 3).join(", ")}.` : `I recommend this because ${parts.slice(0, 3).join(", ")}.`;
};

const buildTradeoff = (product, needs, locale = "en") => {
  const savedTradeoff = localizedList(product.tradeoffs, locale)[0];
  if (savedTradeoff) return savedTradeoff;
  if (needs.budget && product.price > needs.budget) {
    return locale === "vi" ? `Sản phẩm cao hơn ngân sách khoảng ${formatCurrency(product.price - needs.budget)}.` : `It is above your budget by about ${formatCurrency(product.price - needs.budget)}.`;
  }
  if (product.stock <= 0) return locale === "vi" ? "Sản phẩm hiện đã hết hàng." : "It is not currently in stock.";
  if (needs.useCases?.includes("gaming") && !/rtx|gtx|radeon|gpu/i.test(productText(product))) {
    return locale === "vi" ? "Phù hợp game nhẹ hơn là game nặng." : "It is better suited to light gaming than demanding games.";
  }
  return locale === "vi" ? "Hãy cân đối giá, hiệu năng và tính di động trước khi chọn." : "Balance its price, performance, and portability before choosing.";
};

const buildBestFor = (product, needs, locale = "en") => {
  const uses = needs.useCases?.length ? needs.useCases : product.useCases;
  if (!uses?.length) return locale === "vi" ? "Nhu cầu sử dụng cân bằng." : "Balanced everyday use.";
  return locale === "vi" ? `Phù hợp cho ${uses.slice(0, 2).join(" và ")}.` : `Best for ${uses.slice(0, 2).join(" and ")}.`;
};

const toProductPayload = (product, locale = "en") => ({
  _id: product._id,
  name: product.name,
  description: locale === "vi" && product.descriptionVi ? product.descriptionVi : product.description,
  descriptionVi: product.descriptionVi || "",
  price: product.price,
  stock: product.stock,
  image: product.image,
  images: product.images || [],
  category: product.category,
  brand: product.brand || "",
  specs: product.specs || {},
  useCases: product.useCases || [],
  highlights: product.highlights || { en: [], vi: [] },
  tradeoffs: product.tradeoffs || { en: [], vi: [] },
  rating: product.rating || null,
  reviewCount: product.reviewCount || 0,
  warranty: product.warranty || "",
});

const toRecommendation = (product, needs, scoring, locale = "en") => ({
  product: toProductPayload(product, locale),
  score: scoring.score,
  reason: buildReason(product, needs, scoring, locale),
  tradeoff: buildTradeoff(product, needs, locale),
  betterThan: "",
  bestFor: buildBestFor(product, needs, locale),
});

const getCandidateProducts = async (needs) => {
  const query = {};
  const budget = validBudget(needs.budget);
  if (budget) query.price = { $lte: Math.round(budget * 1.25) };
  const products = await Product.find(query).limit(100);
  const fallback = products.length ? products : await Product.find().limit(100);
  const category = needs.category || needs.deviceType;
  const typed = category ? fallback.filter((product) => matchesCategory(product, category)) : fallback;
  return typed.length >= 3 ? typed : fallback;
};

const recommendProducts = async (needs, limit = 5, locale = "en") => {
  const safeNeeds = { ...needs, budget: validBudget(needs.budget) };
  const candidates = await getCandidateProducts(safeNeeds);
  const ranked = candidates
    .map((product) => toRecommendation(product, safeNeeds, scoreProduct(product, safeNeeds), locale))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);
  const recommendedProducts = ranked.slice(0, limit).map((item, index, top) => ({
    ...item,
    betterThan: top[index + 1]
      ? locale === "vi" ? `Phù hợp hơn ${top[index + 1].product.name} với nhu cầu bạn đã nêu.` : `A stronger match than ${top[index + 1].product.name} for your stated needs.`
      : "",
  }));
  const alternatives = ranked.slice(limit, limit + 3).map((item) => ({
    product: item.product,
    reason: locale === "vi" ? "Một lựa chọn khác đáng xem nếu bạn ưu tiên giá hoặc thương hiệu." : "Worth checking if you prioritize its price or brand.",
  }));
  return { recommendedProducts, alternatives };
};

const compareProducts = async (message, limit = 4, locale = "en") => {
  const pieces = message.split(/\b(?:and|vs|versus|compare|with|,|&)\b/i).map((piece) => piece.trim()).filter((piece) => piece.length > 2);
  const productQueries = pieces.slice(0, limit).map((piece) => ({
    $or: [
      { name: { $regex: piece, $options: "i" } },
      { description: { $regex: piece, $options: "i" } },
      { descriptionVi: { $regex: piece, $options: "i" } },
    ],
  }));
  const products = productQueries.length ? await Product.find({ $or: productQueries }).limit(limit) : [];
  return {
    recommendedProducts: products.map((product) => toRecommendation(product, {}, scoreProduct(product, {}), locale)),
    alternatives: [],
  };
};

module.exports = { compareProducts, recommendProducts };
