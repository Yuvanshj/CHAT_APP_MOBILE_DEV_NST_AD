import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient.js';
import { CHAT_CONSTANTS } from '../constants/chatConstants.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrl] = useState(CHAT_CONSTANTS.DEFAULT_API_BASE_URL);
  const [authHeader, setAuthHeader] = useState(CHAT_CONSTANTS.DEFAULT_AUTH_HEADER);
  const [currentUserId, setCurrentUserId] = useState(CHAT_CONSTANTS.DEFAULT_USER_ID);
  const [currentUserName, setCurrentUserName] = useState(CHAT_CONSTANTS.DEFAULT_USER_NAME);
  const [isServerOnline, setIsServerOnline] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);

  useEffect(() => {
    apiClient.setBaseURL(apiBaseUrl);
  }, [apiBaseUrl]);

  useEffect(() => {
    apiClient.setAuthHeader(authHeader);
  }, [authHeader]);

  const testConnection = useCallback(async () => {
    setCheckingConnection(true);
    try {
      await apiClient.get('/user');
      setIsServerOnline(true);
      setCheckingConnection(false);
      return { success: true, message: 'Connected to backend server successfully!' };
    } catch (err) {
      setIsServerOnline(false);
      setCheckingConnection(false);
      return {
        success: false,
        message: err.message || 'Cannot reach server. Verify URL and network connectivity.',
      };
    }
  }, []);

  const updateConfig = useCallback(({ baseUrl, authHeader: newAuth, userId, userName }) => {
    if (baseUrl !== undefined) {
      setApiBaseUrl(baseUrl);
      apiClient.setBaseURL(baseUrl);
    }
    if (newAuth !== undefined) {
      setAuthHeader(newAuth);
      apiClient.setAuthHeader(newAuth);
    }
    if (userId !== undefined) {
      setCurrentUserId(userId);
    }
    if (userName !== undefined) {
      setCurrentUserName(userName);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        apiBaseUrl,
        authHeader,
        currentUserId,
        currentUserName,
        isServerOnline,
        checkingConnection,
        updateConfig,
        testConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
