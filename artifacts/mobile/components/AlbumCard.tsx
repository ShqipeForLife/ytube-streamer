import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { Playlist, Track } from '@/constants/mockData';

interface Props {
  item: { id: string; name?: string; title?: string; artist?: string; description?: string; cover: any; tracks?: Track[]; trackCount?: number };
  onPress?: () => void;
  size?: number;
}

export default function AlbumCard({ item, onPress, size = 150 }: Props) {
  const colors = useColors();
  const { play } = usePlayer();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) { onPress(); return; }
    if (item.tracks && item.tracks.length > 0) {
      play(item.tracks[0], item.tracks);
    }
  };

  const label = item.name ?? item.title ?? '';
  const sub = item.artist ?? item.description ?? (item.trackCount ? `${item.trackCount} tracks` : '');

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.container, { width: size, opacity: pressed ? 0.8 : 1 }]}
    >
      <Image source={item.cover} style={[styles.cover, { width: size, height: size, borderRadius: colors.radius }]} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {label}
        </Text>
        {sub ? (
          <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  cover: {
    resizeMode: 'cover',
  },
  info: {
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    lineHeight: 18,
  },
  sub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
