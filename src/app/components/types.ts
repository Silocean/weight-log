export interface WeightEntry {
  id: string;
  weight: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface UserSettings {
  unit: 'kg' | 'lbs';
  goalWeight: number;
  height: number; // cm
  name: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  unit: 'kg',
  goalWeight: 65,
  height: 170,
  name: '用户',
};
