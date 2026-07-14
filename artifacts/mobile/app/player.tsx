import React, { useRef } from 'react';
import {
  Dimensions,
  Image,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { useLibrary } from '@/context/LibraryContext';
import { formatDuration } from '@/constants/mockData';

const { width: SCREEN_W } = Dimensions.get('window');
const ART_SIZE = Math.min(SCREEN_W - 48, 340);

export default function PlayerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentTrack, isPlaying, progress, currentTime, shuffle, repeat, pause, resume, next, previous, seek, toggleShuffle, toggleRepeat } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const seekBarWidth = useRef(0);
  const [showQueue, setShowQueue] = React.useState(false);
  const [showLyrics, setShowLyrics] = React.useState(false);

  if (!currentTrack) {
    router.back();
    return null;
  }

  const fav = isFavorite(currentTrack.id);
  const gradients = currentTrack.gradientColors as [string, string];
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX } = evt.nativeEvent;
      const ratio = locationX / (seekBarWidth.current || 1);
      seek(ratio * currentTrack.duration);
    },
    onPanResponderMove: (evt) => {
      const { locationX } = evt.nativeEvent;
      const ratio = Math.max(0, Math.min(1, locationX / (seekBarWidth.current || 1)));
      seek(ratio * currentTrack.duration);
    },
  });

  const repeatIcon = repeat === 'one' ? 'repeat' : 'repeat';
  const repeatColor = repeat !== 'none' ? colors.primary : colors.mutedForeground;

  return (
    <LinearGradient
      colors={[...gradients, '#000000'] as [string, string, string]}
      style={[styles.container, { paddingTop: topPad }]}
      locations={[0, 0.5, 1]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.topBtn}>
          <Feather name="chevron-down" size={28} color="#fff" />
        </Pressable>
        <View style={styles.topCenter}>
          <Text style={styles.topLabel}>Now Playing</Text>
          <Text style={styles.topAlbum} numberOfLines={1}>{currentTrack.album}</Text>
        </View>
        <Pressable hitSlop={12} style={styles.topBtn} onPress={() => {}}>
          <Feather name="more-horizontal" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: bottomPad + 16 }} showsVerticalScrollIndicator={false}>
        {/* Album art */}
        <View style={styles.artContainer}>
          <Image
            source={currentTrack.cover}
            style={[styles.art, { width: ART_SIZE, height: ART_SIZE }]}
          />
        </View>

        {/* Track info + heart */}
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleFavorite(currentTrack); }}
            hitSlop={8}
          >
            <Feather name="heart" size={24} color={fav ? colors.primary : 'rgba(255,255,255,0.6)'} />
          </Pressable>
        </View>

        {/* Progress bar */}
        <View style={styles.seekContainer}>
          <View
            style={styles.seekTrack}
            onLayout={(e) => { seekBarWidth.current = e.nativeEvent.layout.width; }}
            {...panResponder.panHandlers}
          >
            <View style={[styles.seekFill, { width: `${progress * 100}%` as any, backgroundColor: colors.primary }]} />
            <View style={[styles.seekThumb, { left: `${progress * 100}%` as any, backgroundColor: colors.primary }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(currentTime)}</Text>
            <Text style={styles.timeText}>{formatDuration(currentTrack.duration)}</Text>
          </View>
        </View>

        {/* Main controls */}
        <View style={styles.controls}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleShuffle(); }}>
            <Feather name="shuffle" size={22} color={shuffle ? colors.primary : 'rgba(255,255,255,0.6)'} />
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); previous(); }}>
            <Feather name="skip-back" size={34} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); if (isPlaying) pause(); else resume(); }}
            style={[styles.playBtn, { backgroundColor: '#fff' }]}
          >
            <Feather name={isPlaying ? 'pause' : 'play'} size={30} color="#000" />
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); next(); }}>
            <Feather name="skip-forward" size={34} color="#fff" />
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRepeat(); }}>
            <View>
              <Feather name={repeatIcon} size={22} color={repeatColor} />
              {repeat === 'one' && (
                <View style={[styles.repeatBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.repeatBadgeText}>1</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>

        {/* Secondary controls */}
        <View style={styles.secondary}>
          <Pressable style={styles.secBtn} onPress={() => setShowLyrics((v) => !v)}>
            <Feather name="align-left" size={20} color={showLyrics ? colors.primary : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.secLabel, { color: showLyrics ? colors.primary : 'rgba(255,255,255,0.6)' }]}>Lyrics</Text>
          </Pressable>
          <Pressable style={styles.secBtn} onPress={() => setShowQueue((v) => !v)}>
            <Feather name="list" size={20} color={showQueue ? colors.primary : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.secLabel, { color: showQueue ? colors.primary : 'rgba(255,255,255,0.6)' }]}>Queue</Text>
          </Pressable>
          <Pressable style={styles.secBtn}>
            <Feather name="share-2" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={[styles.secLabel, { color: 'rgba(255,255,255,0.6)' }]}>Share</Text>
          </Pressable>
        </View>

        {/* Lyrics panel */}
        {showLyrics && (
          <View style={[styles.panel, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <Text style={styles.panelTitle}>Lyrics</Text>
            <Text style={styles.lyricsText}>
              {`♪ Lyrics are not available for this track.\n\nConnect your YouTube account to access synchronized lyrics when available.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  topBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  topCenter: { flex: 1, alignItems: 'center' },
  topLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', letterSpacing: 1 },
  topAlbum: { fontSize: 13, color: '#fff', fontFamily: 'Inter_600SemiBold' },
  artContainer: { alignItems: 'center', paddingVertical: 24 },
  art: { borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24, gap: 12 },
  infoText: { flex: 1 },
  trackTitle: { fontSize: 22, color: '#fff', fontFamily: 'Inter_700Bold', marginBottom: 4 },
  trackArtist: { fontSize: 16, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular' },
  seekContainer: { paddingHorizontal: 24, marginBottom: 24 },
  seekTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginBottom: 8 },
  seekFill: { height: 4, borderRadius: 2, position: 'absolute', top: 0, left: 0 },
  seekThumb: { position: 'absolute', top: -5, width: 14, height: 14, borderRadius: 7, marginLeft: -7 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 32 },
  playBtn: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  repeatBadge: { position: 'absolute', top: -4, right: -4, width: 12, height: 12, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  repeatBadgeText: { fontSize: 8, color: '#fff', fontFamily: 'Inter_700Bold' },
  secondary: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, marginBottom: 24 },
  secBtn: { alignItems: 'center', gap: 6 },
  secLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  panel: { marginHorizontal: 16, borderRadius: 16, padding: 20, marginBottom: 16 },
  panelTitle: { fontSize: 16, color: '#fff', fontFamily: 'Inter_700Bold', marginBottom: 12 },
  lyricsText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular', lineHeight: 22, textAlign: 'center' },
});
