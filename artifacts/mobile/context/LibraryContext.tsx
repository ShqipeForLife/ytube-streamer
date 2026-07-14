import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, Track } from '@/constants/mockData';

interface LibraryContextValue {
  favorites: Track[];
  playlists: Playlist[];
  isFavorite: (trackId: string) => boolean;
  toggleFavorite: (track: Track) => void;
  createPlaylist: (name: string, description?: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
}

const LibraryContext = createContext<LibraryContextValue>({
  favorites: [],
  playlists: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  createPlaylist: () => {},
  deletePlaylist: () => {},
  addToPlaylist: () => {},
  removeFromPlaylist: () => {},
});

const FAV_KEY = '@ytube_favorites';
const PLAYLISTS_KEY = '@ytube_playlists';

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(FAV_KEY).then((v) => {
      if (v) setFavorites(JSON.parse(v));
    });
    AsyncStorage.getItem(PLAYLISTS_KEY).then((v) => {
      if (v) setPlaylists(JSON.parse(v));
    });
  }, []);

  const persistFavorites = (favs: Track[]) => {
    setFavorites(favs);
    AsyncStorage.setItem(FAV_KEY, JSON.stringify(favs));
  };

  const persistPlaylists = (pls: Playlist[]) => {
    setPlaylists(pls);
    AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(pls));
  };

  const isFavorite = useCallback((trackId: string) => favorites.some((t) => t.id === trackId), [favorites]);

  const toggleFavorite = useCallback((track: Track) => {
    setFavorites((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      const updated = exists ? prev.filter((t) => t.id !== track.id) : [...prev, track];
      AsyncStorage.setItem(FAV_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const createPlaylist = useCallback((name: string, description = '') => {
    const newPlaylist: Playlist = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name,
      description,
      cover: require('@/assets/images/album1.png'),
      trackCount: 0,
      tracks: [],
      isUserCreated: true,
    };
    persistPlaylists([...playlists, newPlaylist]);
  }, [playlists]);

  const deletePlaylist = useCallback((id: string) => {
    persistPlaylists(playlists.filter((p) => p.id !== id));
  }, [playlists]);

  const addToPlaylist = useCallback((playlistId: string, track: Track) => {
    const updated = playlists.map((p) => {
      if (p.id !== playlistId) return p;
      if (p.tracks.some((t) => t.id === track.id)) return p;
      const tracks = [...p.tracks, track];
      return { ...p, tracks, trackCount: tracks.length };
    });
    persistPlaylists(updated);
  }, [playlists]);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    const updated = playlists.map((p) => {
      if (p.id !== playlistId) return p;
      const tracks = p.tracks.filter((t) => t.id !== trackId);
      return { ...p, tracks, trackCount: tracks.length };
    });
    persistPlaylists(updated);
  }, [playlists]);

  return (
    <LibraryContext.Provider value={{
      favorites, playlists, isFavorite, toggleFavorite,
      createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}
