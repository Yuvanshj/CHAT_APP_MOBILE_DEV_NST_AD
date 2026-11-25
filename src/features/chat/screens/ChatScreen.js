import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useMessages } from '../hooks/useMessages.js';
import { MessageBubble } from '../components/MessageBubble.js';
import { MessageInput } from '../components/MessageInput.js';
import { AttachmentMenu } from '../components/AttachmentMenu.js';
import { ParticipantAvatar } from '../components/ParticipantAvatar.js';
import { useAuth } from '../context/AuthContext.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';

export const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { currentUserId, currentUserName } = useAuth();

  const conversationData = route.params?.data || {
    conversationId: '',
    name: 'Conversation',
    participants: [],
  };

  const {
    messages,
    loading,
    refreshing,
    error,
    sending,
    participantsMap,
    refreshMessages,
    sendTextMessage,
    sendImageMessage,
  } = useMessages({
    conversationId: conversationData.conversationId,
    initialParticipants: conversationData.participants,
    autoPoll: true,
  });

  const flatListRef = useRef(null);
  const [stagedImage, setStagedImage] = useState(null);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const peerParticipantId =
    conversationData.type === 'DM' && conversationData.participants
      ? conversationData.participants.find((p) => String(p) !== String(currentUserId))
      : null;
  const peerProfile = peerParticipantId ? participantsMap[String(peerParticipantId)] : null;
  const chatDisplayName =
    conversationData.type === 'DM' && peerProfile?.name
      ? peerProfile.name
      : conversationData.name || 'Chat';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerTitleContainer}
          onPress={() => setInfoModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {chatDisplayName}
          </Text>
          <Text style={styles.headerSubtitleText} numberOfLines={1}>
            {conversationData.type === 'GROUP'
              ? `${conversationData.participants?.length || 0} participants`
              : `online • You: ${currentUserName || currentUserId}`}
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setInfoModalVisible(true)}
          style={styles.headerInfoBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerInfoIcon}>ℹ️</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, conversationData, chatDisplayName, currentUserName, currentUserId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages.length]);

  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Media library permission is required to choose photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imagePayload = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setStagedImage(imagePayload);
      }
    } catch (err) {
      Alert.alert('Error picking image', err.message || 'Could not pick image.');
    }
  };

  const handleTakePhotoNative = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imagePayload = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setStagedImage(imagePayload);
      }
    } catch (err) {
      Alert.alert('Error capturing photo', err.message || 'Could not capture photo.');
    }
  };

  const handleOpenCustomCamera = () => {
    navigation.getParent()?.navigate('RawCameraScreen');
  };

  const handleSendMessage = async (text, imageToSend) => {
    if (imageToSend) {
      await sendImageMessage(imageToSend);
      setStagedImage(null);
    }
    if (text.trim()) {
      await sendTextMessage(text.trim());
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText} numberOfLines={2}>
              ⚠️ {error}
            </Text>
            <TouchableOpacity onPress={refreshMessages} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading && !refreshing && messages.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Say hello or share a photo to get the conversation rolling!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => String(item.id || index)}
            renderItem={({ item }) => {
              const isOwn =
                String(item.sender_id || '') === String(currentUserId) ||
                item.isOptimistic === true;

              return (
                <MessageBubble
                  message={item}
                  isOwn={isOwn}
                  showSenderName={conversationData.type === 'GROUP'}
                />
              );
            }}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshMessages}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        )}

        <MessageInput
          onSendMessage={handleSendMessage}
          onOpenAttachmentMenu={() => setAttachmentMenuVisible(true)}
          stagedImage={stagedImage}
          onRemoveStagedImage={() => setStagedImage(null)}
          isSending={sending}
        />

        <AttachmentMenu
          visible={attachmentMenuVisible}
          onClose={() => setAttachmentMenuVisible(false)}
          onPickFromGallery={handlePickFromGallery}
          onTakePhotoNative={handleTakePhotoNative}
          onOpenCustomCamera={handleOpenCustomCamera}
        />

        {/* Participant Information Modal */}
        <Modal
          visible={infoModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setInfoModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Conversation Details</Text>
                <TouchableOpacity
                  onPress={() => setInfoModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{conversationData.name}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>{conversationData.type}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Conversation ID</Text>
                  <Text style={styles.infoValueSmall}>{conversationData.conversationId}</Text>
                </View>

                <Text style={styles.participantsHeader}>
                  Participants ({conversationData.participants?.length || 0}):
                </Text>

                {conversationData.participants && conversationData.participants.length > 0 ? (
                  conversationData.participants.map((pId) => {
                    const profile = participantsMap[String(pId)];
                    const isCreator = String(pId) === String(conversationData.createdBy);

                    return (
                      <View key={String(pId)} style={styles.participantRow}>
                        <ParticipantAvatar
                          name={profile?.name || `User ${pId}`}
                          avatarUrl={profile?.avatar}
                          id={pId}
                          size={40}
                        />
                        <View style={styles.participantInfo}>
                          <Text style={styles.participantName}>
                            {profile?.name || `User ${pId}`}
                            {String(pId) === String(currentUserId) ? ' (You)' : ''}
                          </Text>
                          {profile?.bio ? (
                            <Text style={styles.participantBio} numberOfLines={1}>
                              {profile.bio}
                            </Text>
                          ) : null}
                        </View>
                        {isCreator && (
                          <View style={styles.creatorBadge}>
                            <Text style={styles.creatorBadgeText}>Creator</Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noParticipantsText}>No participant details available</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  headerTitleContainer: {
    alignItems: 'center',
    maxWidth: 200,
  },
  headerTitleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitleText: {
    fontSize: 11,
    color: '#008069',
    fontWeight: '500',
    marginTop: 1,
  },
  headerInfoBtn: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  headerInfoIcon: {
    fontSize: 18,
  },
  errorBanner: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.danger,
    marginRight: SPACING.sm,
  },
  retryBtn: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  messageList: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '75%',
    paddingBottom: SPACING.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: SPACING.lg,
  },
  infoSection: {
    marginBottom: SPACING.md,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  infoValueSmall: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  participantsHeader: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  participantInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  participantName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  participantBio: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  creatorBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  creatorBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D97706',
  },
  noParticipantsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: SPACING.sm,
  },
});
