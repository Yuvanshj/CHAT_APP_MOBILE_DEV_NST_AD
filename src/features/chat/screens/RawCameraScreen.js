import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useConversations } from '../hooks/useConversations.js';
import { chatApi } from '../services/chatApi.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';

export const RawCameraScreen = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const cameraRef = useRef(null);

  const { conversations, loading: loadingConvos } = useConversations();
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [sendingToConvo, setSendingToConvo] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setIsTakingPhoto(false);
    }
  }, [isFocused]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingMessage}>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Grant camera permission to experience the live custom camera viewfinder and capture photos.
        </Text>
        <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isTakingPhoto) return;

    try {
      setIsTakingPhoto(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo && photo.uri) {
        setPhotoUri(photo.uri);
        setPhotoBase64(photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : null);
      }
    } catch (err) {
      Alert.alert('Capture Failed', err.message || 'Could not capture photo.');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleSendToConversation = async (conversation) => {
    const payload = photoBase64 || photoUri;
    if (!payload) return;

    setSendingToConvo(true);
    try {
      await chatApi.sendMessage({
        conversation_id: conversation.id,
        imageInfo: payload,
      });
      setSendModalVisible(false);
      Alert.alert(
        'Photo Shared!',
        `Your photo has been shared in "${conversation.name}".`,
        [
          {
            text: 'Open Chat',
            onPress: () => {
              navigation.navigate('Conversations', {
                screen: 'Chat',
                params: {
                  data: {
                    conversationId: conversation.id,
                    name: conversation.name,
                    type: conversation.type,
                    participants: conversation.participants_ids,
                    createdBy: conversation.createdBy,
                  },
                },
              });
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    } catch (err) {
      Alert.alert('Error sharing photo', err.message || 'Could not share photo.');
    } finally {
      setSendingToConvo(false);
    }
  };

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />

        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => {
              setPhotoUri(null);
              setPhotoBase64(null);
            }}
          >
            <Text style={styles.retakeBtnText}>🔄 Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.usePhotoBtn}
            onPress={() => setSendModalVisible(true)}
          >
            <Text style={styles.usePhotoBtnText}>💬 Share in Chat</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={sendModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setSendModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Share Photo in Conversation</Text>
                <TouchableOpacity onPress={() => setSendModalVisible(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {loadingConvos ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ margin: 20 }} />
              ) : conversations.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={styles.modalEmpty}>No conversations available.</Text>
                </View>
              ) : (
                <FlatList
                  data={conversations}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.convoItem}
                      onPress={() => handleSendToConversation(item)}
                      disabled={sendingToConvo}
                    >
                      <View style={styles.convoIcon}>
                        <Text>{item.type === 'GROUP' ? '👥' : '💬'}</Text>
                      </View>
                      <View style={styles.convoInfo}>
                        <Text style={styles.convoName}>{item.name}</Text>
                        <Text style={styles.convoType}>{item.type}</Text>
                      </View>
                      <Text style={styles.convoArrow}>→</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        />
      ) : (
        <View style={styles.cameraInactive}>
          <Text style={styles.inactiveText}>Camera Inactive</Text>
        </View>
      )}

      <View style={styles.topBar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Custom Expo Camera</Text>
        </View>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <Text style={styles.flipIcon}>🔄</Text>
          <Text style={styles.flipText}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shutterButton}
          onPress={takePicture}
          disabled={isTakingPhoto}
        >
          {isTakingPhoto ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </TouchableOpacity>

        <View style={{ width: 60 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  loadingMessage: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  permissionIcon: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  permissionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  permissionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  grantButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  camera: {
    flex: 1,
  },
  cameraInactive: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveText: {
    color: '#666666',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipIcon: {
    fontSize: 20,
  },
  flipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CCCCCC',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  retakeBtn: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  usePhotoBtn: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  usePhotoBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '70%',
    paddingBottom: SPACING.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  modalEmpty: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  convoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  convoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  convoInfo: {
    flex: 1,
  },
  convoName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  convoType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  convoArrow: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
