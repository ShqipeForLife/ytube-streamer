import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import YoutubeIframe, { YoutubeIframeRef, PLAYER_STATES } from 'react-native-youtube-iframe';
import { usePlayer, ytBridge } from '@/context/PlayerContext';

/**
 * Invisible YouTube iframe player mounted at the root layout.
 * Reads PlayerContext and drives the YouTube player accordingly.
 */
export default function GlobalYouTubePlayer() {
  const { currentTrack, isPlaying, repeat, onYTProgress, onYTEnded } = usePlayer();
  const playerRef = useRef<YoutubeIframeRef>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoId = currentTrack?.youtubeId ?? null;

  // Register seekTo bridge
  useEffect(() => {
    ytBridge.seekTo = (seconds: number) => {
      playerRef.current?.seekTo(seconds, true);
    };
    return () => { ytBridge.seekTo = null; };
  }, []);

  const stopProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    stopProgress();
    progressInterval.current = setInterval(async () => {
      if (!playerRef.current) return;
      try {
        const [ct, dur] = await Promise.all([
          playerRef.current.getCurrentTime(),
          playerRef.current.getDuration(),
        ]);
        onYTProgress(ct, dur);
      } catch {
        // player not ready yet
      }
    }, 1000);
  }, [onYTProgress, stopProgress]);

  useEffect(() => {
    if (videoId && isPlaying) {
      startProgress();
    } else {
      stopProgress();
    }
    return stopProgress;
  }, [videoId, isPlaying, startProgress, stopProgress]);

  const handleStateChange = useCallback(
    (state: PLAYER_STATES) => {
      if (state === PLAYER_STATES.ENDED) {
        stopProgress();
        onYTEnded();
      }
    },
    [onYTEnded, stopProgress]
  );

  if (!videoId) return null;

  return (
    <View style={styles.hidden} pointerEvents="none">
      <YoutubeIframe
        ref={playerRef}
        height={200}
        width={200}
        videoId={videoId}
        play={isPlaying}
        forceAndroidAutoplay
        onChangeState={handleStateChange}
        initialPlayerParams={{
          controls: false,
          preventFullScreen: true,
          loop: repeat === 'one',
          rel: false,
        }}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
        }}
        viewContainerStyle={styles.player}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
    bottom: 0,
    left: 0,
    zIndex: -1,
  },
  player: {
    width: 200,
    height: 200,
  },
});
