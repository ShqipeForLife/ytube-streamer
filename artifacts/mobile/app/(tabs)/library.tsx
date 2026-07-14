import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { useLibrary } from '@/context/LibraryContext';
import { useYouTube, YouTubePlaylist, YouTubeVideo } from '@/context/YouTubeContext';
import AlbumCard from '@/components/AlbumCard';
import TrackCard from '@/components/TrackCard';
import { useRouter } from 'expo-router';

type Tab = 'playlists' | 'favorites' | 'youtube';

// ── YouTube playlist card ─────────────────────────────────────────────────────
function YTPlaylistCard({ item, onPress }: { item: YouTubePlaylist; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.ytCard, { backgroundColor: colors.card }]}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.ytCardThumb} />
      ) : (
        <View style={[styles.ytCardThumbFallback, { backgroundColor: colors.secondary }]}>
          <Feather name="list" size={28} color={colors.mutedForeground} />
        </View>
      )}
      <View style={styles.ytCardInfo}>
        <Text style={[styles.ytCardTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.ytCardMeta, { color: colors.mutedForeground }]}>{item.itemCount} videos</Text>
      </View>
      <Feather name="external-link" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

// ── YouTube video row ─────────────────────────────────────────────────────────
function YTVideoRow({ item, onPress }: { item: YouTubeVideo; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.ytVideoRow, { borderBottomColor: colors.border }]}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.ytVideoThumb} />
      ) : (
        <View style={[styles.ytVideoThumbFallback, { backgroundColor: colors.secondary }]}>
          <Feather name="play" size={16} color={colors.mutedForeground} />
        </View>
      )}
      <View style={styles.ytVideoInfo}>
        <Text style={[styles.ytVideoTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.ytVideoMeta, { color: colors.mutedForeground }]}>{item.channelTitle}</Text>
      </View>
      <View style={[styles.ytPlayBtn, { backgroundColor: '#ef444422' }]}>
        <Feather name="play" size={14} color="#ef4444" />
      </View>
    </Pressable>
  );
}

