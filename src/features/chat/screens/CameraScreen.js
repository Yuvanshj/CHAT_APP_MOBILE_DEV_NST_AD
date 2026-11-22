import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useConversations } from '../hooks/useConversations.js';
import { chatApi } from '../services/chatApi.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';

export const CameraScreen = () => {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  const { conversations, loading: loadingConvos } = useConversations();
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [sendingToConvo, setSendingToConvo] = useState(false);

  const takePhotoWithCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Denied',
          'You need to grant camera access to use this feature.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
      }
    } catch (err) {
      Alert.alert('Error taking photo', err.message || 'Could not launch camera.');
    }
  };

  const handleSendToConversation = async (conversation) => {
    const payload = imageBase64 || imageUri;
    if (!payload) return;

    setSendingToConvo(true);
    try {
      await chatApi.sendMessage({
        conversation_id: conversation.id,
        imageInfo: payload,
      });
      setSendModalVisible(false);
      Alert.alert(
        'Photo Sent!',
        `Your captured photo has been shared in "${conversation.name}".`,
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
      Alert.alert('Error sending photo', err.message || 'Could not send photo.');
    } finally {
      setSendingToConvo(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Native Camera</Text>
        <Text style={styles.subtitle}>
          Launch the device system camera UI to take high-resolution photos and share them.
        </Text>

        <TouchableOpacity style={styles.captureButton} onPress={takePhotoWithCamera} activeOpacity={0.8}>
          <Text style={styles.captureButtonText}>📷 Open Native Camera</Text>
        </TouchableOpacity>

        {imageUri ? (
          <View style={styles.previewCard}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => setSendModalVisible(true)}
              >
                <Text style={styles.sendButtonText}>💬 Share in Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retakeButton}
                onPress={takePhotoWithCamera}
              >
                <Text style={styles.retakeButtonText}>🔄 Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setImageUri(null);
                  setImageBase64(null);
                }}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyText}>No photo taken yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the button above to launch the native camera interface.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Select Conversation Modal */}
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
                <Text style={styles.emptySubtext}>No active conversations found.</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  captureButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  previewCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    marginBottom: SPACING.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    width: '100%',
  },
  sendButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  retakeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  clearButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.sm,
  },
  emptyBox: {
    width: '100%',
    padding: SPACING.xxxl,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
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
