const Product = require("../models/productModel");
const { normalize } = require("./preferenceExtractor");

const USE_CASE_TERMS = {
  gaming: ["gaming", "game", "rtx", "gtx", "radeon", "gpu", "refresh", "hz", "144hz"],
  studying: ["student", "study", "office", "portable", "battery", "light"],
  office: ["office", "work", "business", "word", "excel", "portable"],
  programming: ["programming", "coding", "developer", "ram", "ssd", "i5", "i7", "ryzen"],
  editing: ["editing", "creator", "render", "photo", "video", "rtx", "oled"],
  battery: ["battery", "mah", "pin"],
  portability: ["light", "thin", "portable", "inch"],
  camera: ["camera", "mp", "photo", "video", "ois"],
  durability: ["durable", "metal", "aluminum", "bền", "ben"],
  value: ["cheap", "budget", "affordable", "value"],
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const asArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
};

const productText = (product) =>
  normalize([
    product.name,
    product.description,
    product.category,
    ...(product.useCases || []),
    ...(product.strengths || []),
    ...(product.weaknesses || []),
    ...(product.bestFor || []),
    ...(product.notBestFor || []),
    ...(product.tags || []),
    product.reviewSummary,
    ...Object.values(product.specs || {}),
  ].join(" "));

const productIdentityText = (product) => normalize(`${product.name} ${product.category}`);

const matchesCategory = (product, category) => {
  if (!category) return true;
  const text = productIdentityText(product);
  if (category === "phone") return /phone|iphone|smartphone|android|dien thoai/.test(text);
  if (category === "laptop") return /laptop|macbook|notebook/.test(text);
  if (category === "tablet") return /tablet|ipad|may tinh bang/.test(text);
  if (category === "accessory") return /accessory|headphone|keyboard|mouse|charger|case|chuot|ban phim|tai nghe/.test(text);
  return text.includes(category);
};

