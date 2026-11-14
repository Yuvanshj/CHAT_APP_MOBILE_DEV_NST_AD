import { apiClient } from './apiClient.js';
import { normalizeUsers } from '../utils/messageHelpers.js';

export const userApi = {
  /**
   * Fetches all registered users: GET /user
   */
  async getUsers() {
    const raw = await apiClient.get('/user');
    return normalizeUsers(raw);
  },

  /**
   * Fetches profile for a specific user: GET /user/profile?user_id={userId}
   */
  async getUserProfile(userId) {
    const raw = await apiClient.get(`/user/profile?user_id=${encodeURIComponent(String(userId))}`);
    return {
      id: raw.id ?? raw._id ?? userId,
      name: raw.name ?? raw.username ?? `User ${userId}`,
      bio: raw.bio ?? raw.status ?? '',
      avatar: raw.avatar ?? raw.profilePic,
      email: raw.email,
    };
  },
};
