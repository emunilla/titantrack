
export enum SportType {
  Strength = 'Strength',
  Running = 'Running',
  Swimming = 'Swimming',
  Cycling = 'Cycling',
  GroupClass = 'GroupClass',
  Other = 'Other'
}

// Serie individual de un ejercicio
export interface IndividualSet {
  reps: number;
  weight: number;
  type: 'warmup' | 'work'; // calentamiento o trabajo
}

export interface StrengthSet {
  exercise: string;
  individualSets?: IndividualSet[]; // Array de series individuales (nuevo formato)
  isBiSet?: boolean;
  exercise2?: string;
  individualSets2?: IndividualSet[]; // Array de series individuales para ejercicio 2
  // Mantener compatibilidad con formato antiguo
  sets?: number;
  reps?: number;
  weight?: number;
  sets2?: number;
  reps2?: number;
  weight2?: number;
}

export interface CardioMetrics {
  distance: number;
  timeMinutes: number;
  avgHeartRate?: number;
  pace?: string;
  calories?: number;
}

export interface GroupClassMetrics {
  classType: string;
  timeMinutes: number;
  avgHeartRate?: number;
  calories?: number;
}

export enum SwimmingStyle {
  Freestyle = 'Freestyle',      // Crol
  Breaststroke = 'Breaststroke', // Braza
  Backstroke = 'Backstroke',    // Espalda
  Butterfly = 'Butterfly'        // Mariposa
}

export enum SwimmingEquipment {
  None = 'None',      // Libre
  Fins = 'Fins',      // Aletas
  Paddles = 'Paddles' // Palas
}

export interface SwimmingSet {
  style: SwimmingStyle;
  lengths: number;              // Nº largos
  equipment: SwimmingEquipment; // Material
}

export interface SwimmingMetrics {
  poolLength?: number;           // Longitud de la piscina (metros) - campo de sesión
  distance?: number;             // Distancia total (km) - campo de sesión, se calcula automáticamente si no se proporciona
  sets: SwimmingSet[];          // Array de series
}

export interface Workout {
  id: string;
  date: string;
  type: SportType;
  strengthData?: StrengthSet[];
  cardioData?: CardioMetrics;
  swimmingData?: SwimmingMetrics;  // Nueva propiedad
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

/** Ejercicio detallado dentro de una sesión de entrenamiento */
export interface PlanExercise {
  name: string;           // Ej: "Press militar con barra", "Press banca"
  sets: number;
  reps: number | string; // Número o rango "8-10"
  weight?: string;       // Ej: "60kg", "70-80% 1RM", "Máximo controlado"
  rest?: string;         // Ej: "90 seg", "2 min"
  notes?: string;        // Notas opcionales (técnica, variación, etc.)
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
        exercises?: (string | PlanExercise)[]; // Soporta formato antiguo (string) y nuevo (objeto detallado)
      }[];
    }[];
  };
  createdAt: string;
}

export interface Supplement {
  name: string;
  frequency: string; // Ej: "Diario", "3 veces por semana", "Pre-entrenamiento"
  dosage?: string; // Ej: "5g", "1 cápsula"
}

export interface NutritionInfo {
  supplements?: Supplement[];
  additionalData?: string; // Datos adicionales que el usuario quiera compartir
  lastUpdated?: string;
}

export interface NutritionGuidelines {
  id?: string;
  date: string;
  macronutrients: {
    proteins?: string;
    carbohydrates?: string;
    fats?: string;
  };
  recommendations: {
    increase?: string[];
    decrease?: string[];
  };
  supplements: {
    recommended?: Array<{ name: string; reason: string; dosage?: string }>;
    adjust?: Array<{ name: string; current: string; recommendation: string }>;
  };
  generalAdvice?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  goal: string;
  initialWeight: number;
  height: number;
  restingHeartRate: number;
  avatarColor: string;
  nutritionInfo?: NutritionInfo;
}

export interface AppData {
  profile: UserProfile;
  workouts: Workout[];
  weightHistory: WeightEntry[];
  plans: TrainingPlan[];
  savedGuidelines?: NutritionGuidelines[]; // Pautas nutricionales guardadas
}

export interface UserAccount {
  id: string;
  name: string;
  avatarColor: string;
}
