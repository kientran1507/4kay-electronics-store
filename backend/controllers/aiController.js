const {
  appendMessage,
  getConversation,
  mergePreferences,
} = require("../services/conversationService");
const { buildAssistantResponse } = require("../services/aiService");
const { handleKioskMessage } = require("../services/kiosk/kioskAssistantService");

exports.recommend = async (req, res) => {
  const { message, conversationId, userId, context = {} } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      message: "A non-empty message is required.",
    });
  }

  try {
    const conversation = getConversation(conversationId);
    appendMessage(conversation, "user", message);

    const assistantResponse = await buildAssistantResponse({
      message,
      context: {
        ...context,
        userId,
        messages: conversation.messages,
      },
      previousPreferences: conversation.preferences,
    });

    conversation.preferences = mergePreferences(
      conversation.preferences,
      assistantResponse.preferences,
    );
    appendMessage(conversation, "assistant", assistantResponse.reply);

    return res.status(200).json({
      conversationId: conversation.id,
      reply: assistantResponse.reply,
      intent: assistantResponse.intent,
      needs: assistantResponse.needs,
      recommendedProducts: assistantResponse.recommendedProducts,
      alternatives: assistantResponse.alternatives,
      followUpQuestion: assistantResponse.followUpQuestion,
      avatarState: assistantResponse.avatarState,
      actions: assistantResponse.actions,
    });
  } catch (error) {
    console.error("AI recommendation error:", error);
    return res.status(500).json({
      reply: "I had trouble preparing recommendations. Please try again.",
      intent: "general",
      needs: {
        category: "",
        budget: null,
        useCases: [],
        preferredBrands: [],
        importantFactors: [],
      },
      recommendedProducts: [],
      alternatives: [],
      followUpQuestion: "",
      avatarState: "idle",
      actions: [],
    });
  }
};

exports.kiosk = async (req, res) => {
  const { message, conversationId, userId, selectedProductIds = [], context = {} } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ message: "A non-empty message is required." });
  }

  try {
    const response = await handleKioskMessage({
      message,
      conversationId,
      userId,
      selectedProductIds,
      context,
    });
    return res.status(200).json(response);
  } catch (error) {
    console.error("Kiosk assistant error:", error);
    return res.status(500).json({
      reply: "I ran into a kiosk assistant issue. Please try again.",
      spokenReply: "I ran into an assistant issue. Please try again.",
      intent: "general_question",
      needs: {
        category: "",
        budget: null,
        useCases: [],
        preferredBrands: [],
        importantFactors: [],
        minSpecs: {},
      },
      recommendedProducts: [],
      alternatives: [],
      comparison: { products: [], summary: "", winnerByUseCase: {} },
      followUpQuestion: "",
      kioskState: "error",
      actions: [],
    });
  }
};
