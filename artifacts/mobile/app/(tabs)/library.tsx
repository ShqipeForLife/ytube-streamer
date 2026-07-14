import React, { useState } from 'react';
import {
  Alert,
  FlatList,
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
import AlbumCard from '@/components/AlbumCard';
import SectionHeader from '@/components/SectionHeader';
import TrackCard from '@/components/TrackCard';

type Tab = 'playlists' | 'favorites' | 'downloads';

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { play } = usePlayer();
  const { favorites, playlists, createPlaylist } = useLibrary();
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
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Feather name={tab.icon as any} size={16} color={activeTab === tab.key ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.tabLabel, { color: activeTab === tab.key ? colors.primary : colors.mutedForeground }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Create playlist modal */}
      {showCreate && (
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
      {activeTab === 'playlists' ? (
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
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12 },
  tabLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  createBox: { margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, gap: 12 },
  createTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  createInput: { borderRadius: 8, padding: 10, fontSize: 14, fontFamily: 'Inter_400Regular' },
  createActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  createBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  createBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 32 },
});
