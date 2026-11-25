import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ParticipantAvatar } from './ParticipantAvatar.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';
import { formatDateOrTime } from '../utils/dateHelpers.js';
import { useAuth } from '../context/AuthContext.js';

export const ConversationCard = ({
  conversation,
  onPress,
}) => {
  const { currentUserId } = useAuth();
  const isGroup = conversation.type === 'GROUP';
  const participantCount = conversation.participants_ids?.length || 0;
  const timeFormatted = formatDateOrTime(conversation.lastMessageAt || conversation.createdAt);

  // In a 1-on-1 DM, dynamically show the other user's name
  let displayName = conversation.name;
  if (!isGroup && conversation.participants_ids) {
    const peerId = conversation.participants_ids.find((id) => String(id) !== String(currentUserId));
    if (peerId === 'first') displayName = 'Yuvansh';
    else if (peerId === 'second') displayName = 'Student 1';
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <ParticipantAvatar
        name={displayName}
        id={conversation.id}
        size={50}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          {timeFormatted ? (
            <Text style={styles.time}>{timeFormatted}</Text>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.messageRow}>
            <Text style={styles.checkIcon}>✓✓</Text>
            {conversation.lastMessage ? (
              <Text style={styles.lastMessage} numberOfLines={1}>
                {conversation.lastMessage}
              </Text>
            ) : (
              <Text style={styles.emptyMessage} numberOfLines={1}>
                Tap to chat
              </Text>
            )}
          </View>

          {isGroup && (
            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>GROUP</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9EDEF',
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111B21',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#667781',
    fontWeight: '400',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  checkIcon: {
    fontSize: 12,
    color: '#53BDEB',
    fontWeight: '700',
    marginRight: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#667781',
    flex: 1,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#8696A0',
    fontStyle: 'italic',
  },
  groupBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#E7F7F3',
  },
  groupBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#008069',
  },
});
