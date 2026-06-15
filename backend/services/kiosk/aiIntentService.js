const { normalize } = require("../preferenceExtractor");

const detectKioskIntent = (message = "") => {
  const text = normalize(message);

  if (!text.trim()) return "greeting";
  if (/\b(hello|hi|xin chao|chao|start)\b/.test(text)) return "greeting";
  if (/\b(compare|comparison|vs|versus|so sanh)\b/.test(text)) return "compare_products";
  if (/\b(why|explain|detail|details|spec|specs|vi sao|tai sao)\b/.test(text)) return "explain_product";
  if (/\b(cheaper|cheap|lower price|re hon|gia re|budget)\b/.test(text)) return "refine_recommendation";
  if (/\b(add to cart|add this|them vao gio|mua cai nay)\b/.test(text)) return "add_to_cart";
  if (/\b(checkout|pay now|payment|proceed to payment|thanh toan|pay|qr|vietqr|payos)\b/.test(text)) {
    return text.includes("qr") || text.includes("payos") || text.includes("vietqr") ? "payment_help" : "checkout";
  }
  if (/\b(recommend|suggest|need|looking for|find|nen mua|tu van|goi y|student|office|gaming|camera|battery)\b/.test(text)) {
    return "recommend_product";
  }

  return "general_question";
};

module.exports = { detectKioskIntent };
