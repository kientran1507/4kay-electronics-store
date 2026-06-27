const {
  detectIntent,
  extractPreferences,
  getMissingRecommendationFields,
  hasCompleteRecommendationNeeds,
  needsFollowUp,
  toPublicNeeds,
} = require("./preferenceExtractor");
const { compareProducts, recommendProducts } = require("./recommendationService");
const { getSupportAnswer } = require("./supportKnowledgeService");

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const getGeminiApiUrl = () => {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
};

const getCasualResponse = (message) => {
  const text = String(message || "").trim().toLowerCase();

  if (/^(hi|hello|hey|good (morning|afternoon|evening))[!.?\s]*$/.test(text)) {
    return "Hello! How can I help you today? You can ask me about products, orders, delivery, returns, or anything else in the store.";
  }
  if (/^(thanks|thank you|thank you very much|thanks a lot)[!.?\s]*$/.test(text)) {
    return "You are welcome! Let me know if you need help with anything else.";
  }
  if (/^(bye|goodbye|see you|see you later)[!.?\s]*$/.test(text)) {
    return "Goodbye! Come back anytime you need help.";
  }
  if (/\b(who are you|what are you|your name)\b/.test(text)) {
    return "I am the 4Kay AI shopping assistant. I can explain products, help you choose, compare options, and answer questions about orders, delivery, returns, payments, and the store.";
  }
  if (/\b(what can you do|how can you help|help me with)\b/.test(text)) {
    return "I can recommend and compare electronics, explain specifications in simple language, help with product details, and guide you through cart, payment, delivery, returns, and warranty questions.";
  }

  return null;
};

const getDefaultGeneralResponse = (message) => {
  const compact = String(message || "").trim();
  return `I am not fully sure what you mean by "${compact.slice(0, 80)}". I can still help: ask about a product, choosing a device, comparing models, an order, payment, delivery, returns, or warranty.`;
};

const parseJson = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

const parseWithGemini = async (message, context) => {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const response = await fetch(getGeminiApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: [
                  "Extract electronics shopping needs from the user message.",
                  "Return only valid JSON with keys: intent, category, budget, preferredBrands, avoidedBrands, useCases, importantFactors, specs.",
                  "Use intent guided_discovery when the user asks to be interviewed, guided, or helped to decide before receiving products.",
                  "Do not include markdown.",
                  JSON.stringify({ message, existingContext: context || {} }),
                ].join("\n"),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return parseJson(raw);
  } catch (error) {
    console.warn("Gemini preference parsing failed, using local parser:", error.message);
    return null;
  }
};

const parseWithLLM = async (message, context) => {
  const geminiNeeds = await parseWithGemini(message, context);
  if (geminiNeeds) return geminiNeeds;

  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "Extract electronics shopping needs. Return only JSON with keys: intent, category, budget, preferredBrands, avoidedBrands, useCases, importantFactors, specs. Use intent guided_discovery when the user asks to be interviewed before receiving products.",
          },
          {
            role: "user",
            content: JSON.stringify({
              message,
              existingContext: context || {},
            }),
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    return parseJson(raw);
  } catch (error) {
    console.warn("LLM preference parsing failed, using local parser:", error.message);
    return null;
  }
};

const generateGeneralResponse = async (message, context) => {
  const prompt = [
    "You are the 4Kay electronics store assistant.",
    "Answer the user's message naturally and concisely.",
    "Stay within electronics shopping and store support. If the request is unrelated, say so politely and offer relevant help.",
    "Do not invent prices, stock, order status, policies, or product facts.",
    "Never force the conversation into product recommendation questions unless the user is actually asking to choose a product.",
    JSON.stringify({ message, recentConversation: context?.messages?.slice(-6) || [] }),
  ].join("\n");

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(getGeminiApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 220 },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (reply) return reply;
      }
    } catch (error) {
      console.warn("Gemini general response failed:", error.message);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.35,
          max_tokens: 220,
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: message },
          ],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return reply;
      }
    } catch (error) {
      console.warn("OpenAI general response failed:", error.message);
    }
  }

  return getDefaultGeneralResponse(message);
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const firstValidBudget = (...values) => {
  for (const value of values) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return null;
};

