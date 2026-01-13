export enum SportType {
  Strength = 'Strength',
  Running = 'Running',
  Swimming = 'Swimming',
  Cycling = 'Cycling',
  Other = 'Other'
}

export interface StrengthSet {
  exercise: string;
  reps: number;
  sets: number;
  weight: number;
}

export interface CardioMetrics {
  distance: number;
  timeMinutes: number;
  avgHeartRate?: number;
  pace?: string;
}

export interface Workout {
  id: string;
  date: string;
  type: SportType;
  strengthData?: StrengthSet[];
  cardioData?: CardioMetrics;
  notes?: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface UserProfile {
  id: string;
  name: string;
  goal: string;
  initialWeight: number;
  height: number;
  restingHeartRate: number;
  avatarColor: string;
}

export interface AppData {
  profile: UserProfile;
  workouts: Workout[];
  weightHistory: WeightEntry[];
}

export interface UserAccount {
  id: string;
  name: string;
  avatarColor: string;
}