import { CHAT_CONSTANTS } from '../constants/chatConstants.js';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  constructor() {
    this.baseURL = CHAT_CONSTANTS.DEFAULT_API_BASE_URL;
    this.authHeader = CHAT_CONSTANTS.DEFAULT_AUTH_HEADER;
    this.timeoutMs = 15000;
  }

  setBaseURL(url) {
    this.baseURL = url.replace(/\/+$/, '');
  }

  getBaseURL() {
    return this.baseURL;
  }

  setAuthHeader(auth) {
    this.authHeader = auth;
  }

  getAuthHeader() {
    return this.authHeader;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(this.authHeader ? { Authorization: this.authHeader } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorData = null;
        let message = `Request failed with status ${response.status}: ${response.statusText}`;
        try {
          const text = await response.text();
          try {
            errorData = JSON.parse(text);
            if (typeof errorData === 'object' && errorData?.message) {
              message = errorData.message;
            } else if (typeof errorData === 'string') {
              message = errorData;
            }
          } catch {
            errorData = text;
            if (text && text.trim()) {
              message = text.trim();
            }
          }
        } catch {
          errorData = null;
        }

        throw new ApiError(message, response.status, errorData);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new ApiError(`Request timeout after ${this.timeoutMs}ms. Check server IP and connection.`, 408);
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(
        err.message || 'Network request failed. Ensure server is running and accessible.',
        0,
        err
      );
    }
  }

  get(endpoint, headers) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers) {
    return this.request(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  put(endpoint, body, headers) {
    return this.request(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  delete(endpoint, headers) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
