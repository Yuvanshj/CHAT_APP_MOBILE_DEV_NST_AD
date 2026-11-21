import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ParticipantAvatar } from './ParticipantAvatar.js';
import { ImagePreviewModal } from './ImagePreviewModal.js';
import { normalizeImageUri } from '../utils/imageHelpers.js';
import { formatTimestamp } from '../utils/dateHelpers.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';

export const MessageBubble = ({
  message,
  isOwn,
  showSenderName = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const normalizedImage = normalizeImageUri(message.imageInfo);
  const timeFormatted = formatTimestamp(message.createdAt);

  return (
    <>
      <View
        style={[
          styles.row,
          isOwn ? styles.rowOwn : styles.rowOther,
        ]}
      >
        {!isOwn && (
          <View style={styles.avatarContainer}>
            <ParticipantAvatar
              name={message.sender_name || `User ${message.sender_id || ''}`}
              id={message.sender_id}
              size={32}
            />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
          ]}
        >
          {/* Sender name for other users in group chats */}
          {!isOwn && showSenderName && (
            <Text style={styles.senderName} numberOfLines={1}>
              {message.sender_name || `User ${message.sender_id || 'Unknown'}`}
            </Text>
          )}

          {/* Image Attachment */}
          {normalizedImage ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setModalVisible(true)}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: normalizedImage }}
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
              {imageLoading && (
                <View style={styles.imageLoader}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          ) : null}

          {/* Text Content */}
          {message.content ? (
            <Text
              style={[
                styles.contentText,
                isOwn ? styles.contentOwn : styles.contentOther,
              ]}
              selectable
            >
              {message.content}
            </Text>
          ) : null}

          {/* Footer: Time & Status */}
          <View
            style={[
              styles.footer,
              isOwn ? styles.footerOwn : styles.footerOther,
            ]}
          >
            {timeFormatted ? (
              <Text
                style={[
                  styles.timeText,
                  isOwn ? styles.timeOwn : styles.timeOther,
                ]}
              >
                {timeFormatted}
              </Text>
            ) : null}

            {isOwn && (
              <View style={styles.statusContainer}>
                {message.status === 'sending' ? (
                  <ActivityIndicator size={10} color={COLORS.textInverse} />
                ) : message.status === 'error' ? (
                  <Text style={styles.errorText}>⚠️ Failed</Text>
                ) : (
                  <Text style={styles.checkText}>✓✓</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Lightbox / Preview */}
      {normalizedImage && (
        <ImagePreviewModal
          visible={modalVisible}
          imageUri={message.imageInfo || null}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: SPACING.md,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: SPACING.xs,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bubbleOwn: {
    backgroundColor: COLORS.bubbleOwn,
    borderBottomRightRadius: RADIUS.xs,
  },
  bubbleOther: {
    backgroundColor: COLORS.bubbleOther,
    borderBottomLeftRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.bubbleOtherBorder,
  },
  senderName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  imageWrapper: {
    width: 220,
    height: 180,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceAlt,
    marginVertical: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  contentText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  contentOwn: {
    color: COLORS.bubbleOwnText,
  },
  contentOther: {
    color: COLORS.bubbleOtherText,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footerOwn: {
    justifyContent: 'flex-end',
  },
  footerOther: {
    justifyContent: 'flex-start',
  },
  timeText: {
    fontSize: 10,
  },
  timeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeOther: {
    color: COLORS.textMuted,
  },
  statusContainer: {
    marginLeft: 4,
  },
  checkText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 10,
    color: '#FEE2E2',
    fontWeight: 'bold',
  },
});