const mergeNeeds = (previousNeeds = {}, localNeeds = {}, llmNeeds = {}) => {
  const category = llmNeeds.category || localNeeds.category || previousNeeds.category || previousNeeds.deviceType || "";
  const budget = firstValidBudget(llmNeeds.budget, localNeeds.budget, previousNeeds.budget);
  const preferredBrands = [
    ...(previousNeeds.preferredBrands || (previousNeeds.brand ? [previousNeeds.brand] : [])),
    ...(localNeeds.preferredBrands || []),
    ...(llmNeeds.preferredBrands || []),
  ];
  const avoidedBrands = [
    ...(previousNeeds.avoidedBrands || []),
    ...(localNeeds.avoidedBrands || []),
    ...(llmNeeds.avoidedBrands || []),
  ];
  const useCases = [
    ...(previousNeeds.useCases || []),
    ...(localNeeds.useCases || []),
    ...(llmNeeds.useCases || []),
  ];
  const importantFactors = [
    ...(previousNeeds.importantFactors || []),
    ...(localNeeds.importantFactors || []),
    ...(llmNeeds.importantFactors || []),
  ];

  return {
    category,
    deviceType: category,
    budget,
    brand: preferredBrands[0],
    preferredBrands: [...new Set(preferredBrands.filter(Boolean))],
    avoidedBrands: [...new Set(avoidedBrands.filter(Boolean))],
    useCases: [...new Set(useCases.filter(Boolean))],
    importantFactors: [...new Set(importantFactors.filter(Boolean))],
    specs: {
      ...(previousNeeds.specs || {}),
      ...(localNeeds.specs || {}),
      ...(llmNeeds.specs || {}),
    },
    guidedDiscoveryActive: Boolean(previousNeeds.guidedDiscoveryActive),
  };
};

const getFollowUpQuestion = (needs) => {
  const missing = getMissingRecommendationFields(needs);

  if (missing.includes("category")) {
    return "What type of device would help most: a laptop, phone, tablet, or accessory? If you are unsure, tell me what you want to do with it.";
  }
  if (missing.includes("budget")) {
    return "What budget feels comfortable? A rough maximum is enough. You can also say \"I don't know\" and I will choose a sensible range.";
  }
  if (missing.includes("useCases")) {
    return "What will you use it for most: study, work, gaming, programming, photos, or entertainment?";
  }

  return "";
};

const getLocalizedFollowUpQuestion = (needs, locale = "en") => {
  if (locale !== "vi") return getFollowUpQuestion(needs);

  const missing = getMissingRecommendationFields(needs);
  if (missing.includes("category")) {
    return "Bạn đang muốn mua loại thiết bị nào: laptop, điện thoại, máy tính bảng hay phụ kiện?";
  }
  if (missing.includes("budget")) {
    return "Ngân sách tối đa của bạn khoảng bao nhiêu? Chỉ cần nói con số ước lượng là được.";
  }
  if (missing.includes("useCases")) {
    return "Bạn dùng thiết bị chủ yếu để học, làm việc, chơi game, lập trình, chụp ảnh hay giải trí?";
  }
  return "";
};

