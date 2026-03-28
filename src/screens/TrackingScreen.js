import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT } from '../utils/theme';
import { getSobrietyDate, getUrgeLog, getCheckins } from '../utils/storage';

function getDaysBetween(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function StatBox({ label, value, color }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MilestoneBar({ days }) {
  const milestones = [1, 7, 14, 30, 60, 90, 180, 365];
  const next = milestones.find(m => m > days) || days + 30;
  const prev = milestones.filter(m => m <= days).pop() || 0;
  const progress = next > prev ? (days - prev) / (next - prev) : 1;

  return (
    <View style={styles.milestoneCard}>
      <Text style={styles.milestoneTitle}>Next Milestone</Text>
      <Text style={styles.milestoneTarget}>
        {next} {next === 1 ? 'day' : 'days'}
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
      <Text style={styles.milestoneRemaining}>
        {next - days} {next - days === 1 ? 'day' : 'days'} to go
      </Text>
    </View>
  );
}

export default function TrackingScreen() {
  const [days, setDays] = useState(0);
  const [hasDate, setHasDate] = useState(false);
  const [urgeLog, setUrgeLog] = useState([]);
  const [checkins, setCheckins] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const date = await getSobrietyDate();
        if (date) {
          setHasDate(true);
          setDays(getDaysBetween(date, new Date()));
        }
        setUrgeLog(await getUrgeLog());
        setCheckins(await getCheckins());
      })();
    }, [])
  );

  const urgesThisWeek = urgeLog.filter(u => {
    const d = new Date(u.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  });

  const completedUrges = urgeLog.filter(u => u.result === 'completed');
  const recentCheckins = checkins.slice(0, 7);

  const moodEmojis = {
    Great: '😊',
    Good: '🙂',
    Okay: '😐',
    Tough: '😔',
    Struggling: '😢',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Progress</Text>

      {!hasDate ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Set your start date on the Home screen to begin tracking.</Text>
        </View>
      ) : (
        <>
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatBox label="Days Clean" value={days} color={COLORS.primary} />
            <StatBox label="Urges Surfed" value={completedUrges.length} color={COLORS.accent} />
            <StatBox label="This Week" value={urgesThisWeek.length} color={COLORS.warning} />
          </View>

          {/* Milestone */}
          <MilestoneBar days={days} />

          {/* Recent Moods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Check-ins</Text>
            {recentCheckins.length === 0 ? (
              <Text style={styles.emptySubtext}>No check-ins yet. Log your mood from the Home screen.</Text>
            ) : (
              <View style={styles.moodTimeline}>
                {recentCheckins.map((c, i) => (
                  <View key={i} style={styles.moodEntry}>
                    <Text style={styles.moodDate}>
                      {new Date(c.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    <Text style={styles.moodEmoji}>{moodEmojis[c.mood] || '❓'}</Text>
                    <Text style={styles.moodLabel}>{c.mood}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Recent Urge Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {urgeLog.length === 0 ? (
              <Text style={styles.emptySubtext}>Use the Tools tab when you feel an urge. Your activity will appear here.</Text>
            ) : (
              urgeLog.slice(0, 10).map((u, i) => (
                <View key={i} style={styles.activityRow}>
                  <Text style={styles.activityIcon}>
                    {u.result === 'completed' ? '✅' : u.type === 'grounding_54321' ? '🌍' : '🌊'}
                  </Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {u.type === 'urge_surf' ? 'Urge Surf' : '5-4-3-2-1 Grounding'}
                      {u.duration ? ` — ${Math.floor(u.duration / 60)}m ${u.duration % 60}s` : ''}
                    </Text>
                    <Text style={styles.activityTime}>
                      {new Date(u.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  title: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: 4,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: FONT.xxl, fontWeight: '800' },
  statLabel: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  milestoneCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  milestoneTitle: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textSecondary },
  milestoneTarget: { fontSize: FONT.xl, fontWeight: '800', color: COLORS.primary, marginTop: 4 },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  milestoneRemaining: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  moodTimeline: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
  },
  moodEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  moodDate: { width: 100, fontSize: FONT.sm, color: COLORS.textSecondary },
  moodEmoji: { fontSize: 22, marginRight: SPACING.sm },
  moodLabel: { fontSize: FONT.md, color: COLORS.text, fontWeight: '500' },
  activityRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    alignItems: 'center',
  },
  activityIcon: { fontSize: 22, marginRight: SPACING.md },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: FONT.md, fontWeight: '600', color: COLORS.text },
  activityTime: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: { fontSize: FONT.md, color: COLORS.textSecondary, textAlign: 'center' },
  emptySubtext: { fontSize: FONT.sm, color: COLORS.textSecondary },
});
