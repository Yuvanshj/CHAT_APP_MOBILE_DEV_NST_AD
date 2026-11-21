import { useState, useEffect, useCallback, useRef } from 'react';
import { chatApi } from '../services/chatApi.js';
import { userApi } from '../services/userApi.js';
import { CHAT_CONSTANTS } from '../constants/chatConstants.js';
import { useAuth } from '../context/AuthContext.js';

export function useMessages({
  conversationId,
  initialParticipants = [],
  pollInterval = CHAT_CONSTANTS.MESSAGE_POLL_INTERVAL,
  autoPoll = true,
}) {
  const { currentUserId, currentUserName } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [participantsMap, setParticipantsMap] = useState({});

  const isMountedRef = useRef(true);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  const fetchParticipants = useCallback(async (participants) => {
    if (!participants || participants.length === 0) return;
    try {
      const profiles = await Promise.all(
        participants.map(async (pId) => {
          try {
            return await userApi.getUserProfile(pId);
          } catch {
            return { id: pId, name: `User ${pId}` };
          }
        })
      );

      if (isMountedRef.current) {
        const map = {};
        profiles.forEach((p) => {
          map[String(p.id)] = p;
        });
        setParticipantsMap((prev) => ({ ...prev, ...map }));
      }
    } catch {
      // Ignore participant fetch error
    }
  }, []);

  useEffect(() => {
    if (initialParticipants && initialParticipants.length > 0) {
      fetchParticipants(initialParticipants);
    }
  }, [initialParticipants, fetchParticipants]);

  const fetchMessages = useCallback(
    async (isBackground = false) => {
      if (!conversationId) return;

      if (!isBackground) {
        setLoading(true);
      }
      setError(null);

      try {
        const fetched = await chatApi.getMessages(conversationId);
        if (isMountedRef.current) {
          const resolved = fetched.map((msg) => {
            const senderIdStr = String(msg.sender_id || '');
            let senderName = msg.sender_name;

            if (!senderName) {
              if (senderIdStr === String(currentUserId)) {
                senderName = currentUserName || 'You';
              } else if (participantsMap[senderIdStr]) {
                senderName = participantsMap[senderIdStr].name;
              }
            }

            return {
              ...msg,
              sender_name: senderName,
            };
          });

          setMessages(resolved);
        }
      } catch (err) {
        if (isMountedRef.current && !isBackground) {
          setError(err.message || 'Failed to load messages.');
        }
      } finally {
        if (isMountedRef.current && !isBackground) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [conversationId, currentUserId, currentUserName, participantsMap]
  );

  useEffect(() => {
    fetchMessages(false);
  }, [fetchMessages]);

  useEffect(() => {
    if (!autoPoll || !conversationId) return;

    pollTimerRef.current = setInterval(() => {
      fetchMessages(true);
    }, pollInterval);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [autoPoll, conversationId, fetchMessages, pollInterval]);

  const refreshMessages = useCallback(() => {
    setRefreshing(true);
    return fetchMessages(false);
  }, [fetchMessages]);

  const sendTextMessage = useCallback(
    async (content) => {
      const trimmed = content.trim();
      if (!trimmed || !conversationId) return false;

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        sender_name: currentUserName || 'You',
        content: trimmed,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        status: 'sending',
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setSending(true);

      try {
        const serverMsg = await chatApi.sendMessage({
          conversation_id: conversationId,
          content: trimmed,
        });

        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...serverMsg,
                    sender_id: serverMsg.sender_id || currentUserId,
                    sender_name: serverMsg.sender_name || currentUserName || 'You',
                    content: serverMsg.content || trimmed,
                    status: 'sent',
                  }
                : m
            )
          );
        }
        return true;
      } catch (err) {
        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { ...m, status: 'error', error: err.message || 'Failed to send' }
                : m
            )
          );
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setSending(false);
        }
      }
    },
    [conversationId, currentUserId, currentUserName]
  );

  const sendImageMessage = useCallback(
    async (imageInfo) => {
      if (!imageInfo || !conversationId) return false;

      const tempId = `temp-img-${Date.now()}`;
      const optimisticMsg = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        sender_name: currentUserName || 'You',
        imageInfo,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        status: 'sending',
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setSending(true);

      try {
        const serverMsg = await chatApi.sendMessage({
          conversation_id: conversationId,
          imageInfo,
        });

        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...serverMsg,
                    sender_id: serverMsg.sender_id || currentUserId,
                    sender_name: serverMsg.sender_name || currentUserName || 'You',
                    imageInfo: serverMsg.imageInfo || imageInfo,
                    status: 'sent',
                  }
                : m
            )
          );
        }
        return true;
      } catch (err) {
        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { ...m, status: 'error', error: err.message || 'Failed to send image' }
                : m
            )
          );
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setSending(false);
        }
      }
    },
    [conversationId, currentUserId, currentUserName]
  );

  return {
    messages,
    loading,
    refreshing,
    error,
    sending,
    participantsMap,
    fetchParticipants,
    refreshMessages,
    sendTextMessage,
    sendImageMessage,
  };
}
