import React, { useRef } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import AlbumCard from '@/components/AlbumCard';
import SectionHeader from '@/components/SectionHeader';
import TrackCard from '@/components/TrackCard';
import { FEATURED_PLAYLISTS, QUICK_PICKS, TRACKS, TRENDING_TRACKS } from '@/constants/mockData';

const GREETING = (() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
})();

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { play } = usePlayer();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 200 : 160 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.background === '#000000' ? '#1a0010' : colors.background === '#0F0F0F' ? '#1a0010' : '#ffe5e5', colors.background]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{GREETING}</Text>
            <Text style={[styles.brand, { color: colors.primary }]}>YTube Streamer</Text>
          </View>
          <Pressable onPress={() => router.push('/search')} style={[styles.iconBtn, { backgroundColor: colors.card }]}>
            <Feather name="bell" size={20} color={colors.foreground} />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Featured */}
      <SectionHeader title="Featured" />
      <FlatList
        data={FEATURED_PLAYLISTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlbumCard item={item} size={160} onPress={() => play(item.tracks[0], item.tracks)} />
        )}
      />

      {/* Quick Picks */}
      <SectionHeader title="Quick picks" onSeeAll={() => {}} />
      <FlatList
        data={QUICK_PICKS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => play(item, QUICK_PICKS)}
            style={[styles.quickCard, { backgroundColor: colors.card }]}
          >
            <Image source={item.cover} style={styles.quickCover} />
            <View style={styles.quickInfo}>
              <Text style={[styles.quickTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]} numberOfLines={1}>{item.artist}</Text>
            </View>
          </Pressable>
        )}
      />

      {/* Trending */}
      <SectionHeader title="Trending now" onSeeAll={() => {}} />
      {TRENDING_TRACKS.slice(0, 5).map((track, i) => (
        <TrackCard key={track.id} track={track} queue={TRENDING_TRACKS} showIndex={i} />
      ))}

      {/* Recommended */}
      <SectionHeader title="Recommended for you" onSeeAll={() => {}} />
      <FlatList
        data={TRACKS.slice(6)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlbumCard item={{ ...item, name: item.title, description: item.artist }} size={130} onPress={() => play(item, TRACKS)} />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 8, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  brand: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hList: { paddingHorizontal: 16, gap: 12 },
  quickCard: { width: 240, flexDirection: 'row', borderRadius: 10, overflow: 'hidden', alignItems: 'center' },
  quickCover: { width: 56, height: 56 },
  quickInfo: { flex: 1, paddingHorizontal: 12, gap: 2 },
  quickTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
  quickSub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
