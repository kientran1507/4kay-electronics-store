const DEVICE_KEYWORDS = {
  laptop: ["laptop", "notebook", "macbook", "may tinh xach tay"],
  phone: ["phone", "smartphone", "iphone", "android", "dien thoai"],
  tablet: ["tablet", "ipad", "may tinh bang"],
  accessory: ["accessory", "headphone", "keyboard", "mouse", "charger", "case", "phu kien", "tai nghe", "ban phim", "chuot", "sac"],
};

const USE_CASE_KEYWORDS = {
  gaming: ["gaming", "game", "gpu", "graphics", "fps", "choi game", "game nhe", "game nang"],
  studying: ["student", "study", "studying", "school", "university", "durable", "sinh vien", "hoc", "hoc tap", "di hoc"],
  office: ["office", "work", "excel", "word", "meeting", "van phong", "lam viec", "hop"],
  programming: ["programming", "coding", "developer", "software", "lap trinh", "code"],
  editing: ["editing", "video", "photo", "photoshop", "render", "chinh anh", "dung phim", "do hoa"],
  battery: ["battery", "pin", "long lasting"],
  portability: ["portable", "lightweight", "thin", "travel", "mong nhe", "de mang", "di chuyen"],
  camera: ["camera", "photo", "video", "selfie", "chup anh", "quay phim"],
  durability: ["durable", "strong build", "bền", "ben"],
  value: ["cheap", "cheapest", "budget", "affordable", "good enough", "re", "gia tot", "tiet kiem"],
};

const FACTOR_KEYWORDS = {
  price: ["cheap", "cheapest", "budget", "affordable", "price", "re", "ngan sach", "gia"],
  performance: ["fast", "performance", "powerful", "gaming", "programming", "manh", "hieu nang", "muot"],
  battery: ["battery", "pin"],
  camera: ["camera", "photo", "video"],
  portability: ["portable", "light", "thin"],
  durability: ["durable", "bền", "ben"],
  display: ["screen", "display", "oled", "hz", "man hinh"],
};

