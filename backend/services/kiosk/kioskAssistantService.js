const { getConversation, appendMessage, mergePreferences } = require("../conversationService");
const { detectKioskIntent } = require("./aiIntentService");
const { extractKioskNeeds, getMissingNeedQuestion } = require("./preferenceExtractionService");
const { getKioskRecommendations } = require("./recommendationService");
const { compareProducts } = require("./comparisonService");
const {
  buildCheckoutReply,
  buildComparisonReply,
  buildPaymentHelpReply,
  buildRecommendationReply,
  greeting,
} = require("./staffResponseService");
const { getKioskState } = require("./kioskStateService");

const actionsForProducts = (items) =>
  items.flatMap((item) => [
    { type: "VIEW_DETAIL", label: "View detail", productId: item.product._id },
    { type: "ADD_TO_CART", label: "Add to cart", productId: item.product._id },
    { type: "COMPARE", label: "Compare", productId: item.product._id },
    { type: "ASK_WHY", label: "Ask why", productId: item.product._id },
    { type: "CHEAPER_OPTION", label: "Show cheaper option", productId: item.product._id },
  ]);

const handleKioskMessage = async ({ message, conversationId, userId, selectedProductIds = [], context = {} }) => {
  const conversation = getConversation(conversationId);
  appendMessage(conversation, "user", message);

  const intent = detectKioskIntent(message);
  const needs = extractKioskNeeds(message, conversation.preferences);
  let resolvedIntent = intent;
  let reply = "";
  let recommendedProducts = [];
  let alternatives = [];
  let comparison = { products: [], summary: "", winnerByUseCase: {} };
  let followUpQuestion = "";
  let actions = [];
  let spokenReply = "";

  if (intent === "greeting") {
    reply = greeting;
    spokenReply = "Hi, tell me what device you need and your budget.";
  } else if (intent === "checkout") {
    const checkoutReply = buildCheckoutReply(Boolean(context.cartItemCount));
    reply = checkoutReply.reply;
    spokenReply = checkoutReply.spokenReply;
    actions = [{ type: "CHECKOUT", label: "Go to checkout" }];
  } else if (intent === "payment_help") {
    const paymentReply = buildPaymentHelpReply();
    reply = paymentReply.reply;
    spokenReply = paymentReply.spokenReply;
    actions = [{ type: "PAY", label: "Show payment options" }];
  } else if (intent === "compare_products") {
    comparison = await compareProducts({ message, selectedProductIds, needs });
    const compareReply = buildComparisonReply(comparison);
    reply = compareReply.reply;
    spokenReply = compareReply.spokenReply;
    if (comparison.products.length < 2) {
      resolvedIntent = "ask_follow_up";
      followUpQuestion = "Which two products should I compare?";
    }
  } else {
    followUpQuestion = getMissingNeedQuestion(needs, intent);
    if (followUpQuestion) {
      resolvedIntent = "ask_follow_up";
      reply = followUpQuestion;
      spokenReply = followUpQuestion;
    } else {
      const result = await getKioskRecommendations(needs);
      recommendedProducts = result.recommendedProducts;
      alternatives = result.alternatives;
      const recommendationReply = buildRecommendationReply({ needs, recommendedProducts, alternatives });
      reply = recommendationReply.reply;
      spokenReply = recommendationReply.spokenReply;
      actions = actionsForProducts(recommendedProducts);
    }
  }

  conversation.preferences = mergePreferences(conversation.preferences, needs);
  appendMessage(conversation, "assistant", reply);

  const kioskState = getKioskState({
    intent: resolvedIntent,
    hasProducts: recommendedProducts.length > 0,
    hasComparison: comparison.products.length > 1,
  });

  return {
    conversationId: conversation.id,
    reply,
    spokenReply,
    intent: resolvedIntent,
    needs,
    recommendedProducts,
    alternatives,
    comparison,
    followUpQuestion,
    kioskState,
    avatarState: kioskState === "presenting" ? "talking" : kioskState,
    actions,
    userId,
  };
};

module.exports = { handleKioskMessage };
