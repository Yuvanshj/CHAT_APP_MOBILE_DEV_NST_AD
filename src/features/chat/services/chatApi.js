import { apiClient } from './apiClient.js';
import { normalizeConversations, normalizeMessages } from '../utils/messageHelpers.js';

export const chatApi = {
  /**
   * Fetches all conversations: GET /conversation
   */
  async getConversations() {
    const raw = await apiClient.get('/conversation');
    return normalizeConversations(raw);
  },

  /**
   * Creates a new conversation: POST /conversation
   */
  async createConversation(payload) {
    const response = await apiClient.post('/conversation', payload);
    const normalized = normalizeConversations(Array.isArray(response) ? response : [response]);
    if (normalized.length > 0) {
      return normalized[0];
    }
    return {
      id: String(response?.id ?? Date.now()),
      name: payload.name,
      type: payload.type,
      participants_ids: payload.participants_ids,
      createdBy: '',
    };
  },

  /**
   * Fetches messages for a conversation: GET /message?conversation_id={conversationId}
   */
  async getMessages(conversationId) {
    const raw = await apiClient.get(`/message?conversation_id=${encodeURIComponent(conversationId)}`);
    return normalizeMessages(raw);
  },

  /**
   * Sends a message: POST /message
   */
  async sendMessage(payload) {
    const response = await apiClient.post('/message', payload);
    const messages = normalizeMessages(Array.isArray(response) ? response : [response]);
    if (messages.length > 0) {
      return messages[0];
    }
    return {
      id: String(response?.id ?? Date.now()),
      conversation_id: payload.conversation_id,
      content: payload.content,
      imageInfo: payload.imageInfo,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
  },
};
