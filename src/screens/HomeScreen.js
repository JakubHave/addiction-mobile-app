import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT } from '../utils/theme';
import { getSobrietyDate, setSobrietyDate, addCheckin, getCheckins } from '../utils/storage';

function getDaysBetween(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

const MOODS = [
  { emoji: '😊', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Tough' },
  { emoji: '😢', label: 'Struggling' },
];

export default function HomeScreen({ navigation }) {
  const [sobrietyDate, setSobrietyDateState] = useState(null);
  const [days, setDays] = useState(0);
  const [todayCheckin, setTodayCheckin] = useState(null);

  const loadData = useCallback(async () => {
    const date = await getSobrietyDate();
    if (date) {
      setSobrietyDateState(date);
      setDays(getDaysBetween(date, new Date()));
    }
    const checkins = await getCheckins();
    const today = new Date().toDateString();
    const existing = checkins.find(c => new Date(c.date).toDateString() === today);
    setTodayCheckin(existing || null);
  }, []);

  useFocusEffect(loadData);

  async function handleSetDate() {
    const now = new Date();
    await setSobrietyDate(now);
    setSobrietyDateState(now);
    setDays(0);
  }

  async function handleMood(mood) {
    await addCheckin(mood);
    setTodayCheckin({ mood, date: new Date().toISOString() });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Sobriety Counter */}
      <View style={styles.counterCard}>
        {sobrietyDate ? (
          <>
            <Text style={styles.daysNumber}>{days}</Text>
            <Text style={styles.daysLabel}>
              {days === 1 ? 'day clean' : 'days clean'}
            </Text>
            <Text style={styles.sinceDate}>
              Since {sobrietyDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.welcomeText}>Welcome to Recovery Companion</Text>
            <Text style={styles.subtitleText}>Start your journey today</Text>
            <TouchableOpacity style={styles.startButton} onPress={handleSetDate}>
              <Text style={styles.startButtonText}>Set My Start Date</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Daily Check-in */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        {todayCheckin ? (
          <View style={styles.checkedInBox}>
            <Text style={styles.checkedInText}>
              Today: {MOODS.find(m => m.label === todayCheckin.mood)?.emoji} {todayCheckin.mood}
            </Text>
          </View>
        ) : (
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity key={m.label} style={styles.moodButton} onPress={() => handleMood(m.label)}>
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tools</Text>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.danger + '15' }]}
          onPress={() => navigation.navigate('ToolsTab')}
        >
          <Text style={styles.actionEmoji}>🆘</Text>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Having an Urge?</Text>
            <Text style={styles.actionSub}>Access instant coping tools</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.accent + '15' }]}
          onPress={() => navigation.navigate('BreatheTab')}
        >
          <Text style={styles.actionEmoji}>🌬️</Text>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Breathing Exercise</Text>
            <Text style={styles.actionSub}>Calm your mind in minutes</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Motivational */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought."
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  counterCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  daysNumber: { fontSize: 72, fontWeight: '800', color: COLORS.textLight },
  daysLabel: { fontSize: FONT.xl, color: COLORS.textLight, opacity: 0.9, marginTop: -4 },
  sinceDate: { fontSize: FONT.sm, color: COLORS.textLight, opacity: 0.7, marginTop: SPACING.sm },
  welcomeText: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.textLight, textAlign: 'center' },
  subtitleText: { fontSize: FONT.md, color: COLORS.textLight, opacity: 0.8, marginTop: SPACING.xs },
  startButton: {
    backgroundColor: COLORS.textLight,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.lg,
  },
  startButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT.lg },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 4 },
  checkedInBox: {
    backgroundColor: COLORS.accent + '20',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkedInText: { fontSize: FONT.lg, color: COLORS.accentDark, fontWeight: '600' },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 14,
    marginBottom: SPACING.sm,
  },
  actionEmoji: { fontSize: 32, marginRight: SPACING.md },
  actionTextWrap: { flex: 1 },
  actionTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text },
  actionSub: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  quoteCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  quoteText: { fontSize: FONT.md, color: COLORS.primaryDark, fontStyle: 'italic', lineHeight: 22 },
});
