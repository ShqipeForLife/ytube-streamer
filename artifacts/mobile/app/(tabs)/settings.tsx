import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { useYouTube } from '@/context/YouTubeContext';

const QUALITY_OPTIONS = ['Low (64kbps)', 'Normal (128kbps)', 'High (256kbps)', 'Very High (320kbps)'];
const EQ_BANDS = ['60Hz', '170Hz', '310Hz', '600Hz', '1kHz', '3kHz', '6kHz', '12kHz', '14kHz', '16kHz'];

function SettingRow({ icon, label, value, onPress, danger }: {
  icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: danger ? '#ff000022' : colors.secondary }]}>
        <Feather name={icon as any} size={18} color={danger ? '#ef4444' : colors.foreground} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, { color: danger ? '#ef4444' : colors.foreground }]}>{label}</Text>
      </View>
      {value ? <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
      {!danger && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </Pressable>
  );
}

function YouTubeAccountSection() {
  const colors = useColors();
  const { user, isLoading, isReady, signIn, signOut } = useYouTube();

  if (user) {
    return (
      <View style={[styles.ytConnected, { backgroundColor: colors.card }]}>
        {/* Avatar + info */}
        <View style={styles.ytUserRow}>
          {user.picture ? (
            <Image source={{ uri: user.picture }} style={styles.ytAvatar} />
          ) : (
            <View style={[styles.ytAvatarFallback, { backgroundColor: colors.primary }]}>
              <Text style={styles.ytAvatarInitial}>{user.name?.[0] ?? 'Y'}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.ytName, { color: colors.foreground }]} numberOfLines={1}>{user.name}</Text>
            <Text style={[styles.ytEmail, { color: colors.mutedForeground }]} numberOfLines={1}>{user.email}</Text>
          </View>
          <View style={[styles.ytBadge, { backgroundColor: '#ff000022' }]}>
            <Feather name="youtube" size={12} color="#ef4444" />
            <Text style={styles.ytBadgeText}>Connected</Text>
          </View>
        </View>

        {/* Sign out */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); signOut(); }}
          style={[styles.ytSignOutBtn, { borderColor: colors.border }]}
        >
          <Feather name="log-out" size={14} color="#ef4444" />
          <Text style={[styles.ytSignOutText, { color: '#ef4444' }]}>Disconnect account</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.ytDisconnected, { backgroundColor: colors.card }]}>
      <View style={styles.ytDisconnectedTop}>
        <View style={[styles.ytIconBig, { backgroundColor: '#ff000022' }]}>
          <Feather name="youtube" size={28} color="#ef4444" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.ytConnectTitle, { color: colors.foreground }]}>Connect YouTube</Text>
          <Text style={[styles.ytConnectDesc, { color: colors.mutedForeground }]}>
            Access your playlists and liked videos
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); signIn(); }}
        disabled={!isReady || isLoading}
        style={[styles.ytSignInBtn, { opacity: (!isReady || isLoading) ? 0.5 : 1 }]}
      >
        {/* Google G logo colours */}
        <View style={styles.googleG}>
          <Text style={styles.googleGText}>G</Text>
        </View>
        <Text style={styles.ytSignInText}>
          {isLoading ? 'Connecting…' : 'Sign in with Google'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { theme, setTheme } = useTheme();
  const [quality, setQuality] = useState(2);
  const [eqGains, setEqGains] = useState<number[]>(Array(10).fill(0));

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const themes: { key: ThemeMode; label: string; icon: string }[] = [
    { key: 'light', label: 'Light', icon: 'sun' },
    { key: 'dark', label: 'Dark', icon: 'moon' },
    { key: 'amoled', label: 'AMOLED', icon: 'zap' },
    { key: 'system', label: 'System', icon: 'smartphone' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 200 : 160 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 12, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Settings</Text>
      </View>

      {/* YouTube Account */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>YOUTUBE ACCOUNT</Text>
        <View style={{ paddingHorizontal: 16 }}>
          <YouTubeAccountSection />
        </View>
      </View>

      {/* Theme */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.themeGrid}>
            {themes.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTheme(t.key); }}
                style={[
                  styles.themeBtn,
                  { borderColor: theme === t.key ? colors.primary : colors.border, backgroundColor: colors.background },
                ]}
              >
                <Feather name={t.icon as any} size={18} color={theme === t.key ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.themeBtnLabel, { color: theme === t.key ? colors.primary : colors.mutedForeground }]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Audio Quality */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>AUDIO</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.foreground }]}>Streaming quality</Text>
          {QUALITY_OPTIONS.map((opt, i) => (
            <Pressable
              key={opt}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQuality(i); }}
              style={[styles.qualityRow, { borderTopColor: colors.border }]}
            >
              <Text style={[styles.qualityLabel, { color: i === quality ? colors.primary : colors.foreground }]}>{opt}</Text>
              {i === quality && <Feather name="check" size={16} color={colors.primary} />}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Equalizer */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>EQUALIZER</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.foreground, marginBottom: 16 }]}>Band equalizer</Text>
          <View style={styles.eqContainer}>
            {EQ_BANDS.map((band, i) => (
              <View key={band} style={styles.eqBand}>
                <Text style={[styles.eqGain, { color: colors.primary }]}>{eqGains[i] > 0 ? '+' : ''}{eqGains[i]}</Text>
                <Pressable
                  style={[styles.eqTrack, { backgroundColor: colors.secondary }]}
                  onStartShouldSetResponder={() => true}
                  onResponderMove={(e) => {
                    const { locationY } = e.nativeEvent;
                    const gain = Math.round(12 - (locationY / 80) * 24);
                    setEqGains((prev) => {
                      const next = [...prev];
                      next[i] = Math.max(-12, Math.min(12, gain));
                      return next;
                    });
                  }}
                >
                  <View style={[styles.eqFill, {
                    backgroundColor: colors.primary,
                    height: `${((eqGains[i] + 12) / 24) * 100}%` as any,
                  }]} />
                </Pressable>
                <Text style={[styles.eqLabel, { color: colors.mutedForeground }]}>{band}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => setEqGains(Array(10).fill(0))}
            style={[styles.resetBtn, { backgroundColor: colors.secondary }]}
          >
            <Text style={[styles.resetLabel, { color: colors.foreground }]}>Reset</Text>
          </Pressable>
        </View>
      </View>

      {/* Other */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>STORAGE</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow icon="download" label="Download quality" value="High" />
          <SettingRow icon="refresh-cw" label="Sync devices" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow icon="info" label="Version" value="1.0.0" />
          <SettingRow icon="shield" label="Privacy policy" />
          <SettingRow icon="file-text" label="Terms of service" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 },
  card: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  cardLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', padding: 16 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
  themeBtn: { flex: 1, minWidth: 70, alignItems: 'center', gap: 6, padding: 12, borderRadius: 10, borderWidth: 1.5 },
  themeBtnLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  qualityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth },
  qualityLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  eqContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 100, paddingHorizontal: 8 },
  eqBand: { alignItems: 'center', gap: 4, flex: 1 },
  eqGain: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  eqTrack: { width: 14, height: 80, borderRadius: 7, overflow: 'hidden', justifyContent: 'flex-end' },
  eqFill: { width: '100%', borderRadius: 7 },
  eqLabel: { fontSize: 8, fontFamily: 'Inter_400Regular' },
  resetBtn: { margin: 12, borderRadius: 8, padding: 10, alignItems: 'center' },
  resetLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  iconWrap: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  rowValue: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  // YouTube connected
  ytConnected: { borderRadius: 16, overflow: 'hidden', padding: 16, gap: 12 },
  ytUserRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ytAvatar: { width: 48, height: 48, borderRadius: 24 },
  ytAvatarFallback: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  ytAvatarInitial: { color: '#fff', fontSize: 20, fontFamily: 'Inter_700Bold' },
  ytName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  ytEmail: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  ytBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  ytBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#ef4444' },
  ytSignOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  ytSignOutText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  // YouTube disconnected
  ytDisconnected: { borderRadius: 16, overflow: 'hidden', padding: 16, gap: 16 },
  ytDisconnectedTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ytIconBig: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ytConnectTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  ytConnectDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  ytSignInBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  googleG: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
  googleGText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_700Bold' },
  ytSignInText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#111' },
});
