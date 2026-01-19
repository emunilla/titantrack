import { AppData, SportType, NutritionInfo } from '../types';

export type AIProvider = 'gemini' | 'openai' | 'auto';

interface AIConfig {
  preferredProvider: AIProvider;
  fallbackEnabled: boolean;
}

// Usar el endpoint del backend (API keys seguras en el servidor)
const getApiUrl = () => {
  // En producción, usar la misma URL (Vercel maneja las rutas /api automáticamente)
  // En desarrollo, Vite proxy redirige /api a las funciones serverless
  return window.location.origin;
};

export const analyzeWorkouts = async (
  data: AppData, 
  config: AIConfig = { preferredProvider: 'auto', fallbackEnabled: true }
) => {
  try {
    const response = await fetch(`${getApiUrl()}/api/analyze-workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        preferredProvider: config.preferredProvider
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al analizar entrenamientos');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error analyzing workouts:', error);
    throw error;
  }
};

export const generateTrainingPlan = async (
  params: {
    type: SportType;
    objective: string;
    frequency: number;
    schedule: string;
    timePerSession: number;
    equipment: string;
    customPrompt?: string;
  },
  profile: any,
  config: AIConfig = { preferredProvider: 'auto', fallbackEnabled: true }
) => {
  try {
    const response = await fetch(`${getApiUrl()}/api/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params,
        profile,
        preferredProvider: config.preferredProvider
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al generar plan de entrenamiento');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error generating training plan:', error);
    throw error;
  }
};

export const generateNutritionGuidelines = async (
  data: AppData,
  nutritionInfo: NutritionInfo,
  config: AIConfig = { preferredProvider: 'auto', fallbackEnabled: true }
) => {
  try {
    const response = await fetch(`${getApiUrl()}/api/generate-nutrition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        nutritionInfo,
        preferredProvider: config.preferredProvider
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al generar pautas nutricionales');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error generating nutrition guidelines:', error);
    throw error;
  }
};
