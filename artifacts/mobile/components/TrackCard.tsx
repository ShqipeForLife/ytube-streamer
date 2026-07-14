import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { useLibrary } from '@/context/LibraryContext';
import { formatDuration, Track } from '@/constants/mockData';

interface Props {
  track: Track;
  queue?: Track[];
  showIndex?: number;
  onMorePress?: (track: Track) => void;
}

export default function TrackCard({ track, queue, showIndex, onMorePress }: Props) {
  const colors = useColors();
  const { play, currentTrack, isPlaying } = usePlayer();
  const { isFavorite, toggleFavorite } = useLibrary();
  const isActive = currentTrack?.id === track.id;
  const fav = isFavorite(track.id);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    play(track, queue ?? [track]);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.left}>
        {showIndex !== undefined ? (
          <Text style={[styles.index, { color: isActive ? colors.primary : colors.mutedForeground }]}>
            {showIndex + 1}
          </Text>
        ) : null}
        <View style={styles.coverWrapper}>
          <Image source={track.cover} style={styles.cover} />
          {isActive && isPlaying && (
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
              <Feather name="volume-2" size={16} color={colors.primary} />
            </View>
          )}
        </View>
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.title, { color: isActive ? colors.primary : colors.foreground }]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {track.artist} · {formatDuration(track.duration)}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFavorite(track); }}
          hitSlop={8}
          style={styles.actionBtn}
        >
          <Feather name="heart" size={18} color={fav ? colors.primary : colors.mutedForeground} />
        </Pressable>
        {onMorePress && (
          <Pressable onPress={() => onMorePress(track)} hitSlop={8} style={styles.actionBtn}>
            <Feather name="more-vertical" size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  index: {
    width: 20,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  coverWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cover: {
    width: 48,
    height: 48,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  sub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
});
