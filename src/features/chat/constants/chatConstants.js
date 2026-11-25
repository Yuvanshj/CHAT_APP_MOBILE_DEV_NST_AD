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

function resolveDefaultIdentity() {
  try {
    let isPhysical = false;

    // Method 1: expo-device
    try {
      const Device = require('expo-device');
      if (Device && Device.isDevice !== undefined) {
        isPhysical = Boolean(Device.isDevice);
      }
    } catch {}

    // Method 2: Platform check in React Native
    if (!isPhysical) {
      try {
        const { Platform } = require('react-native');
        if (Platform && Platform.OS === 'ios' && Platform.constants) {
          const model = (Platform.constants.model || '').toLowerCase();
          if (model && !model.includes('simulator') && !model.includes('x86') && !model.includes('arm64')) {
            isPhysical = true;
          }
        }
      } catch {}
    }

    if (isPhysical) {
      return { id: 'second', name: 'Student 1', auth: 'Basic second:second' };
    }
  } catch {}

  return { id: 'first', name: 'Vaibhav', auth: 'Basic first:second' };
}

const defaultIdentity = resolveDefaultIdentity();

export const PRESET_PROFILES = [
  { id: 'first', name: 'Vaibhav', label: '👨‍🏫 Vaibhav (Mac)', auth: 'Basic first:second' },
  { id: 'second', name: 'Student 1', label: '📱 Student 1 (iPhone)', auth: 'Basic second:second' },
  { id: 'third', name: 'Student 2', label: '💻 Student 2', auth: 'Basic third:third' },
];

export const CHAT_CONSTANTS = {
  DEFAULT_API_BASE_URL: resolveDefaultApiUrl(),
  DEFAULT_AUTH_HEADER: (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_AUTH_TOKEN) || defaultIdentity.auth,
  DEFAULT_USER_ID: defaultIdentity.id,
  DEFAULT_USER_NAME: defaultIdentity.name,

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
