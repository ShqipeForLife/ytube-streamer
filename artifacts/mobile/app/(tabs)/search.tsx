import React, { useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import TrackCard from '@/components/TrackCard';
import SectionHeader from '@/components/SectionHeader';
import AlbumCard from '@/components/AlbumCard';
import { ARTISTS, SEARCH_CATEGORIES, TRACKS } from '@/constants/mockData';

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { play } = usePlayer();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const results = query.trim().length > 0
    ? TRACKS.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase()) ||
        t.album.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const showResults = query.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: focused ? colors.primary : colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search songs, artists, albums..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {showResults ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TrackCard track={item} queue={results} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="search" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results for "{query}"</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 200 : 160 }}>
          {/* Artists */}
          <SectionHeader title="Artists" />
          <FlatList
            data={ARTISTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.artistItem} onPress={() => play(TRACKS.filter((t) => t.artist === item.name)[0], TRACKS.filter((t) => t.artist === item.name))}>
                <View style={[styles.artistImg, { overflow: 'hidden' }]}>
                  <Pressable style={{ flex: 1 }}>
                    <View style={{ flex: 1, borderRadius: 50, overflow: 'hidden' }}>
                      {/* Artist avatar placeholder */}
                      <View style={[styles.artistAvatar, { backgroundColor: colors.card }]}>
                        <Feather name="user" size={32} color={colors.mutedForeground} />
                      </View>
                    </View>
                  </Pressable>
                </View>
                <Text style={[styles.artistName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.artistSub, { color: colors.mutedForeground }]} numberOfLines={1}>{item.followers} followers</Text>
              </Pressable>
            )}
          />

          {/* Browse by category */}
          <SectionHeader title="Browse categories" />
          <View style={styles.grid}>
            {SEARCH_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.catCard, { backgroundColor: cat.color }]}
                onPress={() => setQuery(cat.name)}
              >
                <Text style={styles.catName}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchIcon: { flexShrink: 0 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  hList: { paddingHorizontal: 16, gap: 16 },
  artistItem: { width: 90, alignItems: 'center', gap: 8 },
  artistImg: { width: 80, height: 80, borderRadius: 40 },
  artistAvatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  artistName: { fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  artistSub: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  catCard: {
    width: '47%',
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
