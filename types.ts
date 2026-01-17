
export enum SportType {
  Strength = 'Strength',
  Running = 'Running',
  Swimming = 'Swimming',
  Cycling = 'Cycling',
  GroupClass = 'GroupClass',
  Other = 'Other'
}

export interface StrengthSet {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  isBiSet?: boolean;
  exercise2?: string;
  sets2?: number;
  reps2?: number;
  weight2?: number;
}

export interface CardioMetrics {
  distance: number;
  timeMinutes: number;
  avgHeartRate?: number;
  pace?: string;
}

export interface GroupClassMetrics {
  classType: string;
  timeMinutes: number;
  avgHeartRate?: number;
}

export interface Workout {
  id: string;
  date: string;
  type: SportType;
  strengthData?: StrengthSet[];
  cardioData?: CardioMetrics;
  groupClassData?: GroupClassMetrics;
  notes?: string;
  planId?: string; // Vínculo con el plan
}

export interface WeightEntry {
  id?: string;
  date: string;
  weight: number;
  fatPercentage?: number;
  musclePercentage?: number;
}

export interface TrainingPlan {
  id: string;
  name: string;
  type: SportType;
  objective: string;
  frequency: number; // días/semana
  durationWeeks: number;
  schedule: string; // Mañana, tarde, noche
  timePerSession: number; // minutos
  status: 'active' | 'completed' | 'archived';
  content: {
    overview: string;
    weeks: {
      weekNumber: number;
      focus: string;
      sessions: {
        day: string;
        description: string;
        exercises?: string[];
      }[];
    }[];
  };
  createdAt: string;
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
  plans: TrainingPlan[]; // Nueva colección
}

export interface UserAccount {
  id: string;
  name: string;
  avatarColor: string;
}
