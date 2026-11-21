import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';

export const AttachmentMenu = ({
  visible,
  onClose,
  onPickFromGallery,
  onTakePhotoNative,
  onOpenCustomCamera,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.indicator} />
              <Text style={styles.sheetTitle}>Add Attachment</Text>

              {/* Option 1: Gallery */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => {
                  onClose();
                  onPickFromGallery();
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={styles.iconText}>🖼️</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Photo Gallery</Text>
                  <Text style={styles.optionSubtitle}>Select an image from device library</Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: Native Camera */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => {
                  onClose();
                  onTakePhotoNative();
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={styles.iconText}>📷</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Native Camera</Text>
                  <Text style={styles.optionSubtitle}>Capture with system camera interface</Text>
                </View>
              </TouchableOpacity>

              {/* Option 3: Custom Camera */}
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => {
                  onClose();
                  onOpenCustomCamera();
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                  <Text style={styles.iconText}>📹</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Custom Camera (Expo Camera)</Text>
                  <Text style={styles.optionSubtitle}>Capture with live viewfinder</Text>
                </View>
              </TouchableOpacity>

              {/* Cancel */}
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.borderDark,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  optionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  optionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