const matchUseCases = (product, useCases = []) => {
  const text = productText(product);
  return useCases.filter((useCase) => {
    const terms = USE_CASE_TERMS[useCase] || [useCase];
    return terms.some((term) => text.includes(normalize(term)));
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
  const details = {
    categoryMatch: false,
    budgetMatch: false,
    brandMatch: false,
    avoidedBrandMatch: false,
    matchedUseCases: [],
    matchedSpecs: [],
  };
  const text = productText(product);
  const category = needs.category || needs.deviceType;

  if (matchesCategory(product, category)) {
    details.categoryMatch = Boolean(category);
    score += category ? 32 : 0;
  } else if (category) {
    score -= 45;
  }

  if (needs.budget) {
    if (product.price <= needs.budget) {
      details.budgetMatch = true;
      score += 28;
    } else {
      const overRatio = (product.price - needs.budget) / needs.budget;
      score -= Math.min(35, overRatio * 55);
    }
  }

  const preferredBrands = needs.preferredBrands || (needs.brand ? [needs.brand] : []);
  if (preferredBrands.some((brand) => text.includes(normalize(brand)))) {
    details.brandMatch = true;
    score += 14;
  }

  const avoidedBrands = needs.avoidedBrands || [];
  if (avoidedBrands.some((brand) => text.includes(normalize(brand)))) {
    details.avoidedBrandMatch = true;
    score -= 60;
  }

  details.matchedUseCases = matchUseCases(product, [
    ...(needs.useCases || []),
    ...(needs.importantFactors || []),
  ]);
  score += details.matchedUseCases.length * 10;

  details.matchedSpecs = matchSpecs(product, needs.specs);
  score += details.matchedSpecs.length * 8;

  score += getRatingScore(product);
  if (product.stock > 0) score += 6;
  if (product.stock === 0) score -= 18;

  return { score: Math.round(score), details };
};

const buildReason = (product, needs, scoring) => {
  const parts = [];
  if (scoring.details.categoryMatch) parts.push(`it is in the ${needs.category} category you asked for`);
  if (scoring.details.budgetMatch) parts.push(`it stays within ${formatCurrency(needs.budget)}`);
  if (scoring.details.brandMatch) parts.push("it matches your preferred brand");
  if (scoring.details.matchedUseCases.length) {
    parts.push(`it fits ${scoring.details.matchedUseCases.slice(0, 2).join(" and ")} use`);
  }
  if (scoring.details.matchedSpecs.length) {
    parts.push(`it matches requested specs like ${scoring.details.matchedSpecs.slice(0, 2).join(" and ")}`);
  }
  if (product.rating) parts.push(`it has a ${product.rating}/5 rating signal`);
  if (product.stock > 0) parts.push("it is currently available");

  if (product.strengths?.length) {
    parts.push(product.strengths[0]);
  }

  return parts.length
    ? `I recommend this because ${parts.slice(0, 3).join(", ")}.`
    : "This is one of the closest matches in the current catalog.";
};

const buildTradeoff = (product, needs) => {
  if (product.weaknesses?.length) return product.weaknesses[0];
  if (needs.budget && product.price > needs.budget) {
    return `It is above your stated budget by about ${formatCurrency(product.price - needs.budget)}.`;
  }
  if (product.stock <= 0) return "It is not currently in stock, so it may not be a practical pick right now.";
  if (needs.importantFactors?.includes("price") && product.price > 10000000) {
    return "It is not the absolute cheapest option; you are paying more for capability.";
  }
  if (needs.useCases?.includes("gaming") && !/rtx|gtx|radeon|gpu/i.test(productText(product))) {
    return "It should handle light gaming, but it is not the strongest gaming-focused choice.";
  }
  return "The trade-off is that it may not be the best in every area, so compare it against price and your top priority.";
};

const buildBestFor = (product, needs) => {
  if (product.bestFor?.length) return product.bestFor[0];
  if (needs.useCases?.length) return `Best for ${needs.useCases.slice(0, 2).join(" and ")}.`;
  if (needs.importantFactors?.length) return `Best for shoppers prioritizing ${needs.importantFactors[0]}.`;
  return "Best for users who want a balanced option from this category.";
};

const buildBetterThan = (product, recommendations) => {
  const cheaper = recommendations.find((item) => item.product.price > product.price);
  if (cheaper) return `Better value than ${cheaper.product.name} if you want to spend less.`;
  const lowerScore = recommendations.find((item) => item.score < recommendations[0]?.score);
  if (lowerScore) return `A stronger match than ${lowerScore.product.name} for your stated needs.`;
  return "Better than a random pick because it matches more of your stated needs.";
};

const toProductPayload = (product) => ({
  _id: product._id,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  image: product.image,
  category: product.category,
  specs: product.specs || {},
  useCases: product.useCases || [],
  strengths: product.strengths || [],
  weaknesses: product.weaknesses || [],
  bestFor: product.bestFor || [],
  notBestFor: product.notBestFor || [],
  reviewSummary: product.reviewSummary || "",
  tags: product.tags || [],
  rating: product.rating || null,
  reviewCount: product.reviewCount || 0,
});

const toRecommendation = (product, needs, scoring) => ({
  product: toProductPayload(product),
  score: scoring.score,
  reason: buildReason(product, needs, scoring),
  tradeoff: buildTradeoff(product, needs),
  betterThan: "",
  bestFor: buildBestFor(product, needs),
});

const getCandidateProducts = async (needs) => {
  const query = {};
  if (needs.budget) query.price = { $lte: Math.round(needs.budget * 1.25) };

  const preferredBrands = needs.preferredBrands || [];
  if (preferredBrands.length) {
    query.$or = preferredBrands.flatMap((brand) => [
      { name: { $regex: brand, $options: "i" } },
      { description: { $regex: brand, $options: "i" } },
      { category: { $regex: brand, $options: "i" } },
      { tags: { $regex: brand, $options: "i" } },
    ]);
  }

  const products = await Product.find(query).limit(100);
  const fallback = products.length ? products : await Product.find().limit(100);
  const category = needs.category || needs.deviceType;
  const typed = category ? fallback.filter((product) => matchesCategory(product, category)) : fallback;
  return typed.length >= 3 ? typed : fallback;
};

const recommendProducts = async (needs, limit = 5) => {
  const candidates = await getCandidateProducts(needs);
  const ranked = candidates
    .map((product) => {
      const scoring = scoreProduct(product, needs);
      return toRecommendation(product, needs, scoring);
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  const recommendedProducts = ranked.slice(0, limit).map((item, index, topItems) => ({
    ...item,
    betterThan: buildBetterThan(item.product, topItems),
  }));

  const alternatives = ranked.slice(limit, limit + 3).map((item) => ({
    product: item.product,
    reason:
      item.product.price < recommendedProducts[0]?.product.price
        ? "Cheaper alternative if price matters more than overall match."
        : "Alternative worth checking if you prefer its brand, design, or specs.",
  }));

  return { recommendedProducts, alternatives };
};

const compareProducts = async (message, limit = 4) => {
  const pieces = message
    .split(/\b(?:and|vs|versus|compare|with|,|&)\b/i)
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 2);

  const productQueries = pieces.slice(0, limit).map((piece) => ({
    $or: [
      { name: { $regex: piece, $options: "i" } },
      { description: { $regex: piece, $options: "i" } },
    ],
  }));

  const products = productQueries.length ? await Product.find({ $or: productQueries }).limit(limit) : [];
  const recommendedProducts = products.map((product) => {
    const scoring = scoreProduct(product, {});
    return toRecommendation(product, {}, scoring);
  });

  return {
    recommendedProducts,
    alternatives: [],
  };
};

module.exports = {
  compareProducts,
  recommendProducts,
};
