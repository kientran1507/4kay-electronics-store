const test = require("node:test");
const assert = require("node:assert/strict");
const { buildAssistantResponse } = require("../services/aiService");
const {
  detectIntent,
  extractPreferences,
  hasCompleteRecommendationNeeds,
  toPublicNeeds,
} = require("../services/preferenceExtractor");

const withoutProviderKeys = async (callback) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    return await callback();
  } finally {
    if (geminiKey) process.env.GEMINI_API_KEY = geminiKey;
    if (openaiKey) process.env.OPENAI_API_KEY = openaiKey;
  }
};

test("a greeting gets a conversational response instead of shopping questions", async () => {
  const response = await buildAssistantResponse({
    message: "hello",
    context: {},
    previousPreferences: {},
  });

  assert.equal(response.intent, "general");
  assert.deepEqual(response.recommendedProducts, []);
  assert.equal(response.followUpQuestion, "");
  assert.match(response.reply, /^Hello!/);
  assert.doesNotMatch(response.reply, /budget or price range/i);
});

test("casual responses preserve existing conversation preferences", async () => {
  const previousPreferences = {
    category: "laptop",
    budget: 20000000,
    useCases: ["programming"],
  };
  const response = await buildAssistantResponse({
    message: "thank you",
    context: {},
    previousPreferences,
  });

  assert.equal(response.intent, "general");
  assert.equal(response.needs.category, "laptop");
  assert.equal(response.needs.budget, 20000000);
  assert.deepEqual(response.needs.useCases, ["programming"]);
});

test("identity questions stay conversational instead of starting discovery", async () => {
  const response = await buildAssistantResponse({
    message: "who are you",
    context: {},
    previousPreferences: {},
  });

  assert.equal(response.intent, "general");
  assert.deepEqual(response.recommendedProducts, []);
  assert.equal(response.followUpQuestion, "");
  assert.match(response.reply, /4Kay AI shopping assistant/i);
});

test("unknown general messages use a useful default without provider keys", async () => {
  const response = await withoutProviderKeys(() => buildAssistantResponse({
    message: "tell me about quantum gardening",
    context: {},
    previousPreferences: {},
  }));

  assert.equal(response.intent, "general");
  assert.deepEqual(response.recommendedProducts, []);
  assert.match(response.reply, /I can still help/i);
  assert.doesNotMatch(response.reply, /what type of device/i);
});

test("guided discovery asks one question at a time without products", async () => {
  const response = await withoutProviderKeys(() => buildAssistantResponse({
    message: "ask me some question and find out which device is best for me",
    context: {},
    previousPreferences: {},
  }));

  assert.equal(response.intent, "guided_discovery");
  assert.equal(response.preferences.guidedDiscoveryActive, true);
  assert.deepEqual(response.recommendedProducts, []);
  assert.match(response.reply, /what type of device/i);
  assert.doesNotMatch(response.reply, /\n2\./);
  assert.doesNotMatch(response.reply, /brands/i);
});

test("unknown laptop request asks only for the next missing detail", async () => {
  const response = await withoutProviderKeys(() => buildAssistantResponse({
    message: "I don't know what laptop to buy",
    context: {},
    previousPreferences: {},
  }));

  assert.equal(response.intent, "guided_discovery");
  assert.equal(response.needs.category, "laptop");
  assert.deepEqual(response.recommendedProducts, []);
  assert.match(response.reply, /budget/i);
  assert.doesNotMatch(response.reply, /brands/i);
});

test("a category alone is not enough to recommend", async () => {
  const response = await withoutProviderKeys(() => buildAssistantResponse({
    message: "phone",
    context: {},
    previousPreferences: {},
  }));

  assert.equal(response.intent, "ask_follow_up");
  assert.deepEqual(response.recommendedProducts, []);
  assert.match(response.reply, /budget/i);
  assert.doesNotMatch(response.reply, /brands/i);
});

test("study and gaming laptop request asks only for budget", async () => {
  const response = await withoutProviderKeys(() => buildAssistantResponse({
    message: "I want a laptop for study and gaming",
    context: {},
    previousPreferences: {},
  }));

  assert.equal(response.needs.category, "laptop");
  assert.ok(response.needs.useCases.includes("studying"));
  assert.ok(response.needs.useCases.includes("gaming"));
  assert.match(response.reply, /how much|maximum/i);
  assert.doesNotMatch(response.reply, /brands/i);
});

test("phone with budget, use case, and priorities is recommendation-ready", () => {
  const needs = toPublicNeeds(extractPreferences(
    "I need a phone under 20 million for camera and battery",
  ));

  assert.equal(needs.category, "phone");
  assert.equal(needs.budget, 20000000);
  assert.equal(hasCompleteRecommendationNeeds(needs), true);
});

test("gaming laptop around 20 million is recommendation-ready", () => {
  const needs = toPublicNeeds(extractPreferences("gaming laptop around 20 million"));

  assert.equal(needs.category, "laptop");
  assert.equal(needs.budget, 20000000);
  assert.ok(needs.useCases.includes("gaming"));
  assert.ok(needs.importantFactors.includes("performance"));
  assert.equal(hasCompleteRecommendationNeeds(needs), true);
});

test("which device should I buy enters guided discovery", () => {
  assert.equal(detectIntent("Which phone should I buy?"), "guided_discovery");
  assert.equal(detectIntent("I need advice"), "guided_discovery");
});
