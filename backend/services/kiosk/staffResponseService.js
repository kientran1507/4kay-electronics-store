const { formatCurrency } = require("./productRankingService");

const greeting =
  "Hi, I can help you choose a laptop, phone, tablet, or accessory. Tell me what you need and your budget.";

const buildRecommendationReply = ({ needs, recommendedProducts, alternatives }) => {
  if (!recommendedProducts.length) {
    return {
      reply: "I could not find a good match in the current catalog. If you relax the budget or category, I can try again.",
      spokenReply: "I could not find a good match yet. Try changing the budget or category.",
    };
  }

  const main = recommendedProducts[0];
  const budget = needs.budget ? ` around ${formatCurrency(needs.budget)}` : "";
  const use = needs.useCases?.length ? ` for ${needs.useCases.slice(0, 2).join(" and ")}` : "";
  const alt = alternatives?.[0];

  let reply = `I would start with ${main.product.name}${budget}${use}. ${main.reason} The honest trade-off: ${main.tradeoff}`;
  if (main.comparisonNote || main.betterThan) reply += ` ${main.comparisonNote || main.betterThan}`;
  if (alt) reply += ` If you want another direction, I would also look at ${alt.product.name}: ${alt.reason}`;
  reply += " You can view details, compare it, or add it to cart.";

  return {
    reply,
    spokenReply: `I would start with ${main.product.name}. It is the best first match from the current catalog. The trade-off is ${main.tradeoff}`,
  };
};

const buildComparisonReply = (comparison) => {
  if (comparison.products.length < 2) {
    return {
      reply: "Which two products should I compare? You can name them or choose products from the shelf.",
      spokenReply: "Which two products should I compare?",
    };
  }

  return {
    reply: `${comparison.summary} I will show the main differences in the comparison panel.`,
    spokenReply: comparison.summary,
  };
};

const buildCheckoutReply = (cartKnown = false) =>
  cartKnown
    ? {
        reply: "I can guide checkout. Choose VietQR/payOS for QR payment, or COD if you want to pay on delivery.",
        spokenReply: "I can guide checkout. Choose QR payment or cash on delivery.",
      }
    : {
        reply: "I can help with checkout, but first make sure your cart has the product you want.",
        spokenReply: "Your cart needs a product before checkout.",
      };

const buildPaymentHelpReply = () => ({
  reply: "For Vietnam payments, VietQR/payOS is the primary option when keys are configured. COD remains available as a fallback.",
  spokenReply: "You can pay by VietQR or payOS when configured. COD is still available.",
});

module.exports = {
  buildCheckoutReply,
  buildComparisonReply,
  buildPaymentHelpReply,
  buildRecommendationReply,
  greeting,
};
