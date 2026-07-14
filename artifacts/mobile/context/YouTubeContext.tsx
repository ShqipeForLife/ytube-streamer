import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const STORAGE_KEY = '@youtube_auth_v1';

export interface YouTubeUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

interface YouTubeContextValue {
  user: YouTubeUser | null;
  playlists: YouTubePlaylist[];
  likedVideos: YouTubeVideo[];
  isLoading: boolean;
  isReady: boolean;
  signIn: () => void;
  signOut: () => void;
  openVideo: (videoId: string) => void;
  openPlaylist: (playlistId: string) => void;
}

const YouTubeContext = createContext<YouTubeContextValue | null>(null);

export function useYouTube() {
  const ctx = useContext(YouTubeContext);
  if (!ctx) throw new Error('useYouTube must be used inside YouTubeProvider');
  return ctx;
}

export function YouTubeProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<YouTubeUser | null>(null);
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [likedVideos, setLikedVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'profile',
      'email',
    ],
  });

  // Restore stored token on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const { token } = JSON.parse(stored);
          if (token) setAccessToken(token);
        } catch {}
      }
    });
  }, []);

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) {
        setAccessToken(token);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
      }
    }
  }, [response]);

  // Fetch YouTube data when token is available
  useEffect(() => {
    if (!accessToken) return;
    fetchAll(accessToken);
  }, [accessToken]);

  async function fetchAll(token: string) {
    setIsLoading(true);
    try {
      // 1. User profile
      const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!profileRes.ok) {
        // Token likely expired
        clearSession();
        return;
      }

      const profile = await profileRes.json();
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      });

      // 2. User playlists
      const [playlistsRes, likedRes] = await Promise.all([
        fetch(
          'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50',
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          'https://www.googleapis.com/youtube/v3/videos?part=snippet&myRating=like&maxResults=50',
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      if (playlistsRes.ok) {
        const data = await playlistsRes.json();
        setPlaylists(
          (data.items ?? []).map((item: any) => ({
            id: item.id,
            title: item.snippet?.title ?? 'Untitled',
            description: item.snippet?.description ?? '',
            thumbnail:
              item.snippet?.thumbnails?.medium?.url ??
              item.snippet?.thumbnails?.default?.url ??
              '',
            itemCount: item.contentDetails?.itemCount ?? 0,
          }))
        );
      }

      if (likedRes.ok) {
        const data = await likedRes.json();
        setLikedVideos(
          (data.items ?? []).map((item: any) => ({
            id: item.id,
            title: item.snippet?.title ?? 'Untitled',
            channelTitle: item.snippet?.channelTitle ?? '',
            thumbnail:
              item.snippet?.thumbnails?.medium?.url ??
              item.snippet?.thumbnails?.default?.url ??
              '',
          }))
        );
      }
    } catch (e) {
      console.error('[YouTube] fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }

  function clearSession() {
    setAccessToken(null);
    setUser(null);
    setPlaylists([]);
    setLikedVideos([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }

  const signIn = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

  const signOut = useCallback(() => {
    clearSession();
  }, []);

  const openVideo = useCallback((videoId: string) => {
    const deep = `youtube://www.youtube.com/watch?v=${videoId}`;
    const web = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.canOpenURL(deep).then((can) => Linking.openURL(can ? deep : web));
  }, []);

  const openPlaylist = useCallback((playlistId: string) => {
    const deep = `youtube://www.youtube.com/playlist?list=${playlistId}`;
    const web = `https://www.youtube.com/playlist?list=${playlistId}`;
    Linking.canOpenURL(deep).then((can) => Linking.openURL(can ? deep : web));
  }, []);

  return (
    <YouTubeContext.Provider
      value={{
        user,
        playlists,
        likedVideos,
        isLoading,
        isReady: !!request,
        signIn,
        signOut,
        openVideo,
        openPlaylist,
      }}
    >
      {children}
    </YouTubeContext.Provider>
  );
}
