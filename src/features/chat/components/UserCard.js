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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9EDEF',
  },
  containerSelected: {
    backgroundColor: '#E7F7F3',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111B21',
    marginBottom: 2,
  },
  bio: {
    fontSize: 13,
    color: '#667781',
  },
  bioPlaceholder: {
    fontSize: 13,
    color: '#8696A0',
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D7DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#00A884',
    borderColor: '#00A884',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
