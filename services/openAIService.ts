import OpenAI from 'openai';
import { AppData, SportType } from '../types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey && import.meta.env.DEV) {
  console.warn('⚠️ VITE_OPENAI_API_KEY no configurada. Las funciones de OpenAI no funcionarán.');
}

// ⚠️ ADVERTENCIA: Usar OpenAI en el navegador expone la API key en el bundle.
// En producción, considera usar un backend proxy para mayor seguridad.
const openai = apiKey ? new OpenAI({ 
  apiKey,
  dangerouslyAllowBrowser: true // Permitir uso en navegador (con advertencia de seguridad)
}) : null;

export const analyzeWorkouts = async (data: AppData) => {
  if (!openai) {
    throw new Error('API Key de OpenAI no configurada. Configura VITE_OPENAI_API_KEY en las variables de entorno');
  }

  const prompt = `Analiza el progreso de este atleta:
Nombre: ${data.profile.name}
Objetivo: ${data.profile.goal}
Peso Actual: ${data.weightHistory[data.weightHistory.length - 1]?.weight || 'N/A'} kg
Historial de entrenamientos (últimos 10): ${JSON.stringify(data.workouts.slice(-10))}

Proporciona un análisis detallado en JSON con este formato exacto:
{
  "summary": "resumen completo del análisis del progreso del atleta",
  "suggestions": ["sugerencia 1", "sugerencia 2", "sugerencia 3"],
  "motivationalQuote": "frase motivacional personalizada",
  "volumeAnalysis": "análisis detallado del volumen de entrenamiento"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Más económico, o usa 'gpt-4' para mejor calidad
      messages: [
        { 
          role: 'system', 
          content: 'Eres un experto en ciencias del deporte y análisis de rendimiento atlético. Proporciona análisis precisos y motivadores.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No se recibió respuesta de OpenAI');
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing workouts with OpenAI:', error);
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
  },
  profile: any
) => {
  if (!openai) {
    throw new Error('API Key de OpenAI no configurada. Configura VITE_OPENAI_API_KEY en las variables de entorno');
  }

  const prompt = `Como experto en ciencias del deporte, diseña una "Misión de Entrenamiento" (Plan) personalizada.
ATLETA: ${profile.name}, Objetivo Global: ${profile.goal}.

PARÁMETROS DEL PLAN:
- Deporte: ${params.type}
- Objetivo Específico: ${params.objective}
- Frecuencia: ${params.frequency} días por semana
- Horario: ${params.schedule}
- Duración sesión: ${params.timePerSession} min
- Equipo disponible: ${params.equipment}

Determina la duración óptima del plan (entre 4 y 12 semanas) según el objetivo.
Estructura la respuesta en un JSON detallado con este formato exacto:
{
  "durationWeeks": número entre 4 y 12,
  "overview": "descripción general del plan de entrenamiento",
  "weeks": [
    {
      "weekNumber": número de semana,
      "focus": "enfoque principal de esta semana",
      "sessions": [
        {
          "day": "día de la semana (ej: Lunes)",
          "description": "descripción detallada de la sesión",
          "exercises": ["ejercicio 1", "ejercicio 2", "ejercicio 3"]
        }
      ]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Eres un experto en diseño de planes de entrenamiento personalizados. Crea planes detallados, progresivos y efectivos.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No se recibió respuesta de OpenAI');
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating plan with OpenAI:', error);
    throw error;
  }
};
