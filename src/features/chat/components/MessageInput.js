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
        <View style={styles.pillContainer}>
          <TouchableOpacity
            style={styles.pillIconBtn}
            onPress={() => setText((prev) => (prev ? prev + ' 😊' : '😊 '))}
            activeOpacity={0.7}
          >
            <Text style={styles.pillIcon}>😊</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Message"
            placeholderTextColor="#8696A0"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={2000}
          />

          <TouchableOpacity
            style={styles.pillIconBtn}
            onPress={onOpenAttachmentMenu}
            activeOpacity={0.7}
          >
            <Text style={styles.pillIcon}>📎</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, canSend ? styles.sendActive : styles.sendInactive]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendIcon}>{canSend ? '➤' : '🎙️'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#EFEAE2',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
  },
  stagedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
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
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  pillContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 8,
    minHeight: 46,
    maxHeight: 120,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pillIconBtn: {
    padding: 6,
  },
  pillIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111B21',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#00A884',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sendActive: {
    backgroundColor: '#00A884',
  },
  sendInactive: {
    backgroundColor: '#00A884',
    opacity: 0.85,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 2,
  },
});