// ── YouTube tab content ───────────────────────────────────────────────────────
function YouTubeContent() {
  const colors = useColors();
  const { user, playlists, likedVideos, isLoading, isReady, signIn, openVideo, openPlaylist } = useYouTube();
  const router = useRouter();
  const [ytView, setYtView] = useState<'playlists' | 'liked'>('playlists');

  if (!user) {
    return (
      <View style={styles.empty}>
        <View style={[styles.ytEmptyIcon, { backgroundColor: '#ff000022' }]}>
          <Feather name="youtube" size={40} color="#ef4444" />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Connect YouTube</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Sign in to see your playlists and liked videos
        </Text>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); signIn(); }}
          disabled={!isReady}
          style={[styles.ytSignInBtn, { opacity: isReady ? 1 : 0.5 }]}
        >
          <View style={styles.googleG}>
            <Text style={styles.googleGText}>G</Text>
          </View>
          <Text style={styles.ytSignInText}>Sign in with Google</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/settings')} style={{ marginTop: 8 }}>
          <Text style={[styles.ytSettingsLink, { color: colors.primary }]}>Configure in Settings →</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color="#ef4444" size="large" />
        <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 12 }]}>
          Loading your YouTube library…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Sub-tabs */}
      <View style={[styles.subTabRow, { borderBottomColor: colors.border }]}>
        {(['playlists', 'liked'] as const).map((v) => (
          <Pressable
            key={v}
            onPress={() => setYtView(v)}
            style={[styles.subTab, ytView === v && { borderBottomColor: '#ef4444', borderBottomWidth: 2 }]}
          >
            <Feather
              name={v === 'playlists' ? 'list' : 'heart'}
              size={14}
              color={ytView === v ? '#ef4444' : colors.mutedForeground}
            />
            <Text style={[styles.subTabLabel, { color: ytView === v ? '#ef4444' : colors.mutedForeground }]}>
              {v === 'playlists' ? `Playlists (${playlists.length})` : `Liked (${likedVideos.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {ytView === 'playlists' ? (
        playlists.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="list" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No playlists found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Create playlists on YouTube to see them here
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: Platform.OS === 'web' ? 200 : 160 }}
            renderItem={({ item }) => (
              <YTPlaylistCard item={item} onPress={() => openPlaylist(item.id)} />
            )}
          />
        )
      ) : likedVideos.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="heart" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No liked videos</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Like videos on YouTube to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={likedVideos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: Platform.OS === 'web' ? 200 : 160 }}
          renderItem={({ item }) => (
            <YTVideoRow item={item} onPress={() => openVideo(item.id)} />
          )}
        />
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { play } = usePlayer();
  const { favorites, playlists, createPlaylist } = useLibrary();
  const { user } = useYouTube();
  const [activeTab, setActiveTab] = useState<Tab>('playlists');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleCreatePlaylist = () => {
    if (!newName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createPlaylist(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'playlists', label: 'Playlists', icon: 'list' },
    { key: 'favorites', label: 'Liked', icon: 'heart' },
    { key: 'youtube', label: 'YouTube', icon: 'youtube' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Library</Text>
        {activeTab === 'playlists' && (
          <Pressable
            onPress={() => setShowCreate(true)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={18} color="#fff" />
          </Pressable>
        )}
        {activeTab === 'youtube' && user && (
          <View style={styles.ytUserPill}>
            {user.picture ? (
              <Image source={{ uri: user.picture }} style={styles.ytUserPillAvatar} />
            ) : null}
            <Text style={[styles.ytUserPillName, { color: colors.mutedForeground }]} numberOfLines={1}>
              {user.name}
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => {
          const isYT = tab.key === 'youtube';
          const active = activeTab === tab.key;
          const activeColor = isYT ? '#ef4444' : colors.primary;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, active && { borderBottomColor: activeColor, borderBottomWidth: 2 }]}
            >
              <Feather name={tab.icon as any} size={16} color={active ? activeColor : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: active ? activeColor : colors.mutedForeground }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Create playlist modal */}
      {showCreate && activeTab === 'playlists' && (
        <View style={[styles.createBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.createTitle, { color: colors.foreground }]}>New playlist</Text>
          <TextInput
            style={[styles.createInput, { backgroundColor: colors.input, color: colors.foreground }]}
            placeholder="Playlist name..."
            placeholderTextColor={colors.mutedForeground}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
          <View style={styles.createActions}>
            <Pressable onPress={() => setShowCreate(false)} style={[styles.createBtn, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.createBtnText, { color: colors.foreground }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleCreatePlaylist} style={[styles.createBtn, { backgroundColor: colors.primary }]}>
              <Text style={[styles.createBtnText, { color: '#fff' }]}>Create</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Content */}
      {activeTab === 'youtube' ? (
        <YouTubeContent />
      ) : activeTab === 'playlists' ? (
        playlists.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="music" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No playlists yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Tap + to create your first playlist</Text>
          </View>
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: Platform.OS === 'web' ? 200 : 160, gap: 12 }}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <AlbumCard
                item={item}
                size={160}
                onPress={() => item.tracks.length > 0 ? play(item.tracks[0], item.tracks) : null}
              />
            )}
          />
        )
      ) : favorites.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="heart" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No liked songs</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Heart a song to add it here</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 200 : 160 }}
          renderItem={({ item }) => <TrackCard track={item} queue={favorites} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12 },
  tabLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  createBox: { margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, gap: 12 },
  createTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  createInput: { borderRadius: 8, padding: 10, fontSize: 14, fontFamily: 'Inter_400Regular' },
  createActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  createBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  createBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 32 },
  // YouTube empty
  ytEmptyIcon: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  ytSignInBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  googleG: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
  googleGText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  ytSignInText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#111' },
  ytSettingsLink: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  // YouTube sub-tabs
  subTabRow: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 4 },
  subTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  subTabLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  // YouTube playlist card
  ytCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginVertical: 6, borderRadius: 12, padding: 12 },
  ytCardThumb: { width: 60, height: 60, borderRadius: 8 },
  ytCardThumbFallback: { width: 60, height: 60, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  ytCardInfo: { flex: 1 },
  ytCardTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  ytCardMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  // YouTube video row
  ytVideoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  ytVideoThumb: { width: 80, height: 50, borderRadius: 6 },
  ytVideoThumbFallback: { width: 80, height: 50, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  ytVideoInfo: { flex: 1 },
  ytVideoTitle: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  ytVideoMeta: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  ytPlayBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  // Header YouTube pill
  ytUserPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ytUserPillAvatar: { width: 24, height: 24, borderRadius: 12 },
  ytUserPillName: { fontSize: 12, fontFamily: 'Inter_500Medium', maxWidth: 100 },
});
