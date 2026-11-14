export const CHAT_CONSTANTS = {
  DEFAULT_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  DEFAULT_AUTH_HEADER: process.env.EXPO_PUBLIC_API_AUTH_TOKEN || 'Basic first:second',
  DEFAULT_USER_ID: 'first',
  DEFAULT_USER_NAME: 'Current User',

  // Polling intervals in milliseconds
  MESSAGE_POLL_INTERVAL: 4000,
  CONVERSATION_POLL_INTERVAL: 15000,

  // Pagination or list limits
  MAX_MESSAGE_LENGTH: 2000,
  IMAGE_MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  IMAGE_COMPRESSION_QUALITY: 0.7,

  // Conversation types
  CONVERSATION_TYPES: {
    DM: 'DM',
    GROUP: 'GROUP',
  },
};
