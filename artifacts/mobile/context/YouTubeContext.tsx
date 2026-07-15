import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { YTSearchResult, YTSearchVideo, YTSearchChannel, YTSearchPlaylist } from '@/constants/mockData';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const STORAGE_KEY = '@youtube_auth_v1';
const YT_API = 'https://www.googleapis.com/youtube/v3';

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

export interface YouTubeSearchResults {
  videos: YTSearchVideo[];
  channels: YTSearchChannel[];
  playlists: YTSearchPlaylist[];
}

interface YouTubeContextValue {
  user: YouTubeUser | null;
  playlists: YouTubePlaylist[];
  likedVideos: YouTubeVideo[];
  isLoading: boolean;
  isReady: boolean;
  accessToken: string | null;
  signIn: () => void;
  signOut: () => void;
  openVideo: (videoId: string) => void;
  openPlaylist: (playlistId: string) => void;
  searchYouTube: (query: string) => Promise<YouTubeSearchResults>;
}

const YouTubeContext = createContext<YouTubeContextValue | null>(null);

export function useYouTube() {
  const ctx = useContext(YouTubeContext);
  if (!ctx) throw new Error('useYouTube must be used inside YouTubeProvider');
  return ctx;
}

/** Parse ISO 8601 duration (e.g. PT3M45S) to seconds */
function parseISO8601Duration(s: string): number {
  const m = s.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? '0') * 3600) + (parseInt(m[2] ?? '0') * 60) + parseInt(m[3] ?? '0');
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

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) {
        setAccessToken(token);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
      }
    }
  }, [response]);

  useEffect(() => {
    if (!accessToken) return;
    fetchAll(accessToken);
  }, [accessToken]);

  async function fetchAll(token: string) {
    setIsLoading(true);
    try {
      const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!profileRes.ok) {
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

      const [playlistsRes, likedRes] = await Promise.all([
        fetch(`${YT_API}/playlists?part=snippet,contentDetails&mine=true&maxResults=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${YT_API}/videos?part=snippet&myRating=like&maxResults=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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
              item.snippet?.thumbnails?.default?.url ?? '',
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
              item.snippet?.thumbnails?.default?.url ?? '',
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

  const signIn = useCallback(() => { promptAsync(); }, [promptAsync]);
  const signOut = useCallback(() => { clearSession(); }, []);

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

  /**
   * Search YouTube for videos, channels, and playlists.
   * Requires an authenticated access token.
   */
  const searchYouTube = useCallback(async (query: string): Promise<YouTubeSearchResults> => {
    const empty: YouTubeSearchResults = { videos: [], channels: [], playlists: [] };
    if (!accessToken || !query.trim()) return empty;

    try {
      // 1. Search: get videos, channels, playlists in one call
      const searchRes = await fetch(
        `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&type=video,channel,playlist&maxResults=25&relevanceLanguage=fr`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!searchRes.ok) {
        if (searchRes.status === 401) clearSession();
        return empty;
      }
      const searchData = await searchRes.json();
      const items: any[] = searchData.items ?? [];

      const videoItems = items.filter((i) => i.id?.kind === 'youtube#video');
      const channelItems = items.filter((i) => i.id?.kind === 'youtube#channel');
      const playlistItems = items.filter((i) => i.id?.kind === 'youtube#playlist');

      // 2. Fetch video durations
      let durationMap: Record<string, number> = {};
      if (videoItems.length > 0) {
        const ids = videoItems.map((i) => i.id.videoId).join(',');
        const detailRes = await fetch(
          `${YT_API}/videos?part=contentDetails&id=${ids}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          for (const item of detailData.items ?? []) {
            durationMap[item.id] = parseISO8601Duration(item.contentDetails?.duration ?? '');
          }
        }
      }

      const videos: YTSearchVideo[] = videoItems.map((item) => ({
        kind: 'video' as const,
        videoId: item.id.videoId,
        title: item.snippet?.title ?? '',
        channelTitle: item.snippet?.channelTitle ?? '',
        thumbnail:
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ?? '',
        duration: durationMap[item.id.videoId],
      }));

      const channels: YTSearchChannel[] = channelItems.map((item) => ({
        kind: 'channel' as const,
        channelId: item.id.channelId,
        title: item.snippet?.channelTitle ?? item.snippet?.title ?? '',
        thumbnail:
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ?? '',
        description: item.snippet?.description ?? '',
      }));

      const playlists: YTSearchPlaylist[] = playlistItems.map((item) => ({
        kind: 'playlist' as const,
        playlistId: item.id.playlistId,
        title: item.snippet?.title ?? '',
        channelTitle: item.snippet?.channelTitle ?? '',
        thumbnail:
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ?? '',
      }));

      return { videos, channels, playlists };
    } catch (e) {
      console.error('[YouTube] search error:', e);
      return empty;
    }
  }, [accessToken]);

  return (
    <YouTubeContext.Provider
      value={{
        user,
        playlists,
        likedVideos,
        isLoading,
        isReady: !!request,
        accessToken,
        signIn,
        signOut,
        openVideo,
        openPlaylist,
        searchYouTube,
      }}
    >
      {children}
    </YouTubeContext.Provider>
  );
}
