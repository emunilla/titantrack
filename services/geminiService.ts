
import { GoogleGenAI, Type } from "@google/genai";
import { AppData, SportType } from "../types";

// Buscar API key en ambas variables (VITE_GEMINI_API_KEY o API_KEY para compatibilidad con Vercel)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.API_KEY;

// Solo mostrar warning en desarrollo, no en producción
if (!apiKey && import.meta.env.DEV) {
  console.warn('⚠️ API Key de Gemini no configurada. Configura VITE_GEMINI_API_KEY o API_KEY en las variables de entorno.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeWorkouts = async (data: AppData) => {
  if (!ai) {
    throw new Error('API Key de Gemini no configurada. Configura VITE_GEMINI_API_KEY o API_KEY en las variables de entorno');
  }

  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analiza el progreso de este atleta:
    Nombre: ${data.profile.name}
    Objetivo: ${data.profile.goal}
    Peso Actual: ${data.weightHistory[data.weightHistory.length - 1]?.weight || 'N/A'} kg
    Historial de entrenamientos (últimos 10): ${JSON.stringify(data.workouts.slice(-10))}
    
    Proporciona un análisis en JSON: summary, suggestions (array), motivationalQuote, volumeAnalysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            motivationalQuote: { type: Type.STRING },
            volumeAnalysis: { type: Type.STRING }
          },
          required: ["summary", "suggestions", "motivationalQuote", "volumeAnalysis"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing workouts:", error);
    throw error;
  }
};

export const generateTrainingPlan = async (params: {
  type: SportType;
  objective: string;
  frequency: number;
  schedule: string;
  timePerSession: number;
  equipment: string;
}, profile: any) => {
  if (!ai) {
    throw new Error('API Key de Gemini no configurada. Configura VITE_GEMINI_API_KEY o API_KEY en las variables de entorno');
  }

  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Como experto en ciencias del deporte, diseña una "Misión de Entrenamiento" (Plan) personalizada.
    ATLETA: ${profile.name}, Objetivo Global: ${profile.goal}.
    
    PARÁMETROS DEL PLAN:
    - Deporte: ${params.type}
    - Objetivo Específico: ${params.objective}
    - Frecuencia: ${params.frequency} días por semana
    - Horario: ${params.schedule}
    - Duración sesión: ${params.timePerSession} min
    - Equipo disponible: ${params.equipment}
    
    Determina la duración óptima del plan (entre 4 y 12 semanas) según el objetivo.
    Estructura la respuesta en un JSON detallado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            durationWeeks: { type: Type.NUMBER },
            overview: { type: Type.STRING },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.NUMBER },
                  focus: { type: Type.STRING },
                  sessions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: { type: Type.STRING },
                        description: { type: Type.STRING },
                        exercises: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};
