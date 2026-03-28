import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SOBRIETY_DATE: 'sobriety_start_date',
  DAILY_CHECKINS: 'daily_checkins',
  URGE_LOG: 'urge_log',
};

export async function getSobrietyDate() {
  const date = await AsyncStorage.getItem(KEYS.SOBRIETY_DATE);
  return date ? new Date(date) : null;
}

export async function setSobrietyDate(date) {
  await AsyncStorage.setItem(KEYS.SOBRIETY_DATE, date.toISOString());
}

export async function logUrge(entry) {
  const raw = await AsyncStorage.getItem(KEYS.URGE_LOG);
  const log = raw ? JSON.parse(raw) : [];
  log.unshift({ ...entry, timestamp: new Date().toISOString() });
  await AsyncStorage.setItem(KEYS.URGE_LOG, JSON.stringify(log.slice(0, 500)));
}

export async function getUrgeLog() {
  const raw = await AsyncStorage.getItem(KEYS.URGE_LOG);
  return raw ? JSON.parse(raw) : [];
}

export async function getCheckins() {
  const raw = await AsyncStorage.getItem(KEYS.DAILY_CHECKINS);
  return raw ? JSON.parse(raw) : [];
}

export async function addCheckin(mood) {
  const raw = await AsyncStorage.getItem(KEYS.DAILY_CHECKINS);
  const checkins = raw ? JSON.parse(raw) : [];
  checkins.unshift({ mood, date: new Date().toISOString() });
  await AsyncStorage.setItem(KEYS.DAILY_CHECKINS, JSON.stringify(checkins.slice(0, 365)));
}
