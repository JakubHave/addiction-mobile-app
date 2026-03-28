import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Vibration } from 'react-native';
import { COLORS, SPACING, FONT } from '../utils/theme';
import { logUrge } from '../utils/storage';

const GROUNDING_STEPS = [
  { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see right now' },
  { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can physically feel' },
  { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear' },
  { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell' },
  { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste' },
];

const COPING_STRATEGIES = [
  { icon: '🚶', title: 'Take a Walk', desc: 'Step outside for 10 minutes. Movement changes your brain chemistry.' },
  { icon: '🧊', title: 'Ice Cube Technique', desc: 'Hold an ice cube tightly. The intense sensation redirects your focus.' },
  { icon: '📞', title: 'Call Someone', desc: 'Reach out to a friend, sponsor, or helpline. You don\'t have to do this alone.' },
  { icon: '✍️', title: 'Write It Out', desc: 'Journal what you\'re feeling right now. Name the trigger if you can.' },
  { icon: '🎵', title: 'Play Music', desc: 'Put on a song that makes you feel strong. Sing along if you can.' },
  { icon: '💪', title: 'Do Push-Ups', desc: 'Physical exertion releases tension and produces endorphins.' },
];

function UrgeSurfTimer() {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      ).start();

      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= 600) {
            clearInterval(timerRef.current);
            setActive(false);
            setCompleted(true);
            Vibration.vibrate(200);
            logUrge({ type: 'urge_surf', duration: 600, result: 'completed' });
            return 600;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(timerRef.current);
      pulse.stopAnimation();
    };
  }, [active]);

  function handleStart() {
    setActive(true);
    setSeconds(0);
    setCompleted(false);
  }

  function handleStop() {
    clearInterval(timerRef.current);
    setActive(false);
    logUrge({ type: 'urge_surf', duration: seconds, result: 'stopped_early' });
  }

  function handleReset() {
    setActive(false);
    setSeconds(0);
    setCompleted(false);
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = Math.min(seconds / 600, 1);

  return (
    <View style={styles.surfCard}>
      <Text style={styles.surfTitle}>Urge Surfing</Text>
      <Text style={styles.surfDesc}>
        Urges peak and pass like waves. Ride it out — most last under 10 minutes.
      </Text>

      <Animated.View style={[styles.timerCircle, active && { transform: [{ scale: pulse }] }]}>
        <Text style={styles.timerText}>
          {mins}:{secs.toString().padStart(2, '0')}
        </Text>
        {active && (
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        )}
      </Animated.View>

      {completed ? (
        <View style={styles.completedBox}>
          <Text style={styles.completedText}>You did it! The urge has passed.</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          {!active ? (
            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
              <Text style={styles.startBtnText}>Start Surfing</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
              <Text style={styles.stopBtnText}>I Made It Through</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function GroundingExercise() {
  const [step, setStep] = useState(-1);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  function startExercise() {
    setStep(0);
    animateIn();
  }

  function animateIn() {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }

  function nextStep() {
    if (step < GROUNDING_STEPS.length - 1) {
      setStep(s => s + 1);
      animateIn();
    } else {
      logUrge({ type: 'grounding_54321', result: 'completed' });
      setStep(-1);
    }
  }

  if (step === -1) {
    return (
      <View style={styles.groundCard}>
        <Text style={styles.groundTitle}>5-4-3-2-1 Grounding</Text>
        <Text style={styles.groundDesc}>
          Use your senses to anchor yourself in the present moment.
        </Text>
        <TouchableOpacity style={styles.groundStartBtn} onPress={startExercise}>
          <Text style={styles.groundStartText}>Begin Exercise</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = GROUNDING_STEPS[step];
  return (
    <View style={styles.groundCard}>
      <Text style={styles.stepIndicator}>Step {step + 1} of 5</Text>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.senseCount}>{current.count}</Text>
        <Text style={styles.senseLabel}>{current.sense}</Text>
        <Text style={styles.sensePrompt}>{current.prompt}</Text>
      </Animated.View>
      <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
        <Text style={styles.nextBtnText}>
          {step < GROUNDING_STEPS.length - 1 ? 'Next' : 'Done'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ToolsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerText}>Craving? You've got this.</Text>

      <UrgeSurfTimer />
      <GroundingExercise />

      <Text style={styles.sectionTitle}>Coping Strategies</Text>
      {COPING_STRATEGIES.map((s, i) => (
        <View key={i} style={styles.strategyCard}>
          <Text style={styles.strategyIcon}>{s.icon}</Text>
          <View style={styles.strategyContent}>
            <Text style={styles.strategyTitle}>{s.title}</Text>
            <Text style={styles.strategyDesc}>{s.desc}</Text>
          </View>
        </View>
      ))}

      <View style={styles.emergencyCard}>
        <Text style={styles.emergencyTitle}>Need Immediate Help?</Text>
        <Text style={styles.emergencyText}>SAMHSA Helpline: 1-800-662-4357</Text>
        <Text style={styles.emergencySubtext}>Free, confidential, 24/7</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  headerText: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  surfCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  surfTitle: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.primary },
  surfDesc: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, lineHeight: 20 },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primaryLight,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    overflow: 'hidden',
  },
  timerText: { fontSize: 40, fontWeight: '800', color: COLORS.primary },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  buttonRow: { alignItems: 'center' },
  startBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  startBtnText: { color: COLORS.textLight, fontWeight: '700', fontSize: FONT.lg },
  stopBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  stopBtnText: { color: COLORS.textLight, fontWeight: '700', fontSize: FONT.lg },
  completedBox: { alignItems: 'center' },
  completedText: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.accent, marginBottom: SPACING.md },
  resetButton: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  resetButtonText: { color: COLORS.text, fontWeight: '600' },
  groundCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  groundTitle: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.accent },
  groundDesc: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, lineHeight: 20 },
  groundStartBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
  groundStartText: { color: COLORS.textLight, fontWeight: '700', fontSize: FONT.lg },
  stepIndicator: { fontSize: FONT.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  senseCount: { fontSize: 64, fontWeight: '800', color: COLORS.accent, textAlign: 'center' },
  senseLabel: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  sensePrompt: { fontSize: FONT.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 22 },
  nextBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
  nextBtnText: { color: COLORS.textLight, fontWeight: '700', fontSize: FONT.lg },
  sectionTitle: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  strategyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
  },
  strategyIcon: { fontSize: 28, marginRight: SPACING.md, marginTop: 2 },
  strategyContent: { flex: 1 },
  strategyTitle: { fontSize: FONT.md, fontWeight: '700', color: COLORS.text },
  strategyDesc: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2, lineHeight: 20 },
  emergencyCard: {
    backgroundColor: COLORS.danger + '10',
    borderRadius: 14,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  emergencyTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.danger },
  emergencyText: { fontSize: FONT.xl, fontWeight: '800', color: COLORS.text, marginTop: SPACING.sm },
  emergencySubtext: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: 2 },
});
