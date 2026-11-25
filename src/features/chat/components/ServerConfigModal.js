import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext.js';
import { PRESET_PROFILES } from '../constants/chatConstants.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';

export const ServerConfigModal = ({
  visible,
  onClose,
}) => {
  const {
    apiBaseUrl,
    authHeader,
    currentUserId,
    currentUserName,
    updateConfig,
    testConnection,
    checkingConnection,
  } = useAuth();

  const [url, setUrl] = useState(apiBaseUrl);
  const [auth, setAuth] = useState(authHeader);
  const [userId, setUserId] = useState(currentUserId);
  const [userName, setUserName] = useState(currentUserName);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    updateConfig({
      baseUrl: url.trim(),
      authHeader: auth.trim(),
      userId: userId.trim(),
      userName: userName.trim(),
    });
    onClose();
  };

  const handleTest = async () => {
    updateConfig({
      baseUrl: url.trim(),
      authHeader: auth.trim(),
    });
    const result = await testConnection();
    setTestResult(result);
  };

  const setPreset = (presetUrl) => {
    setUrl(presetUrl);
    setTestResult(null);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Backend & User Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.description}>
            Configure the backend server URL, authentication credentials, and active user profile.
          </Text>

          {/* Quick Presets */}
          <Text style={styles.label}>Quick URL Presets:</Text>
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setPreset('http://localhost:3000')}
            >
              <Text style={styles.presetText}>Localhost (Web/iOS)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setPreset('http://10.0.2.2:3000')}
            >
              <Text style={styles.presetText}>Android (10.0.2.2)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setPreset('http://10.7.27.242:3000')}
            >
              <Text style={styles.presetText}>Mac Wi-Fi (10.7.27.242)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => setPreset('http://10.7.1.89:3000')}
            >
              <Text style={styles.presetText}>Lab LAN (10.7.1.89)</Text>
            </TouchableOpacity>
          </View>

          {/* API Base URL */}
          <Text style={styles.label}>API Base URL:</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={(t) => {
              setUrl(t);
              setTestResult(null);
            }}
            placeholder="http://192.168.1.100:3000"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Auth Header */}
          <Text style={styles.label}>Authorization Header:</Text>
          <TextInput
            style={styles.input}
            value={auth}
            onChangeText={(t) => {
              setAuth(t);
              setTestResult(null);
            }}
            placeholder="Basic first:second or Bearer <token>"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Quick Profile Presets */}
          <Text style={styles.label}>Switch Active User Profile (1-Tap):</Text>
          <View style={styles.presetsRow}>
            {PRESET_PROFILES.map((p) => {
              const isSelected = userId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.presetChip,
                    isSelected && styles.presetChipActive,
                  ]}
                  onPress={() => {
                    setUserId(p.id);
                    setUserName(p.name);
                    setAuth(p.auth);
                  }}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isSelected && styles.presetTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Current User ID */}
          <Text style={styles.label}>Current User ID (Your Identity):</Text>
          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            placeholder="e.g. first or user_1"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Current User Name */}
          <Text style={styles.label}>Display Name:</Text>
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholder="e.g. Vaibhav"
          />

          {/* Connection Test */}
          <TouchableOpacity
            style={[styles.testButton, checkingConnection && styles.disabledBtn]}
            onPress={handleTest}
            disabled={checkingConnection}
          >
            {checkingConnection ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.testButtonText}>🔍 Test Server Connection</Text>
            )}
          </TouchableOpacity>

          {testResult && (
            <View
              style={[
                styles.resultCard,
                testResult.success ? styles.resultSuccess : styles.resultError,
              ]}
            >
              <Text
                style={[
                  styles.resultText,
                  testResult.success ? styles.resultTextSuccess : styles.resultTextError,
                ]}
              >
                {testResult.success ? '✓ ' : '✕ '}
                {testResult.message}
              </Text>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  closeBtnText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  content: {
    padding: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  presetChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: '#00A884',
    borderColor: '#008069',
  },
  presetText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  testButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  resultCard: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  resultSuccess: {
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  resultError: {
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  resultText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  resultTextSuccess: {
    color: COLORS.success,
  },
  resultTextError: {
    color: COLORS.danger,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
});
