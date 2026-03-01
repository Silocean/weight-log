import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  note?: string;
}

export interface UserSettings {
  name: string;
  height: number | null; // cm
  goalWeight: number | null;
  unit: "kg" | "lbs";
  startWeight: number | null;
}

interface WeightContextType {
  entries: WeightEntry[];
  settings: UserSettings;
  addEntry: (entry: Omit<WeightEntry, "id">) => void;
  updateEntry: (id: string, entry: Omit<WeightEntry, "id">) => void;
  deleteEntry: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  latestWeight: number | null;
  previousWeight: number | null;
  weightChange: number | null;
  bmi: number | null;
  bmiCategory: string;
  goalProgress: number;
}

const defaultSettings: UserSettings = {
  name: "我",
  height: 170,
  goalWeight: 65,
  unit: "kg",
  startWeight: null,
};

const generateMockData = (): WeightEntry[] => {
  const data: WeightEntry[] = [];
  const startDate = new Date("2026-01-01");
  let weight = 78.5;
  for (let i = 0; i < 59; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    if (i % 2 === 0) {
      weight += (Math.random() - 0.6) * 0.4;
      weight = Math.round(weight * 10) / 10;
      data.push({
        id: `mock-${i}`,
        date: date.toISOString().split("T")[0],
        weight,
        note: i === 0 ? "开始记录" : i === 14 ? "开始锻炼" : i === 30 ? "坚持打卡！" : undefined,
      });
    }
  }
  return data;
};

const WeightContext = createContext<WeightContextType | null>(null);

export function WeightProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<WeightEntry[]>(() => {
    try {
      const stored = localStorage.getItem("weight-entries");
      if (stored) return JSON.parse(stored);
    } catch {}
    return generateMockData();
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem("weight-settings");
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {}
    return { ...defaultSettings, startWeight: 78.5 };
  });

  useEffect(() => {
    localStorage.setItem("weight-entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("weight-settings", JSON.stringify(settings));
  }, [settings]);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestWeight = sortedEntries[0]?.weight ?? null;
  const previousWeight = sortedEntries[1]?.weight ?? null;
  const weightChange =
    latestWeight !== null && previousWeight !== null
      ? Math.round((latestWeight - previousWeight) * 10) / 10
      : null;

  const bmi =
    latestWeight && settings.height
      ? Math.round((latestWeight / Math.pow(settings.height / 100, 2)) * 10) / 10
      : null;

  const bmiCategory = bmi
    ? bmi < 18.5
      ? "偏瘦"
      : bmi < 24.0
      ? "正常"
      : bmi < 28.0
      ? "超重"
      : "肥胖"
    : "";

  const goalProgress = (() => {
    if (!settings.goalWeight || !settings.startWeight || !latestWeight) return 0;
    const total = Math.abs(settings.startWeight - settings.goalWeight);
    const done = Math.abs(settings.startWeight - latestWeight);
    if (total === 0) return 100;
    return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
  })();

  const addEntry = useCallback((entry: Omit<WeightEntry, "id">) => {
    const id = `entry-${Date.now()}`;
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== entry.date);
      return [...filtered, { ...entry, id }];
    });
    setSettings((prev) => ({
      ...prev,
      startWeight: prev.startWeight ?? entry.weight,
    }));
  }, []);

  const updateEntry = useCallback((id: string, entry: Omit<WeightEntry, "id">) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...entry, id } : e)));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <WeightContext.Provider
      value={{
        entries: sortedEntries,
        settings,
        addEntry,
        updateEntry,
        deleteEntry,
        updateSettings,
        latestWeight,
        previousWeight,
        weightChange,
        bmi,
        bmiCategory,
        goalProgress,
      }}
    >
      {children}
    </WeightContext.Provider>
  );
}

export function useWeight() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeight must be used within WeightProvider");
  return ctx;
}
