const { rankProducts } = require("./productRankingService");

const getKioskRecommendations = async (needs) => {
  const ranked = await rankProducts(needs, 5);
  const recommendedProducts = ranked.slice(0, 3);
  const alternatives = ranked.slice(3, 5).map((item) => ({
    product: item.product,
    reason:
      item.product.price < recommendedProducts[0]?.product.price
        ? "Cheaper alternative if budget matters more than overall fit."
        : "Alternative worth checking if you prefer this brand, design, or specs.",
    tradeoff: item.tradeoff,
  }));

  return { recommendedProducts, alternatives };
};

module.exports = { getKioskRecommendations };
