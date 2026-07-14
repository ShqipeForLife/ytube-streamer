import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useTheme, ThemeMode } from '@/context/ThemeContext';

const QUALITY_OPTIONS = ['Low (64kbps)', 'Normal (128kbps)', 'High (256kbps)', 'Very High (320kbps)'];
const EQ_BANDS = ['60Hz', '170Hz', '310Hz', '600Hz', '1kHz', '3kHz', '6kHz', '12kHz', '14kHz', '16kHz'];

function SettingRow({ icon, label, value, onPress }: { icon: string; label: string; value?: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
        <Feather name={icon as any} size={18} color={colors.foreground} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      </View>
      {value ? <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
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
                    const { locationY, target } = e.nativeEvent;
                    // Simple vertical touch to set gain (-12 to +12)
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
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingRow icon="youtube" label="Connect YouTube account" />
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
});
