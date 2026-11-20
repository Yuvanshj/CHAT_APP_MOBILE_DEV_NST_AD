import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUsers } from '../hooks/useUsers.js';
import { UserCard } from '../components/UserCard.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';

export const AllUsersScreen = () => {
  const navigation = useNavigation();
  const {
    filteredUsers,
    selectedUserIds,
    selectedUsers,
    loading,
    refreshing,
    error,
    searchQuery,
    setSearchQuery,
    conversationType,
    setConversationType,
    conversationName,
    setConversationName,
    creating,
    createError,
    toggleUserSelection,
    clearSelection,
    createConversation,
    refresh,
  } = useUsers();

  const handleStartConversation = async () => {
    const newConvo = await createConversation();
    if (newConvo) {
      Alert.alert(
        'Success',
        `Conversation "${newConvo.name}" created!`,
        [
          {
            text: 'Open Chat',
            onPress: () => {
              navigation.navigate('Conversations', {
                screen: 'Chat',
                params: {
                  data: {
                    conversationId: newConvo.id,
                    name: newConvo.name,
                    type: newConvo.type,
                    participants: newConvo.participants_ids,
                    createdBy: newConvo.createdBy,
                  },
                },
              });
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    }
  };

  const isGroup = conversationType === 'GROUP';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>All Users</Text>
        <Text style={styles.subtitle}>Discover registered users and start a chat</Text>

        {/* Type Selector (DM vs GROUP) */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, !isGroup && styles.typeButtonActive]}
            onPress={() => setConversationType('DM')}
            activeOpacity={0.8}
          >
            <Text style={[styles.typeText, !isGroup && styles.typeTextActive]}>
              💬 Direct Message (DM)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, isGroup && styles.typeButtonActive]}
            onPress={() => setConversationType('GROUP')}
            activeOpacity={0.8}
          >
            <Text style={[styles.typeText, isGroup && styles.typeTextActive]}>
              👥 Group Chat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Group Name Input */}
        {isGroup && (
          <View style={styles.groupNameContainer}>
            <TextInput
              style={styles.groupNameInput}
              placeholder="Enter group conversation name..."
              placeholderTextColor={COLORS.textMuted}
              value={conversationName}
              onChangeText={setConversationName}
            />
          </View>
        )}

        {/* Search Users Input */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or bio..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Selected Users Chips */}
        {selectedUsers.length > 0 && (
          <View style={styles.selectedRow}>
            <Text style={styles.selectedCount}>
              Selected ({selectedUsers.length}):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedUsers.map((user) => (
                <View key={user.id} style={styles.userChip}>
                  <Text style={styles.chipText} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleUserSelection(user.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.chipRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Create Error Message */}
      {createError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {createError}</Text>
        </View>
      )}

      {/* User List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching users...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Could not load users</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'No users match your search term'
              : 'No registered users available on the server'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              isSelected={selectedUserIds.includes(item.id)}
              onPress={() => toggleUserSelection(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={clearSelection}
          disabled={selectedUserIds.length === 0}
        >
          <Text
            style={[
              styles.resetText,
              selectedUserIds.length === 0 && styles.disabledText,
            ]}
          >
            Reset
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.createButton,
            (selectedUserIds.length === 0 || creating) && styles.disabledButton,
          ]}
          onPress={handleStartConversation}
          disabled={selectedUserIds.length === 0 || creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>
              Start {isGroup ? 'Group' : 'DM'} ({selectedUserIds.length})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  groupNameContainer: {
    marginBottom: SPACING.sm,
  },
  groupNameInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 38,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  selectedCount: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
  },
  chipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    maxWidth: 90,
  },
  chipRemove: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.danger,
    fontWeight: '600',
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
    fontSize: 48,
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
  retryBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  listContent: {
    paddingBottom: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  resetButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
  },
  resetText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
  createButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: COLORS.borderDark,
    opacity: 0.6,
  },
});
