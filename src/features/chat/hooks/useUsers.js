import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { userApi } from '../services/userApi.js';
import { chatApi } from '../services/chatApi.js';
import { useAuth } from '../context/AuthContext.js';

export function useUsers() {
  const { currentUserId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [conversationType, setConversationType] = useState('DM');
  const [conversationName, setConversationName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await userApi.getUsers();
      if (isMountedRef.current) {
        setUsers(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch registered users.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        (u.bio && u.bio.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  const selectedUsers = useMemo(() => {
    return users.filter((u) => selectedUserIds.includes(u.id));
  }, [users, selectedUserIds]);

  const toggleUserSelection = useCallback((userId) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  const isUserSelected = useCallback(
    (userId) => {
      return selectedUserIds.includes(userId);
    },
    [selectedUserIds]
  );

  const clearSelection = useCallback(() => {
    setSelectedUserIds([]);
    setConversationName('');
    setCreateError(null);
  }, []);

  const createConversation = useCallback(async () => {
    if (selectedUserIds.length === 0) {
      setCreateError('Please select at least one participant.');
      return null;
    }

    if (conversationType === 'GROUP' && !conversationName.trim()) {
      setCreateError('Please enter a group conversation name.');
      return null;
    }

    const finalParticipants = [...selectedUserIds];
    if (currentUserId && !finalParticipants.includes(currentUserId)) {
      finalParticipants.push(currentUserId);
    }

    let resolvedName = conversationName.trim();
    if (conversationType === 'DM' && !resolvedName) {
      const otherUser = users.find((u) => selectedUserIds.includes(u.id));
      resolvedName = otherUser ? otherUser.name : 'Direct Message';
    }

    setCreating(true);
    setCreateError(null);

    try {
      const newConversation = await chatApi.createConversation({
        type: conversationType,
        name: resolvedName,
        participants_ids: finalParticipants,
      });

      if (isMountedRef.current) {
        clearSelection();
      }
      return newConversation;
    } catch (err) {
      if (isMountedRef.current) {
        setCreateError(err.message || 'Failed to create conversation.');
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setCreating(false);
      }
    }
  }, [
    selectedUserIds,
    conversationType,
    conversationName,
    currentUserId,
    users,
    clearSelection,
  ]);

  return {
    users,
    filteredUsers,
    selectedUserIds,
    selectedUsers,
    loading,
    refreshing,
    error,
    searchQuery,
    setSearchQuery,
    conversationType,
    setConversationType,
    conversationName,
    setConversationName,
    creating,
    createError,
    toggleUserSelection,
    isUserSelected,
    clearSelection,
    createConversation,
    refresh: () => fetchUsers(true),
  };
}
