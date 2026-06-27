const Product = require("../../models/productModel");
const { productPayload, scoreProduct } = require("./productRankingService");

const findProductsForComparison = async ({ message = "", selectedProductIds = [] }) => {
  if (selectedProductIds.length) return Product.find({ _id: { $in: selectedProductIds } }).limit(4);

  const pieces = message
    .split(/\b(?:compare|and|vs|versus|with|,|&)\b/i)
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 3);

  if (!pieces.length) return [];

  return Product.find({
    $or: pieces.flatMap((piece) => [
      { name: { $regex: piece, $options: "i" } },
      { description: { $regex: piece, $options: "i" } },
      { descriptionVi: { $regex: piece, $options: "i" } },
    ]),
  }).limit(4);
};

const compareProducts = async ({ message, selectedProductIds, needs }) => {
  const products = await findProductsForComparison({ message, selectedProductIds });
  const comparisonProducts = products.map((product) => {
    const ranking = scoreProduct(product, needs);
    return {
      product: productPayload(product),
      scoreDetails: ranking.scoreDetails,
      strengths: product.highlights?.en || [],
      weaknesses: product.tradeoffs?.en || [],
      bestFor: product.useCases || [],
    };
  });

  const winner = [...comparisonProducts].sort((a, b) => b.scoreDetails.total - a.scoreDetails.total)[0];

  return {
    products: comparisonProducts,
    summary:
      comparisonProducts.length < 2
        ? "I need two product names or selected products before I can compare them properly."
        : `${winner.product.name} is the stronger match for the needs currently described, but the trade-off depends on price, portability, and features.`,
    winnerByUseCase: winner ? { overall: winner.product._id } : {},
  };
};

module.exports = { compareProducts };