const wantsAssistantToChoose = (message) =>
  /\b(i (?:do not|don't|dont) know|not sure|you choose|choose for me|up to you|can you tell me|whatever you recommend|any budget)\b/i
    .test(String(message || ""));

const getSuggestedBudget = (needs = {}) => {
  const category = needs.category || needs.deviceType;
  if (category === "laptop") {
    return needs.useCases?.includes("gaming") ? 25000000 : 18000000;
  }
  if (category === "phone") return 15000000;
  if (category === "tablet") return 12000000;
  if (category === "accessory") return 3000000;
  return null;
};

const productName = (item) => item.product?.name || item.name;

const buildRecommendationReply = (recommendedProducts, alternatives, needs, locale = "en") => {
  if (!recommendedProducts.length) {
    return locale === "vi"
      ? "Tôi chưa tìm được lựa chọn thật sự phù hợp trong danh mục hiện tại. Nếu bạn có thể tăng ngân sách hoặc nới yêu cầu thương hiệu/nhóm hàng, tôi sẽ thử lại."
      : "I could not find a strong match in the current catalog. If you can raise the budget or relax the brand/category, I can try again.";
  }

  const contextParts = [];
  if (needs.category) contextParts.push(needs.category);
  if (needs.budget) contextParts.push(`around ${formatCurrency(needs.budget)}`);
  if (needs.useCases?.length) contextParts.push(`for ${needs.useCases.slice(0, 2).join(" and ")}`);

  const top = recommendedProducts[0];
  const second = recommendedProducts[1];
  const alternative = alternatives[0];

  let reply = locale === "vi"
    ? `Với nhu cầu ${contextParts.join(", ") || "của bạn"}, tôi sẽ bắt đầu với ${productName(top)}. ${top.reason} Điểm đánh đổi: ${top.tradeoff}`
    : `For ${contextParts.join(", ") || "your needs"}, I would start with ${productName(top)}. ${top.reason} The trade-off: ${top.tradeoff}`;

  if (second) {
    reply += locale === "vi"
      ? `\n\nNếu muốn một hướng khác, ${productName(second)} cũng đáng cân nhắc. ${second.betterThan}`
      : `\n\nIf you want another angle, ${productName(second)} is also worth considering. ${second.betterThan}`;
  }

  if (alternative) {
    reply += locale === "vi"
      ? `\n\nMột lựa chọn thay thế hợp lý là ${alternative.product.name}: ${alternative.reason}`
      : `\n\nA reasonable alternative is ${alternative.product.name}: ${alternative.reason}`;
  }

  reply += locale === "vi"
    ? "\n\nBạn thích mẫu nào thì nói tôi biết, tôi có thể so sánh trực tiếp hơn hoặc hỗ trợ thêm vào giỏ hàng."
    : "\n\nTell me which one you like and I can compare it more directly or help you add it to cart.";
  return reply;
};

const buildCompareReply = (recommendedProducts, locale = "en") => {
  if (recommendedProducts.length < 2) {
    return locale === "vi"
      ? "Tôi có thể so sánh sản phẩm, nhưng cần ít nhất hai tên model. Bạn muốn so sánh hai sản phẩm nào?"
      : "I can compare products, but I need at least two model names. Which two products should I compare?";
  }

  const [first, second] = recommendedProducts;
  return locale === "vi"
    ? `${first.product.name} là lựa chọn đầu tiên tốt hơn nếu ưu tiên của bạn là ${first.bestFor.toLowerCase()}. ${second.product.name} có thể hợp hơn nếu bạn thích giá, thương hiệu hoặc thiết kế của nó. Điểm đánh đổi: ${first.product.name}: ${first.tradeoff} ${second.product.name}: ${second.tradeoff}`
    : `${first.product.name} is the better first pick if your priority is ${first.bestFor.toLowerCase()}. ${second.product.name} may be better if you prefer its price, brand, or design. Trade-offs matter here: ${first.product.name}: ${first.tradeoff} ${second.product.name}: ${second.tradeoff}`;
};

const buildAssistantResponse = async ({ message, context, previousPreferences }) => {
  const locale = context?.locale === "vi" ? "vi" : "en";
  const supportAnswer = getSupportAnswer(message, context);
  if (supportAnswer) {
    return {
      reply: supportAnswer,
      intent: "general",
      needs: toPublicNeeds(previousPreferences || {}),
      preferences: previousPreferences || {},
      recommendedProducts: [],
      alternatives: [],
      followUpQuestion: "",
      avatarState: "talking",
      actions: [],
    };
  }

  const casualResponse = getCasualResponse(message);
  if (casualResponse) {
    return {
      reply: casualResponse,
      intent: "general",
      needs: toPublicNeeds(previousPreferences || {}),
      preferences: previousPreferences || {},
      recommendedProducts: [],
      alternatives: [],
      followUpQuestion: "",
      avatarState: "talking",
      actions: [],
    };
  }

  const localNeeds = extractPreferences(message);
  const llmNeeds = await parseWithLLM(message, context);
  const detectedIntent = detectIntent(message);
  const hasShoppingSignals = Boolean(
    localNeeds.category
    || localNeeds.budget
    || localNeeds.useCases?.length
    || localNeeds.importantFactors?.length
    || localNeeds.preferredBrands?.length
    || Object.keys(localNeeds.specs || {}).length,
  );
  const localIntent = detectedIntent === "general" && hasShoppingSignals
    ? "recommend"
    : detectedIntent;
  const intent = localIntent !== "general"
    ? localIntent
    : hasShoppingSignals
      ? llmNeeds?.intent || "recommend"
      : "general";
  const needs = mergeNeeds(previousPreferences, localNeeds, llmNeeds || {});
  const canSuggestBudget = Boolean(
    (previousPreferences?.category || previousPreferences?.deviceType) &&
    previousPreferences?.useCases?.length,
  );
  if (!needs.budget && canSuggestBudget && wantsAssistantToChoose(message)) {
    needs.budget = getSuggestedBudget(needs);
  }
  const publicNeeds = toPublicNeeds(needs);
  const guidedDiscoveryRequested = intent === "guided_discovery";
  const guidedDiscoveryActive = guidedDiscoveryRequested || Boolean(previousPreferences?.guidedDiscoveryActive);
  const recommendationReady = hasCompleteRecommendationNeeds(publicNeeds);

  if (intent === "general") {
    return {
      reply: await generateGeneralResponse(message, context),
      intent: "general",
      needs: publicNeeds,
      preferences: needs,
      recommendedProducts: [],
      alternatives: [],
      followUpQuestion: "",
      avatarState: "talking",
      actions: [],
    };
  }

  if (intent === "product_detail" || intent === "add_to_cart") {
    const followUpQuestion = intent === "product_detail"
      ? locale === "vi"
        ? "Bạn muốn xem chi tiết sản phẩm nào? Gửi tên sản phẩm, tôi sẽ giải thích phần quan trọng."
        : "Which product would you like details about? Send its name and I will explain the important parts."
      : locale === "vi"
        ? "Bạn muốn thêm sản phẩm nào? Gửi tên sản phẩm hoặc bấm Thêm trên thẻ gợi ý."
        : "Which product would you like to add? Send its name, or open a recommendation card and choose Add to cart.";
    return {
      reply: followUpQuestion,
      intent: "ask_follow_up",
      needs: publicNeeds,
      preferences: needs,
      recommendedProducts: [],
      alternatives: [],
      followUpQuestion,
      avatarState: "talking",
      actions: [],
    };
  }

  if ((guidedDiscoveryActive && !recommendationReady) || needsFollowUp(publicNeeds, intent)) {
    needs.guidedDiscoveryActive = true;
    const followUpQuestion = getLocalizedFollowUpQuestion(publicNeeds, locale);
    return {
      reply: followUpQuestion,
      intent: guidedDiscoveryActive ? "guided_discovery" : "ask_follow_up",
      needs: publicNeeds,
      preferences: needs,
      recommendedProducts: [],
      alternatives: [],
      followUpQuestion,
      avatarState: "talking",
      actions: [],
    };
  }

  needs.guidedDiscoveryActive = false;

  if (intent === "compare") {
    const { recommendedProducts, alternatives } = await compareProducts(message, 4, locale);
    const followUpQuestion = recommendedProducts.length < 2
      ? locale === "vi" ? "Bạn muốn so sánh hai sản phẩm nào?" : "Which two products should I compare?"
      : "";
    return {
      reply: buildCompareReply(recommendedProducts, locale),
      intent: recommendedProducts.length < 2 ? "ask_follow_up" : "compare",
      needs: publicNeeds,
      preferences: needs,
      recommendedProducts,
      alternatives,
      followUpQuestion,
      avatarState: "talking",
      actions: recommendedProducts.map((item) => ({
        type: "view_detail",
        label: `View ${item.product.name}`,
        productId: item.product._id,
      })),
    };
  }

  const { recommendedProducts, alternatives } = await recommendProducts(publicNeeds, 5, locale);

  return {
    reply: buildRecommendationReply(recommendedProducts, alternatives, publicNeeds, locale),
    intent: "recommend",
    needs: publicNeeds,
    preferences: needs,
    recommendedProducts,
    alternatives,
    followUpQuestion: "",
    avatarState: "talking",
    actions: [
      { type: "view_detail", label: "View details" },
      { type: "add_to_cart", label: "Add to cart" },
      { type: "compare", label: "Compare" },
    ],
  };
};

module.exports = {
  buildAssistantResponse,
};
