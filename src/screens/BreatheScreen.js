import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, SPACING, FONT } from '../utils/theme';

const TECHNIQUES = [
  {
    name: 'Box Breathing',
    desc: 'Used by Navy SEALs to stay calm under pressure',
    phases: [
      { label: 'Breathe In', duration: 4 },
      { label: 'Hold', duration: 4 },
      { label: 'Breathe Out', duration: 4 },
      { label: 'Hold', duration: 4 },
    ],
    rounds: 4,
    color: COLORS.primary,
  },
  {
    name: '4-7-8 Relaxing',
    desc: 'Activates your parasympathetic nervous system',
    phases: [
      { label: 'Breathe In', duration: 4 },
      { label: 'Hold', duration: 7 },
      { label: 'Breathe Out', duration: 8 },
    ],
    rounds: 4,
    color: COLORS.accent,
  },
  {
    name: 'Quick Calm',
    desc: 'Fast relief when you need it now',
    phases: [
      { label: 'Deep In', duration: 3 },
      { label: 'Slow Out', duration: 6 },
    ],
    rounds: 5,
    color: COLORS.warning,
  },
];

export default function BreatheScreen() {
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [finished, setFinished] = useState(false);
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!running || !selectedTechnique) return;

    const phase = selectedTechnique.phases[phaseIndex];
    setCountdown(phase.duration);

    const isInhale = phase.label.toLowerCase().includes('in');
    const isExhale = phase.label.toLowerCase().includes('out');

    if (isInhale) {
      Animated.timing(scale, { toValue: 1.0, duration: phase.duration * 1000, useNativeDriver: true }).start();
    } else if (isExhale) {
      Animated.timing(scale, { toValue: 0.6, duration: phase.duration * 1000, useNativeDriver: true }).start();
    }

    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          const nextPhase = phaseIndex + 1;
          if (nextPhase < selectedTechnique.phases.length) {
            setPhaseIndex(nextPhase);
          } else if (round < selectedTechnique.rounds) {
            setPhaseIndex(0);
            setRound(r => r + 1);
          } else {
            setRunning(false);
            setFinished(true);
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, phaseIndex, round, selectedTechnique]);

  function start(technique) {
    setSelectedTechnique(technique);
    setPhaseIndex(0);
    setRound(1);
    setFinished(false);
    setRunning(true);
    scale.setValue(0.6);
  }

  function stop() {
    setRunning(false);
    setSelectedTechnique(null);
    setFinished(false);
    scale.setValue(0.6);
  }

  if (finished) {
    return (
      <View style={styles.container}>
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedEmoji}>🙏</Text>
          <Text style={styles.finishedText}>Well done</Text>
          <Text style={styles.finishedSub}>You completed {selectedTechnique.name}</Text>
          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: selectedTechnique.color }]} onPress={stop}>
            <Text style={styles.doneBtnText}>Back to Exercises</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (running && selectedTechnique) {
    const phase = selectedTechnique.phases[phaseIndex];
    return (
      <View style={styles.container}>
        <View style={styles.breatheContainer}>
          <Text style={styles.roundText}>
            Round {round} of {selectedTechnique.rounds}
          </Text>

          <Animated.View style={[styles.breatheCircle, {
            backgroundColor: selectedTechnique.color + '25',
            borderColor: selectedTechnique.color,
            transform: [{ scale }],
          }]}>
            <Text style={[styles.phaseLabel, { color: selectedTechnique.color }]}>{phase.label}</Text>
            <Text style={[styles.countdownText, { color: selectedTechnique.color }]}>{countdown}</Text>
          </Animated.View>

          <TouchableOpacity style={styles.cancelBtn} onPress={stop}>
            <Text style={styles.cancelText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Breathing Exercises</Text>
        <Text style={styles.subtitle}>Choose a technique to calm your mind and body</Text>

        {TECHNIQUES.map((t, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.techniqueCard, { borderLeftColor: t.color }]}
            onPress={() => start(t)}
          >
            <Text style={[styles.techniqueName, { color: t.color }]}>{t.name}</Text>
            <Text style={styles.techniqueDesc}>{t.desc}</Text>
            <Text style={styles.techniqueDetail}>
              {t.phases.map(p => `${p.label} ${p.duration}s`).join(' → ')} × {t.rounds}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  title: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FONT.md, color: COLORS.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  techniqueCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  techniqueName: { fontSize: FONT.lg, fontWeight: '700' },
  techniqueDesc: { fontSize: FONT.md, color: COLORS.textSecondary, marginTop: 4 },
  techniqueDetail: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, opacity: 0.7 },
  breatheContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  roundText: { fontSize: FONT.md, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  breatheCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseLabel: { fontSize: FONT.xl, fontWeight: '700' },
  countdownText: { fontSize: 48, fontWeight: '800', marginTop: SPACING.xs },
  cancelBtn: {
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.border,
    borderRadius: 12,
  },
  cancelText: { color: COLORS.text, fontWeight: '600', fontSize: FONT.md },
  finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  finishedEmoji: { fontSize: 64 },
  finishedText: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text, marginTop: SPACING.md },
  finishedSub: { fontSize: FONT.md, color: COLORS.textSecondary, marginTop: SPACING.xs },
  doneBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.xl,
  },
  doneBtnText: { color: COLORS.textLight, fontWeight: '700', fontSize: FONT.lg },
});
