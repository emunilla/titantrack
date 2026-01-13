import { GoogleGenAI, Type } from "@google/genai";
import { AppData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWorkouts = async (data: AppData) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analiza el progreso de este atleta:
    Nombre: ${data.profile.name}
    Objetivo: ${data.profile.goal}
    Peso Actual: ${data.weightHistory[data.weightHistory.length - 1]?.weight || 'N/A'} kg
    Historial de entrenamientos (últimos 10): ${JSON.stringify(data.workouts.slice(-10))}
    Historial de peso: ${JSON.stringify(data.weightHistory.slice(-5))}

    Por favor, proporciona un análisis detallado en formato JSON que incluya:
    1. Un resumen del progreso actual.
    2. 3 sugerencias específicas para mejorar según su objetivo.
    3. Una frase motivacional personalizada.
    4. Evaluación de si el volumen de entrenamiento es adecuado.
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
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            motivationalQuote: { type: Type.STRING },
            volumeAnalysis: { type: Type.STRING }
          },
          required: ["summary", "suggestions", "motivationalQuote", "volumeAnalysis"]
        }
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing workouts:", error);
    throw error;
  }
};