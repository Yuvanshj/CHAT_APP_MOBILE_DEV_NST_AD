import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';
import { normalizeImageUri } from '../utils/imageHelpers.js';

export const MessageInput = ({
  onSendMessage,
  onOpenAttachmentMenu,
  stagedImage,
  onRemoveStagedImage,
  isSending = false,
}) => {
  const [text, setText] = useState('');

  const canSend = (text.trim().length > 0 || !!stagedImage) && !isSending;
  const normalizedStaged = normalizeImageUri(stagedImage);

  const handleSend = () => {
    if (!canSend) return;
    const currentText = text.trim();
    const currentImage = stagedImage;
    setText('');
    onSendMessage(currentText, currentImage);
  };

  return (
    <View style={styles.wrapper}>
      {/* Staged Image Preview */}
      {normalizedStaged && (
        <View style={styles.stagedContainer}>
          <Image source={{ uri: normalizedStaged }} style={styles.stagedThumbnail} />
          <View style={styles.stagedInfo}>
            <Text style={styles.stagedTitle} numberOfLines={1}>
              Image Attachment
            </Text>
            <Text style={styles.stagedSubtitle}>Ready to send</Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemoveStagedImage}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={onOpenAttachmentMenu}
          activeOpacity={0.7}
        >
          <Text style={styles.attachIcon}>📎</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
        />

        <TouchableOpacity
          style={[styles.sendButton, canSend ? styles.sendActive : styles.sendDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  stagedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  stagedThumbnail: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.border,
  },
  stagedInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  stagedTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  stagedSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    marginRight: SPACING.xs,
  },
  attachIcon: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    maxHeight: 120,
    minHeight: 40,
    marginRight: SPACING.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendActive: {
    backgroundColor: COLORS.primary,
  },
  sendDisabled: {
    backgroundColor: COLORS.borderDark,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});
