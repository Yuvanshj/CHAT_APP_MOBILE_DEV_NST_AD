import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useConversations } from '../hooks/useConversations.js';
import { ConversationCard } from '../components/ConversationCard.js';
import { ServerConfigModal } from '../components/ServerConfigModal.js';
import { useAuth } from '../context/AuthContext.js';
import { PRESET_PROFILES } from '../constants/chatConstants.js';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme.js';

export const ConversationsScreen = () => {
  const navigation = useNavigation();
  const { conversations, loading, refreshing, error, refresh } = useConversations();
  const { isServerOnline, currentUserId, updateConfig } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [settingsVisible, setSettingsVisible] = useState(false);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (filterType === 'GROUPS') {
      list = list.filter((c) => c.type === 'GROUP');
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.createdByName && c.createdByName.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery, filterType]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* App Header */}
      <View style={styles.whatsappHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>chatApp</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('CameraScreen')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.headerIcon}>📷</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setSettingsVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.headerIcon}>⚙️</Text>
            </TouchableOpacity>

            <View
              style={[
                styles.statusPill,
                isServerOnline === true
                  ? styles.statusOnline
                  : isServerOnline === false
                  ? styles.statusOffline
                  : styles.statusChecking,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      isServerOnline === true
                        ? '#25D366'
                        : isServerOnline === false
                        ? '#EF4444'
                        : '#F59E0B',
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {isServerOnline === true ? 'Live' : isServerOnline === false ? 'Offline' : 'API'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Identity Switcher */}
        <View style={styles.identityBar}>
          <Text style={styles.identityLabel}>PROFILE:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.identityScroll}
          >
            {PRESET_PROFILES.map((p) => {
              const isActive = String(currentUserId) === String(p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.identityChip,
                    isActive && styles.identityChipActive,
                  ]}
                  onPress={() =>
                    updateConfig({
                      userId: p.id,
                      userName: p.name,
                      authHeader: p.auth,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.identityChipText,
                      isActive && styles.identityChipTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Search Bar & Modern Filter Chips */}
      <View style={styles.subHeader}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor="#8696A0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'ALL' && styles.filterChipActive]}
            onPress={() => setFilterType('ALL')}
          >
            <Text style={[styles.filterChipText, filterType === 'ALL' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'UNREAD' && styles.filterChipActive]}
            onPress={() => setFilterType('UNREAD')}
          >
            <Text style={[styles.filterChipText, filterType === 'UNREAD' && styles.filterChipTextActive]}>
              Unread
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'GROUPS' && styles.filterChipActive]}
            onPress={() => setFilterType('GROUPS')}
          >
            <Text style={[styles.filterChipText, filterType === 'GROUPS' && styles.filterChipTextActive]}>
              Groups
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>
            ⚠️ {error}
          </Text>
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.configBtn}
              onPress={() => setSettingsVisible(true)}
            >
              <Text style={styles.configText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No matching conversations' : 'No Conversations Yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Start a direct message or group chat with your contacts.'}
          </Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('AllUsers')}
            activeOpacity={0.8}
          >
            <Text style={styles.createBtnText}>+ Start New Conversation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationCard
              conversation={item}
              onPress={() => {
                navigation.navigate('Chat', {
                  data: {
                    conversationId: item.id,
                    name: item.name,
                    type: item.type,
                    participants: item.participants_ids,
                    createdBy: item.createdBy,
                  },
                });
              }}
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AllUsers')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      {/* Server Settings Modal */}
      <ServerConfigModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#008069',
  },
  whatsappHeader: {
    backgroundColor: '#008069',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconBtn: {
    padding: 4,
  },
  headerIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 4,
  },
  statusOnline: {},
  statusOffline: {},
  statusChecking: {},
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  identityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  identityLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DCF8C6',
    marginRight: 8,
    letterSpacing: 0.6,
  },
  identityScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  identityChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  identityChipActive: {
    backgroundColor: '#FFFFFF',
  },
  identityChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  identityChipTextActive: {
    color: '#008069',
    fontWeight: '700',
  },
  subHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9EDEF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 38,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111B21',
  },
  clearSearch: {
    fontSize: 14,
    color: '#8696A0',
    paddingHorizontal: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F0F2F5',
  },
  filterChipActive: {
    backgroundColor: '#E7F7F3',
  },
  filterChipText: {
    fontSize: 12,
    color: '#54656F',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#008069',
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.danger,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  errorActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
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
  configBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  configText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginBottom: SPACING.xl,
  },
  createBtn: {
    backgroundColor: '#008069',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  listContent: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
