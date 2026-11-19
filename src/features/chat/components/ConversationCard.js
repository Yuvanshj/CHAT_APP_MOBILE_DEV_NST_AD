import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ParticipantAvatar } from './ParticipantAvatar.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';
import { formatDateOrTime } from '../utils/dateHelpers.js';

export const ConversationCard = ({
  conversation,
  onPress,
}) => {
  const isGroup = conversation.type === 'GROUP';
  const participantCount = conversation.participants_ids?.length || 0;
  const timeFormatted = formatDateOrTime(conversation.lastMessageAt || conversation.createdAt);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ParticipantAvatar
        name={conversation.name}
        id={conversation.id}
        size={52}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation.name}
          </Text>
          {timeFormatted ? (
            <Text style={styles.time}>{timeFormatted}</Text>
          ) : null}
        </View>

        <View style={styles.detailsRow}>
          <View
            style={[
              styles.typeBadge,
              isGroup ? styles.groupBadge : styles.dmBadge,
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                isGroup ? styles.groupBadgeText : styles.dmBadgeText,
              ]}
            >
              {isGroup ? 'GROUP' : 'DM'}
            </Text>
          </View>

          {conversation.createdByName ? (
            <Text style={styles.createdBy} numberOfLines={1}>
              By {conversation.createdByName}
            </Text>
          ) : null}

          {participantCount > 0 ? (
            <Text style={styles.participantsCount}>
              • {participantCount} {participantCount === 1 ? 'member' : 'members'}
            </Text>
          ) : null}
        </View>

        {conversation.lastMessage ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
        ) : (
          <Text style={styles.emptyMessage} numberOfLines={1}>
            Tap to open conversation
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: SPACING.xs,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dmBadge: {
    backgroundColor: '#EFF6FF',
  },
  dmBadgeText: {
    color: COLORS.dmBadge,
  },
  groupBadge: {
    backgroundColor: '#F5F3FF',
  },
  groupBadgeText: {
    color: COLORS.groupBadge,
  },
  createdBy: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    maxWidth: 120,
  },
  participantsCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  lastMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
