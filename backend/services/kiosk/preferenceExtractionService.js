const { extractPreferences, toPublicNeeds } = require("../preferenceExtractor");

const extractKioskNeeds = (message, previousNeeds = {}) => {
  const extracted = extractPreferences(message);
  const budgetValue = Number(extracted.budget || previousNeeds.budget);
  const merged = {
    category: extracted.category || previousNeeds.category || "",
    budget: Number.isFinite(budgetValue) && budgetValue > 0 ? budgetValue : null,
    useCases: [...new Set([...(previousNeeds.useCases || []), ...(extracted.useCases || [])])],
    preferredBrands: [...new Set([...(previousNeeds.preferredBrands || []), ...(extracted.preferredBrands || [])])],
    dislikedBrands: previousNeeds.dislikedBrands || [],
    importantFactors: [...new Set([...(previousNeeds.importantFactors || []), ...(extracted.importantFactors || [])])],
    minSpecs: {
      ...(previousNeeds.minSpecs || {}),
      ...(extracted.specs || {}),
    },
    specs: {
      ...(previousNeeds.specs || {}),
      ...(extracted.specs || {}),
    },
  };

  return {
    ...toPublicNeeds(merged),
    dislikedBrands: merged.dislikedBrands,
    minSpecs: merged.minSpecs,
  };
};

const getMissingNeedQuestion = (needs, intent) => {
  if (["compare_products", "explain_product", "add_to_cart", "checkout", "payment_help"].includes(intent)) return "";
  if (!needs.category) return "What are you shopping for: a laptop, phone, tablet, or accessory?";
  if (!needs.useCases?.length && !needs.importantFactors?.length) {
    return "What matters most: studying, programming, gaming, office work, camera, battery, or portability?";
  }
  if (!needs.budget) return "What budget should I try to stay within?";
  return "";
};

module.exports = {
  extractKioskNeeds,
  getMissingNeedQuestion,
};
