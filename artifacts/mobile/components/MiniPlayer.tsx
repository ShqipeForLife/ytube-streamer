import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';

const MINI_H = 64;

export default function MiniPlayer() {
  const colors = useColors();
  const { currentTrack, isPlaying, progress, pause, resume } = usePlayer();
  const slideAnim = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: currentTrack ? 0 : 80,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [!!currentTrack]);

  if (!currentTrack) return null;

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) pause();
    else resume();
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Pressable
        onPress={() => router.push('/player')}
        style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}
      >
        {/* Progress bar */}
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: colors.primary }]} />
        </View>

        <View style={styles.inner}>
          <Image source={currentTrack.cover} style={styles.cover} />
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={[styles.artist, { color: colors.mutedForeground }]} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          <View style={styles.controls}>
            <Pressable onPress={handlePlayPause} style={styles.btn} hitSlop={8}>
              <Feather name={isPlaying ? 'pause' : 'play'} size={22} color={colors.foreground} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 84 : 80,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  container: {
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  progressBg: {
    height: 2,
  },
  progressFill: {
    height: 2,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: MINI_H,
    gap: 12,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  btn: {
    padding: 4,
  },
});
