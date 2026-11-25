import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient.js';
import { CHAT_CONSTANTS } from '../constants/chatConstants.js';

let FileSystem = null;
try {
  FileSystem = require('expo-file-system');
} catch {}

const CONFIG_FILE_PATH = FileSystem && FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}auth_config.json`
  : null;

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrl] = useState(CHAT_CONSTANTS.DEFAULT_API_BASE_URL);
  const [authHeader, setAuthHeader] = useState(CHAT_CONSTANTS.DEFAULT_AUTH_HEADER);
  const [currentUserId, setCurrentUserId] = useState(CHAT_CONSTANTS.DEFAULT_USER_ID);
  const [currentUserName, setCurrentUserName] = useState(CHAT_CONSTANTS.DEFAULT_USER_NAME);
  const [isServerOnline, setIsServerOnline] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);

  useEffect(() => {
    async function loadPersistedConfig() {
      if (!CONFIG_FILE_PATH || !FileSystem) return;
      try {
        const info = await FileSystem.getInfoAsync(CONFIG_FILE_PATH);
        if (info && info.exists) {
          const content = await FileSystem.readAsStringAsync(CONFIG_FILE_PATH);
          const parsed = JSON.parse(content);
          if (parsed.currentUserId) setCurrentUserId(parsed.currentUserId);
          if (parsed.currentUserName) setCurrentUserName(parsed.currentUserName);
          if (parsed.apiBaseUrl) setApiBaseUrl(parsed.apiBaseUrl);
          if (parsed.authHeader) setAuthHeader(parsed.authHeader);
        }
      } catch {}
    }
    loadPersistedConfig();
  }, []);

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

    if (CONFIG_FILE_PATH && FileSystem) {
      try {
        const stateToSave = {
          apiBaseUrl: baseUrl !== undefined ? baseUrl : apiBaseUrl,
          authHeader: newAuth !== undefined ? newAuth : authHeader,
          currentUserId: userId !== undefined ? userId : currentUserId,
          currentUserName: userName !== undefined ? userName : currentUserName,
        };
        FileSystem.writeAsStringAsync(CONFIG_FILE_PATH, JSON.stringify(stateToSave)).catch(() => {});
      } catch {}
    }
  }, [apiBaseUrl, authHeader, currentUserId, currentUserName]);

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