const SPEC_PATTERNS = [
  { key: "ram", regex: /(\d+)\s*gb\s*(ram|memory)?/i },
  { key: "storage", regex: /(\d+)\s*(gb|tb)\s*(ssd|storage|rom)?/i },
  { key: "screenSize", regex: /(\d{1,2}(?:\.\d)?)\s*(inch|inches|")/i },
  { key: "gpu", regex: /\b(rtx\s?\d{3,4}|gtx\s?\d{3,4}|radeon|iris|mx\d{3})\b/i },
  { key: "cpu", regex: /\b(i[3579]|ryzen\s?[3579]|m[1234]|snapdragon|dimensity|helio)\b/i },
];

const COMMON_BRANDS = [
  "apple",
  "samsung",
  "xiaomi",
  "oppo",
  "vivo",
  "asus",
  "acer",
  "dell",
  "hp",
  "lenovo",
  "msi",
  "sony",
  "lg",
  "huawei",
];

const GUIDED_DISCOVERY_PATTERNS = [
  /\bask me\b/,
  /\bask (?:me )?(?:some )?questions?\b/,
  /\bhelp me (?:choose|decide)\b/,
  /\bfind out\b/,
  /\bbest (?:device|phone|laptop|tablet)?\s*for me\b/,
  /\b(?:i am|i'm|im) not sure\b/,
  /\b(?:i do not|i don't|dont) know\b/,
  /\badvise me\b/,
  /\bi need advice\b/,
  /\bguide me\b/,
  /\bchoose for me\b/,
  /\brecommend .*\bask me first\b/,
  /\b(?:which|what) (?:phone|laptop|tablet|device|accessory) should i (?:buy|choose|get)\b/,
];

const normalize = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const extractBudget = (text) => {
  const normalized = normalize(text);
  const millionMatch = normalized.match(/(?:under|below|less than|duoi|tam|max|maximum)?\s*(\d+(?:[.,]\d+)?)\s*(million|m|trieu)/i);
  if (millionMatch) {
    return Math.round(Number(millionMatch[1].replace(",", ".")) * 1000000);
  }

  const vndMatch = normalized.match(/(?:under|below|less than|duoi|tam|max|maximum)?\s*(\d{7,11})\s*(vnd|d)?/i);
  if (vndMatch) return Number(vndMatch[1]);

  return null;
};

const detectFromKeywords = (text, keywordMap) => {
  const normalized = normalize(text);
  return Object.entries(keywordMap)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(normalize(keyword))))
    .map(([key]) => key);
};

const extractSpecs = (text) => {
  const specs = {};
  for (const pattern of SPEC_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) specs[pattern.key] = match[0];
  }
  return specs;
};

const extractPreferences = (message) => {
  const normalized = normalize(message);
  const category = detectFromKeywords(normalized, DEVICE_KEYWORDS)[0] || "";
  const useCases = detectFromKeywords(normalized, USE_CASE_KEYWORDS);
  const importantFactors = detectFromKeywords(normalized, FACTOR_KEYWORDS);
  const avoidedBrands = COMMON_BRANDS.filter((candidate) => {
    const pattern = new RegExp(`\\b(?:avoid|not|no|except|without)\\s+${candidate}\\b`, "i");
    return pattern.test(normalized);
  });
  const preferredBrands = COMMON_BRANDS.filter(
    (candidate) => normalized.includes(candidate) && !avoidedBrands.includes(candidate),
  );

  return {
    category,
    deviceType: category,
    budget: extractBudget(message),
    brand: preferredBrands[0],
    preferredBrands,
    avoidedBrands,
    useCases,
    importantFactors,
    specs: extractSpecs(message),
  };
};

const isGuidedDiscoveryRequest = (message) => {
  const normalized = normalize(message);
  return GUIDED_DISCOVERY_PATTERNS.some((pattern) => pattern.test(normalized));
};

const detectIntent = (message) => {
  const normalized = normalize(message);
  if (isGuidedDiscoveryRequest(normalized)) return "guided_discovery";
  if (/\b(compare|comparison|vs|versus|khac nhau|so sanh)\b/i.test(normalized)) return "compare";
  if (/\b(add to cart|buy|mua|them vao gio)\b/i.test(normalized)) return "add_to_cart";
  if (/\b(detail|details|spec|specs|chi tiet|thong so)\b/i.test(normalized)) return "product_detail";
  if (/\b(recommend|suggest|find|looking for|need|nen mua|goi y|tu van|cheapest|student)\b/i.test(normalized)) return "recommend";
  return "general";
};

const getMissingRecommendationFields = (needs = {}) => {
  const missing = [];
  if (!needs.category && !needs.deviceType) missing.push("category");
  if (!needs.budget) missing.push("budget");
  if (!needs.useCases?.length) missing.push("useCases");
  return missing;
};

const hasCompleteRecommendationNeeds = (needs = {}) =>
  getMissingRecommendationFields(needs).length === 0;

const needsFollowUp = (needs, intent) => {
  if (intent === "compare" || intent === "product_detail" || intent === "add_to_cart") return false;
  return !hasCompleteRecommendationNeeds(needs);
};

const toPublicNeeds = (needs = {}) => ({
  category: needs.category || needs.deviceType || "",
  budget: needs.budget || null,
  useCases: needs.useCases || [],
  preferredBrands: needs.preferredBrands || (needs.brand ? [needs.brand] : []),
  avoidedBrands: needs.avoidedBrands || [],
  importantFactors: needs.importantFactors || [],
  specs: needs.specs || {},
});

module.exports = {
  detectIntent,
  extractPreferences,
  getMissingRecommendationFields,
  hasCompleteRecommendationNeeds,
  isGuidedDiscoveryRequest,
  needsFollowUp,
  normalize,
  toPublicNeeds,
};

