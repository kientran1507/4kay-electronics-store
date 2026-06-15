const entries = [
  { keywords: ["track", "tracking", "order status", "where is my order"], answer: "To track an order, sign in and open My Orders. I will not guess an order status. If you cannot access the account, contact support with the order code." },
  { keywords: ["delivery time", "how long delivery", "shipping time"], answer: "Delivery time depends on stock and location. Check the order status after purchase for the latest update, or contact support if it has not changed for more than two business days." },
  { keywords: ["shipping fee", "delivery fee", "shipping cost"], answer: "The final shipping fee depends on the order and delivery address. Review the checkout summary before confirming payment." },
  { keywords: ["return policy", "return", "refund"], answer: "Eligible products can be requested for return within 14 days when complete and undamaged. After inspection, refunds usually take 5–10 business days depending on the payment provider." },
  { keywords: ["warranty", "repair"], answer: "Warranty length and coverage depend on the product and manufacturer. It generally covers verified hardware faults under normal use, not accidental damage or unauthorized repair." },
  { keywords: ["payment method", "pay on delivery", "cod", "payment"], answer: "Checkout supports cash on delivery and bank-transfer or QR payment when the configured provider is available. Online payment requests are created by the backend." },
  { keywords: ["forgot password", "reset password", "password"], answer: "Automated password reset is not available yet. Use the Forgot Password page for support guidance or contact support using the email registered to your account." },
  { keywords: ["sign up", "create account", "register"], answer: "Use the Sign up link on the Sign in page. You will need your name, email, phone number, address, and password." },
  { keywords: ["sign in", "login", "account"], answer: "Use Sign in from the navigation bar. After signing in, the account menu provides access to My Orders and Sign out." },
  { keywords: ["cart", "checkout"], answer: "Add a product from its card or detail page, then open the cart. You must be signed in to update the server-backed cart and complete checkout." },
];

const normalize = (value = "") => String(value).toLowerCase();

const getSupportAnswer = (message, context = {}) => {
  const text = normalize(message);
  const entry = entries.find((candidate) => candidate.keywords.some((keyword) => text.includes(keyword)));
  if (!entry) return null;
  if (entry.keywords.some((keyword) => ["track", "tracking", "order status", "where is my order"].includes(keyword) && text.includes(keyword))) {
    return context.userId
      ? `${entry.answer} Since you are signed in, open My Orders from the account menu to view your real order history.`
      : `${entry.answer} Please sign in first so the store can load your real order history.`;
  }
  return entry.answer;
};

module.exports = { getSupportAnswer };
