import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Track } from '@/constants/mockData';

interface PlayerContextValue {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  play: (track: Track, newQueue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextValue>({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  progress: 0,
  currentTime: 0,
  shuffle: false,
  repeat: 'none',
  play: () => {},
  pause: () => {},
  resume: () => {},
  next: () => {},
  previous: () => {},
  seek: () => {},
  toggleShuffle: () => {},
  toggleRepeat: () => {},
  addToQueue: () => {},
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'one' | 'all'>('none');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatRef = useRef(repeat);
  const queueRef = useRef(queue);
  const queueIndexRef = useRef(queueIndex);
  const shuffleRef = useRef(shuffle);

  repeatRef.current = repeat;
  queueRef.current = queue;
  queueIndexRef.current = queueIndex;
  shuffleRef.current = shuffle;

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const doNext = useCallback((currentQueue: Track[], currentIndex: number) => {
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
  }, [stopInterval]);

  const startInterval = useCallback((trackDuration: number) => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;
        if (next >= trackDuration) {
          stopInterval();
          if (repeatRef.current === 'one') {
            setCurrentTime(0);
            startInterval(trackDuration);
          } else {
            doNext(queueRef.current, queueIndexRef.current);
          }
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [stopInterval, doNext]);

  const play = useCallback((track: Track, newQueue?: Track[]) => {
    stopInterval();
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      const i = idx >= 0 ? idx : 0;
      setQueueIndex(i);
      queueRef.current = newQueue;
      queueIndexRef.current = i;
    }
    startInterval(track.duration);
  }, [stopInterval, startInterval]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    stopInterval();
  }, [stopInterval]);

  const resume = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying(true);
    startInterval(currentTrack.duration);
  }, [currentTrack, startInterval]);

  const next = useCallback(() => {
    doNext(queueRef.current, queueIndexRef.current);
  }, [doNext]);

  const previous = useCallback(() => {
    if (currentTime > 3) {
      setCurrentTime(0);
      return;
    }
    if (queueRef.current.length === 0) return;
    const prevIdx = queueIndexRef.current > 0 ? queueIndexRef.current - 1 : queueRef.current.length - 1;
    setQueueIndex(prevIdx);
    setCurrentTrack(queueRef.current[prevIdx]);
    setCurrentTime(0);
    setIsPlaying(true);
    startInterval(queueRef.current[prevIdx].duration);
  }, [currentTime, startInterval]);

  const seek = useCallback((time: number) => {
    if (!currentTrack) return;
    setCurrentTime(Math.max(0, Math.min(time, currentTrack.duration)));
  }, [currentTrack]);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const toggleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'none' ? 'one' : r === 'one' ? 'all' : 'none'));
  }, []);
  const addToQueue = useCallback((track: Track) => {
    setQueue((q) => [...q, track]);
  }, []);

  useEffect(() => () => stopInterval(), [stopInterval]);

  const duration = currentTrack?.duration ?? 1;
  const progress = Math.min(currentTime / duration, 1);

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, queueIndex, isPlaying, progress, currentTime,
      shuffle, repeat, play, pause, resume, next, previous, seek,
      toggleShuffle, toggleRepeat, addToQueue,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
