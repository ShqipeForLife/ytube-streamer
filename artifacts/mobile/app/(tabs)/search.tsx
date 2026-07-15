import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { useYouTube } from '@/context/YouTubeContext';
import SectionHeader from '@/components/SectionHeader';
import {
  ARTISTS,
  SEARCH_CATEGORIES,
  TRACKS,
  YTSearchChannel,
  YTSearchPlaylist,
  YTSearchVideo,
  ytVideoToTrack,
  formatDuration,
} from '@/constants/mockData';

// ── Skeleton loader ────────────────────────────────────────────────────────────
function SkeletonRow({ colors }: { colors: any }) {
  return (
    <View style={[styles.skeletonRow]}>
      <View style={[styles.skeletonThumb, { backgroundColor: colors.card }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonLine, { backgroundColor: colors.card, width: '75%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.card, width: '45%' }]} />
      </View>
    </View>
  );
}

// ── YouTube Video row ──────────────────────────────────────────────────────────
function VideoRow({ item, onPress }: { item: YTSearchVideo; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.videoRow,
        { backgroundColor: pressed ? colors.card : 'transparent' },
      ]}
    >
      <View style={styles.thumbWrap}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.videoThumb} />
        ) : (
          <View style={[styles.videoThumb, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
            <Feather name="play" size={18} color={colors.mutedForeground} />
          </View>
        )}
        {item.duration && item.duration > 0 ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.videoInfo}>
        <Text style={[styles.videoTitle, { color: colors.foreground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.videoMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.channelTitle}
        </Text>
      </View>
      <View style={[styles.playBtn, { backgroundColor: '#ef444420' }]}>
        <Feather name="play" size={14} color="#ef4444" />
      </View>
    </Pressable>
  );
}

// ── Channel row ────────────────────────────────────────────────────────────────
function ChannelRow({ item, onPress }: { item: YTSearchChannel; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.channelRow,
        { backgroundColor: pressed ? colors.card : 'transparent' },
      ]}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.channelAvatar} />
      ) : (
        <View style={[styles.channelAvatar, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
          <Feather name="user" size={22} color={colors.mutedForeground} />
        </View>
      )}
      <View style={styles.channelInfo}>
        <Text style={[styles.channelTitle, { color: colors.foreground }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.channelSub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.description || 'YouTube Channel'}
        </Text>
      </View>
      <Feather name="external-link" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

// ── Playlist row ───────────────────────────────────────────────────────────────
function PlaylistRow({ item, onPress }: { item: YTSearchPlaylist; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.videoRow,
        { backgroundColor: pressed ? colors.card : 'transparent' },
      ]}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.videoThumb} />
      ) : (
        <View style={[styles.videoThumb, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
          <Feather name="list" size={18} color={colors.mutedForeground} />
        </View>
      )}
      <View style={styles.videoInfo}>
        <Text style={[styles.videoTitle, { color: colors.foreground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.videoMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.channelTitle}
        </Text>
      </View>
      <View style={[styles.typeBadge, { backgroundColor: colors.card }]}>
        <Text style={[styles.typeBadgeText, { color: colors.mutedForeground }]}>Playlist</Text>
      </View>
    </Pressable>
  );
}

// ── Sign-in prompt ─────────────────────────────────────────────────────────────
function SignInPrompt({ onSignIn, colors }: { onSignIn: () => void; colors: any }) {
  return (
    <View style={styles.signinBox}>
      <View style={[styles.ytIcon, { backgroundColor: '#ef444420' }]}>
        <Feather name="youtube" size={28} color="#ef4444" />
      </View>
      <Text style={[styles.signinTitle, { color: colors.foreground }]}>
        Connectez YouTube pour chercher
      </Text>
      <Text style={[styles.signinSub, { color: colors.mutedForeground }]}>
        Accédez à tout le contenu YouTube — musiques, artistes, playlists, podcasts
      </Text>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSignIn(); }}
        style={styles.signinBtn}
      >
        <View style={styles.googleG}><Text style={styles.googleGText}>G</Text></View>
        <Text style={styles.signinBtnText}>Se connecter avec Google</Text>
      </Pressable>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { play } = usePlayer();
  const { user, signIn, searchYouTube, openVideo, openPlaylist } = useYouTube();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ytResults, setYtResults] = useState<{
    videos: YTSearchVideo[];
    channels: YTSearchChannel[];
    playlists: YTSearchPlaylist[];
  } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  // Debounced YouTube search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || !user) {
      setYtResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchYouTube(query.trim());
      setYtResults(results);
      setLoading(false);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, user, searchYouTube]);

  const handlePlayVideo = useCallback(
    (video: YTSearchVideo) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const track = ytVideoToTrack(video);
      const queue = (ytResults?.videos ?? []).map(ytVideoToTrack);
      play(track, queue);
    },
    [play, ytResults]
  );

  const handleOpenChannel = useCallback((ch: YTSearchChannel) => {
    const url = `https://www.youtube.com/channel/${ch.channelId}`;
    Linking.openURL(url);
  }, []);

  const handleOpenPlaylist = useCallback(
    (pl: YTSearchPlaylist) => { openPlaylist(pl.playlistId); },
    [openPlaylist]
  );

  const showResults = !!query.trim();
  const totalResults =
    (ytResults?.videos.length ?? 0) +
    (ytResults?.channels.length ?? 0) +
    (ytResults?.playlists.length ?? 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View
          style={[
            styles.searchRow,
            { backgroundColor: colors.card, borderColor: focused ? '#ef4444' : colors.border },
          ]}
        >
          <Feather name="search" size={18} color={focused ? '#ef4444' : colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Artistes, musiques, playlists, podcasts…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      {showResults ? (
        // ── Results ────────────────────────────────────────────────────────────
        !user ? (
          <ScrollView contentContainerStyle={{ flex: 1 }}>
            <SignInPrompt onSignIn={signIn} colors={colors} />
          </ScrollView>
        ) : loading ? (
          <View style={styles.loadingBox}>
            {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} colors={colors} />)}
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Aucun résultat pour "{query}"
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Videos / Songs */}
            {(ytResults?.videos.length ?? 0) > 0 && (
              <>
                <SectionHeader title="Musiques & Vidéos" />
                {ytResults!.videos.map((v) => (
                  <VideoRow key={v.videoId} item={v} onPress={() => handlePlayVideo(v)} />
                ))}
              </>
            )}

            {/* Artists / Channels */}
            {(ytResults?.channels.length ?? 0) > 0 && (
              <>
                <SectionHeader title="Artistes & Chaînes" />
                {ytResults!.channels.map((ch) => (
                  <ChannelRow key={ch.channelId} item={ch} onPress={() => handleOpenChannel(ch)} />
                ))}
              </>
            )}

            {/* Playlists */}
            {(ytResults?.playlists.length ?? 0) > 0 && (
              <>
                <SectionHeader title="Playlists & Albums" />
                {ytResults!.playlists.map((pl) => (
                  <PlaylistRow
                    key={pl.playlistId}
                    item={pl}
                    onPress={() => handleOpenPlaylist(pl)}
                  />
                ))}
              </>
            )}
          </ScrollView>
        )
      ) : (
        // ── Browse / No query ──────────────────────────────────────────────────
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 200 : 160 }}
        >
          {!user && (
            <View style={[styles.connectBanner, { backgroundColor: '#ef444415', borderColor: '#ef444440' }]}>
              <Feather name="youtube" size={16} color="#ef4444" />
              <Text style={[styles.connectBannerText, { color: colors.foreground }]}>
                Connectez YouTube pour rechercher sur toute la plateforme
              </Text>
              <Pressable onPress={signIn} style={styles.connectBannerBtn}>
                <Text style={styles.connectBannerBtnText}>Connexion</Text>
              </Pressable>
            </View>
          )}

          {/* Artists */}
          <SectionHeader title="Artistes" />
          <FlatList
            data={ARTISTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            keyExtractor={(item) => item.id}
            scrollEnabled
            renderItem={({ item }) => (
              <Pressable
                style={styles.artistItem}
                onPress={() => {
                  const tracks = TRACKS.filter((t) => t.artist === item.name);
                  if (tracks.length > 0) play(tracks[0], tracks);
                }}
              >
                <View style={[styles.artistAvatar, { backgroundColor: colors.card }]}>
                  <Feather name="user" size={32} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.artistName, { color: colors.foreground }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.artistSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {item.followers} followers
                </Text>
              </Pressable>
            )}
          />

          {/* Categories */}
          <SectionHeader title="Parcourir" />
          <View style={styles.grid}>
            {SEARCH_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.catCard, { backgroundColor: cat.color }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQuery(cat.name);
                }}
              >
                <Text style={styles.catName}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchIcon: { flexShrink: 0 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  loadingBox: { paddingTop: 8 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  // Video row
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  thumbWrap: { position: 'relative' },
  videoThumb: { width: 96, height: 60, borderRadius: 8 },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 18 },
  videoMeta: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  // Channel row
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  channelAvatar: { width: 50, height: 50, borderRadius: 25 },
  channelInfo: { flex: 1 },
  channelTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  channelSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  // Connect banner
  connectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  connectBannerText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  connectBannerBtn: { backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  connectBannerBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  // Sign-in prompt
  signinBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 12,
  },
  ytIcon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  signinTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  signinSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  signinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  googleG: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  signinBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#111' },
  // Browse
  hList: { paddingHorizontal: 16, gap: 16 },
  artistItem: { width: 90, alignItems: 'center', gap: 8 },
  artistAvatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  artistName: { fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  artistSub: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  catCard: { width: '47%', height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catName: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  // Skeleton
  skeletonRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  skeletonThumb: { width: 96, height: 60, borderRadius: 8 },
  skeletonLine: { height: 12, borderRadius: 6 },
});
