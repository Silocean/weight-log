import { useState, useEffect } from 'react';
import { WeightEntry, UserSettings, DEFAULT_SETTINGS } from './types';

const ENTRIES_KEY = 'weight_entries';
const SETTINGS_KEY = 'weight_settings';

const SAMPLE_ENTRIES: WeightEntry[] = [
  { id: '1', weight: 75.2, date: '2026-01-05', note: '新年开始记录' },
  { id: '2', weight: 74.8, date: '2026-01-12' },
  { id: '3', weight: 74.5, date: '2026-01-19' },
  { id: '4', weight: 73.9, date: '2026-01-26' },
  { id: '5', weight: 73.5, date: '2026-02-02' },
  { id: '6', weight: 73.1, date: '2026-02-09' },
  { id: '7', weight: 72.8, date: '2026-02-16' },
  { id: '8', weight: 72.3, date: '2026-02-23' },
  { id: '9', weight: 71.9, date: '2026-03-01', note: '感觉状态很好' },
];

export function useWeightData() {
  const [entries, setEntries] = useState<WeightEntry[]>(() => {
    try {
      const stored = localStorage.getItem(ENTRIES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return SAMPLE_ENTRIES;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const addEntry = (entry: Omit<WeightEntry, 'id'>) => {
    const newEntry: WeightEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== entry.date);
      return [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const firstEntry = sortedEntries[0];

  const bmi = latestEntry && settings.height > 0
    ? latestEntry.weight / Math.pow(settings.height / 100, 2)
    : null;

  const weightToGoal = latestEntry ? latestEntry.weight - settings.goalWeight : null;
  const totalLost = latestEntry && firstEntry && firstEntry.id !== latestEntry.id
    ? firstEntry.weight - latestEntry.weight
    : null;

  return {
    entries: sortedEntries,
    settings,
    addEntry,
    deleteEntry,
    updateSettings,
    latestEntry,
    bmi,
    weightToGoal,
    totalLost,
  };
}
