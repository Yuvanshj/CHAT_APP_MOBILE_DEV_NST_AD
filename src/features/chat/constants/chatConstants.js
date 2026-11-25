function resolveDefaultApiUrl() {
  if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  try {
    const { Platform } = require('react-native');
    let Constants = null;
    try {
      const exp = require('expo-constants');
      Constants = exp.default || exp;
    } catch {}

    const hostUri = Constants && (Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri);
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:3000`;
      }
    }

    if (Platform && Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
  } catch {}

  return 'http://localhost:3000';
}

export const CHAT_CONSTANTS = {
  DEFAULT_API_BASE_URL: resolveDefaultApiUrl(),
  DEFAULT_AUTH_HEADER: (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_AUTH_TOKEN) || 'Basic first:second',
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
