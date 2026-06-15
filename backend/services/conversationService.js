const conversations = new Map();

const MAX_MESSAGES = 12;

const createConversationId = () =>
  `conv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const getConversation = (conversationId) => {
  const id = conversationId || createConversationId();
  if (!conversations.has(id)) {
    conversations.set(id, {
      id,
      preferences: {
        category: "",
        budget: null,
        useCases: [],
        importantFactors: [],
        preferredBrands: [],
        avoidedBrands: [],
        guidedDiscoveryActive: false,
      },
      messages: [],
      updatedAt: new Date(),
    });
  }
  return conversations.get(id);
};

const appendMessage = (conversation, role, content) => {
  conversation.messages.push({
    role,
    content,
    createdAt: new Date(),
  });
  conversation.messages = conversation.messages.slice(-MAX_MESSAGES);
  conversation.updatedAt = new Date();
};

const mergePreferences = (currentPreferences, nextPreferences) => ({
  ...currentPreferences,
  ...Object.fromEntries(
    Object.entries(nextPreferences || {}).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }),
  ),
});

module.exports = {
  appendMessage,
  getConversation,
  mergePreferences,
};
