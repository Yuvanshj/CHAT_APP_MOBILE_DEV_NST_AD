import { useState, useEffect, useCallback, useRef } from 'react';
import { chatApi } from '../services/chatApi.js';
import { userApi } from '../services/userApi.js';

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchConversations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await chatApi.getConversations();

      const enriched = await Promise.all(
        data.map(async (convo) => {
          if (!convo.createdBy) return convo;
          try {
            const profile = await userApi.getUserProfile(convo.createdBy);
            return {
              ...convo,
              createdByName: profile.name || String(convo.createdBy),
            };
          } catch {
            return convo;
          }
        })
      );

      if (isMountedRef.current) {
        setConversations(enriched);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch conversations.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const refresh = useCallback(() => {
    return fetchConversations(true);
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    refreshing,
    error,
    refresh,
  };
}
