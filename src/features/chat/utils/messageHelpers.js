/**
 * Normalizes raw messages from API response
 */
export function normalizeMessages(raw) {
  if (!raw) return [];
  let list = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (Array.isArray(raw.data)) {
    list = raw.data;
  } else if (Array.isArray(raw.messages)) {
    list = raw.messages;
  }

  return list.map((item, index) => {
    return {
      id: item.id ?? item._id ?? `msg-${index}-${Date.now()}`,
      conversation_id: String(item.conversation_id ?? item.conversationId ?? ''),
      sender_id: item.sender_id ?? item.senderId ?? item.userId ?? item.createdBy,
      sender_name: item.sender_name ?? item.senderName,
      content: item.content ?? item.message ?? item.text ?? '',
      imageInfo: item.imageInfo ?? item.image_info ?? item.image ?? item.imageUrl,
      createdAt: item.createdAt ?? item.created_at ?? item.timestamp ?? new Date().toISOString(),
      status: 'sent',
    };
  });
}

/**
 * Normalizes raw conversations from API response
 */
export function normalizeConversations(raw) {
  if (!raw) return [];
  let list = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (Array.isArray(raw.data)) {
    list = raw.data;
  } else if (Array.isArray(raw.conversations)) {
    list = raw.conversations;
  }

  return list.map((item, index) => {
    const rawParticipants =
      item.participants_ids ?? item.participants ?? item.members ?? [];
    const participants_ids = Array.isArray(rawParticipants)
      ? rawParticipants.map((p) => (typeof p === 'object' && p !== null ? p.id ?? p.userId : p))
      : [];

    return {
      id: String(item.id ?? item._id ?? `convo-${index}`),
      name: item.name ?? (item.type === 'DM' ? 'Direct Message' : 'Group Conversation'),
      type: item.type === 'GROUP' ? 'GROUP' : 'DM',
      participants_ids,
      createdBy: item.createdBy ?? item.created_by ?? '',
      createdByName: item.createdByName ?? undefined,
      createdAt: item.createdAt ?? item.created_at,
      updatedAt: item.updatedAt ?? item.updated_at,
      lastMessage: item.lastMessage ?? item.last_message,
      lastMessageAt: item.lastMessageAt ?? item.last_message_at,
    };
  });
}

/**
 * Normalizes raw users from API response
 */
export function normalizeUsers(raw) {
  if (!raw) return [];
  let list = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (Array.isArray(raw.data)) {
    list = raw.data;
  } else if (Array.isArray(raw.users)) {
    list = raw.users;
  }

  return list.map((item, index) => {
    return {
      id: item.id ?? item._id ?? `user-${index}`,
      name: item.name ?? item.username ?? `User ${index + 1}`,
      bio: item.bio ?? item.status ?? item.about ?? '',
      avatar: item.avatar ?? item.profilePic ?? item.avatarUrl,
      email: item.email,
    };
  });
}
