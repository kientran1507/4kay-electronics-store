const getKioskState = ({ intent, hasProducts, hasComparison, hasError }) => {
  if (hasError) return "error";
  if (intent === "greeting") return "greeting";
  if (intent === "ask_follow_up") return "talking";
  if (intent === "compare_products" || hasComparison) return "comparing";
  if (intent === "checkout" || intent === "payment_help") return "checkout";
  if (hasProducts) return "presenting";
  return "talking";
};

module.exports = { getKioskState };
