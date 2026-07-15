import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Track } from '@/constants/mockData';

// Module-level bridge so GlobalYouTubePlayer can register its controls
// without circular imports
export const ytBridge = {
  seekTo: null as ((seconds: number) => void) | null,
  getCurrentTime: null as (() => Promise<number>) | null,
};

interface PlayerContextValue {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  isYouTubeTrack: boolean;
  play: (track: Track, newQueue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  // Called by GlobalYouTubePlayer to sync progress
  onYTProgress: (currentTime: number, duration: number) => void;
  onYTEnded: () => void;
}

const PlayerContext = createContext<PlayerContextValue>({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  progress: 0,
  currentTime: 0,
  duration: 1,
  shuffle: false,
  repeat: 'none',
  isYouTubeTrack: false,
  play: () => {},
  pause: () => {},
  resume: () => {},
  next: () => {},
  previous: () => {},
  seek: () => {},
  toggleShuffle: () => {},
  toggleRepeat: () => {},
  addToQueue: () => {},
  onYTProgress: () => {},
  onYTEnded: () => {},
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [ytDuration, setYtDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'one' | 'all'>('none');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatRef = useRef(repeat);
  const queueRef = useRef(queue);
  const queueIndexRef = useRef(queueIndex);
  const shuffleRef = useRef(shuffle);
  const currentTrackRef = useRef(currentTrack);

  repeatRef.current = repeat;
  queueRef.current = queue;
  queueIndexRef.current = queueIndex;
  shuffleRef.current = shuffle;
  currentTrackRef.current = currentTrack;

  const isYouTubeTrack = !!currentTrack?.youtubeId;

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const doNext = useCallback(
    (currentQueue: Track[], currentIndex: number) => {
      if (currentQueue.length === 0) return;
      let nextIdx: number;
      if (shuffleRef.current) {
        nextIdx = Math.floor(Math.random() * currentQueue.length);
      } else {
        nextIdx = currentIndex + 1;
        if (nextIdx >= currentQueue.length) {
          if (repeatRef.current === 'all') {
            nextIdx = 0;
          } else {
            setIsPlaying(false);
            stopInterval();
            return;
          }
        }
      }
      setQueueIndex(nextIdx);
      setCurrentTrack(currentQueue[nextIdx]);
      setCurrentTime(0);
      setIsPlaying(true);
    },
    [stopInterval]
  );

  const startLocalInterval = useCallback(
    (trackDuration: number) => {
      stopInterval();
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= trackDuration) {
            stopInterval();
            if (repeatRef.current === 'one') {
              setCurrentTime(0);
              startLocalInterval(trackDuration);
            } else {
              doNext(queueRef.current, queueIndexRef.current);
            }
            return 0;
          }
          return next;
        });
      }, 1000);
    },
    [stopInterval, doNext]
  );

  const play = useCallback(
    (track: Track, newQueue?: Track[]) => {
      stopInterval();
      setCurrentTrack(track);
      setCurrentTime(0);
      setYtDuration(0);
      setIsPlaying(true);
      if (newQueue) {
        setQueue(newQueue);
        const idx = newQueue.findIndex((t) => t.id === track.id);
        const i = idx >= 0 ? idx : 0;
        setQueueIndex(i);
        queueRef.current = newQueue;
        queueIndexRef.current = i;
      }
      // Only use local interval for non-YouTube tracks
      if (!track.youtubeId) {
        startLocalInterval(track.duration);
      }
    },
    [stopInterval, startLocalInterval]
  );

  const pause = useCallback(() => {
    setIsPlaying(false);
    stopInterval();
  }, [stopInterval]);

  const resume = useCallback(() => {
    if (!currentTrackRef.current) return;
    setIsPlaying(true);
    if (!currentTrackRef.current.youtubeId) {
      startLocalInterval(currentTrackRef.current.duration);
    }
  }, [startLocalInterval]);

  const next = useCallback(() => {
    stopInterval();
    doNext(queueRef.current, queueIndexRef.current);
  }, [doNext, stopInterval]);

  const previous = useCallback(() => {
    stopInterval();
    if (currentTime > 3) {
      setCurrentTime(0);
      if (ytBridge.seekTo) ytBridge.seekTo(0);
      if (currentTrackRef.current && !currentTrackRef.current.youtubeId) {
        setIsPlaying(true);
        startLocalInterval(currentTrackRef.current.duration);
      }
      return;
    }
    if (queueRef.current.length === 0) return;
    const prevIdx =
      queueIndexRef.current > 0
        ? queueIndexRef.current - 1
        : queueRef.current.length - 1;
    setQueueIndex(prevIdx);
    setCurrentTrack(queueRef.current[prevIdx]);
    setCurrentTime(0);
    setIsPlaying(true);
    if (!queueRef.current[prevIdx].youtubeId) {
      startLocalInterval(queueRef.current[prevIdx].duration);
    }
  }, [currentTime, startLocalInterval, stopInterval]);

  const seek = useCallback(
    (time: number) => {
      if (!currentTrackRef.current) return;
      const clamped = Math.max(0, Math.min(time, currentTrackRef.current.duration));
      setCurrentTime(clamped);
      if (currentTrackRef.current.youtubeId && ytBridge.seekTo) {
        ytBridge.seekTo(clamped);
      }
    },
    []
  );

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const toggleRepeat = useCallback(
    () => setRepeat((r) => (r === 'none' ? 'one' : r === 'one' ? 'all' : 'none')),
    []
  );
  const addToQueue = useCallback((track: Track) => {
    setQueue((q) => [...q, track]);
  }, []);

  // Called by GlobalYouTubePlayer to sync time/duration
  const onYTProgress = useCallback((ct: number, dur: number) => {
    setCurrentTime(Math.floor(ct));
    if (dur > 0) setYtDuration(Math.floor(dur));
  }, []);

  const onYTEnded = useCallback(() => {
    if (repeatRef.current === 'one') {
      setCurrentTime(0);
      if (ytBridge.seekTo) ytBridge.seekTo(0);
    } else {
      doNext(queueRef.current, queueIndexRef.current);
    }
  }, [doNext]);

  useEffect(() => () => stopInterval(), [stopInterval]);

  const effectiveDuration = isYouTubeTrack
    ? ytDuration > 0 ? ytDuration : (currentTrack?.duration ?? 1)
    : (currentTrack?.duration ?? 1);

  const progress = Math.min(currentTime / Math.max(effectiveDuration, 1), 1);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        queueIndex,
        isPlaying,
        progress,
        currentTime,
        duration: effectiveDuration,
        shuffle,
        repeat,
        isYouTubeTrack,
        play,
        pause,
        resume,
        next,
        previous,
        seek,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        onYTProgress,
        onYTEnded,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
