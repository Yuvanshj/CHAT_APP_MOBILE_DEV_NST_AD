import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ParticipantAvatar } from './ParticipantAvatar.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';

export const UserCard = ({
  user,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ParticipantAvatar
        name={user.name}
        avatarUrl={user.avatar}
        id={user.id}
        size={46}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        {user.bio ? (
          <Text style={styles.bio} numberOfLines={1}>
            {user.bio}
          </Text>
        ) : (
          <Text style={styles.bioPlaceholder} numberOfLines={1}>
            Available
          </Text>
        )}
      </View>

      <View
        style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected,
        ]}
      >
        {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
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
  containerSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  bio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  bioPlaceholder: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
