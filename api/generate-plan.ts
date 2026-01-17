import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

type AIProvider = 'gemini' | 'openai' | 'auto';

/** Fragmento de prompt que exige ejercicios detallados (nombre, series, reps, peso, descanso) */
const EXERCISE_FORMAT_INSTRUCTIONS = `
FORMATO OBLIGATORIO DE EJERCICIOS - MUY IMPORTANTE:
Cada sesión DEBE incluir "exercises": array de OBJETOS, cada uno con:
- "name": ejercicio concreto (ej: "Press militar con barra", "Press banca plano", "Sentadilla trasera", "Peso muerto rumano", "Jalón al pecho", "Remo con barra")
- "sets": número de series (ej: 3, 4, 5)
- "reps": repeticiones, número (10) o rango ("8-10", "6-8")
- "weight": carga en kg ("40kg", "60kg") o "70% 1RM" o "Máximo controlado" si bodyweight
- "rest": descanso entre series ("90 seg", "2 min")
- "notes": (opcional) nota técnica breve

NUNCA uses descripciones genéricas como "Ejercicios para tren superior". SIEMPRE lista ejercicios CONCRETOS con sus parámetros.
`;

const EXERCISE_JSON_EXAMPLE = `"exercises": [
  { "name": "Press militar con barra", "sets": 4, "reps": "8-10", "weight": "40kg", "rest": "90 seg" },
  { "name": "Press banca plano", "sets": 4, "reps": 8, "weight": "60kg", "rest": "2 min" },
  { "name": "Jalón al pecho", "sets": 3, "reps": 10, "weight": "Máximo controlado", "rest": "1 min 30 s" }
]`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { params, profile, preferredProvider = 'auto' } = req.body;

    if (!params || !profile) {
      return res.status(400).json({ error: 'Params and profile are required' });
    }

    const provider: AIProvider = preferredProvider === 'openai' ? 'openai' : 
                                  preferredProvider === 'gemini' ? 'gemini' : 'auto';

    // Auto-selección: OpenAI para generación creativa
    const useOpenAI = provider === 'auto' || provider === 'openai';

    try {
      if (useOpenAI) {
        // Intentar con OpenAI primero (mejor para creatividad)
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

        const openai = new OpenAI({ apiKey: openaiKey });

        const prompt = `Como experto en ciencias del deporte y entrenador personal certificado, diseña una "Misión de Entrenamiento" (Plan) personalizada y profesional.

ATLETA: ${profile.name}, Objetivo Global: ${profile.goal}.

PARÁMETROS: Deporte ${params.type}, Objetivo ${params.objective}, ${params.frequency} días/semana, ${params.timePerSession} min/sesión, Equipo: ${params.equipment}
${EXERCISE_FORMAT_INSTRUCTIONS}
${params.customPrompt ? `\nINSTRUCCIONES ADICIONALES DEL USUARIO:\n${params.customPrompt}\n` : ''}

Responde en JSON con este formato. En cada "sessions" usa ejercicios DETALLADOS como en el ejemplo:
{
  "durationWeeks": número 4-12,
  "overview": "descripción general",
  "weeks": [{ "weekNumber": 1, "focus": "enfoque", "sessions": [{ "day": "Lunes", "description": "objetivo sesión", ${EXERCISE_JSON_EXAMPLE} }] }]
}`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'Eres un experto en ciencias del deporte, fisiología del ejercicio y diseño de planes de entrenamiento personalizados. Tienes certificaciones en entrenamiento personal y años de experiencia. Crea planes detallados, progresivos, seguros y altamente efectivos basados en evidencia científica.' 
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No response from OpenAI');
        
        return res.status(200).json(JSON.parse(content));
      } else {
        // Usar Gemini
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error('GEMINI_API_KEY not configured');

        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const model = "gemini-3-flash-preview";
        
        const prompt = `
          Como experto en ciencias del deporte y entrenador personal certificado, diseña una "Misión de Entrenamiento" (Plan) personalizada.
          ATLETA: ${profile.name}, Objetivo: ${profile.goal}.
          PARÁMETROS: Deporte ${params.type}, Objetivo ${params.objective}, ${params.frequency} días/semana, ${params.timePerSession} min/sesión, Equipo: ${params.equipment}
          ${EXERCISE_FORMAT_INSTRUCTIONS}
          ${params.customPrompt ? `\nINSTRUCCIONES ADICIONALES:\n${params.customPrompt}\n` : ''}
          Duración 4-12 semanas. En cada "sessions", el array "exercises" debe contener OBJETOS con: name, sets, reps, weight, rest (y opcional notes). Ejemplo: {"name":"Press banca","sets":4,"reps":"8-10","weight":"60kg","rest":"2 min"}.
        `;

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
                            exercises: { type: Type.ARRAY, items: { type: Type.OBJECT } }
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

        return res.status(200).json(JSON.parse(response.text || '{}'));
      }
    } catch (primaryError: any) {
      // Fallback automático
      if (useOpenAI && process.env.GEMINI_API_KEY) {
        console.warn('OpenAI failed, trying Gemini fallback...');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = "gemini-3-flash-preview";
        
        const prompt = `
          Como experto en ciencias del deporte, diseña una "Misión de Entrenamiento" (Plan) personalizada.
          ATLETA: ${profile.name}, Objetivo: ${profile.goal}.
          PARÁMETROS: Deporte ${params.type}, Objetivo ${params.objective}, ${params.frequency} días/semana, ${params.timePerSession} min/sesión, Equipo: ${params.equipment}
          ${EXERCISE_FORMAT_INSTRUCTIONS}
          ${params.customPrompt ? `\nINSTRUCCIONES ADICIONALES:\n${params.customPrompt}\n` : ''}
          Duración 4-12 semanas. En "exercises" usa OBJETOS: name, sets, reps, weight, rest. Ej: {"name":"Press banca","sets":4,"reps":"8-10","weight":"60kg","rest":"2 min"}.
        `;

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
                            exercises: { type: Type.ARRAY, items: { type: Type.OBJECT } }
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

        return res.status(200).json(JSON.parse(response.text || '{}'));
      } else if (!useOpenAI && process.env.OPENAI_API_KEY) {
        console.warn('Gemini failed, trying OpenAI fallback...');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `Como experto en ciencias del deporte, diseña una "Misión de Entrenamiento" (Plan) personalizada.
ATLETA: ${profile.name}, Objetivo: ${profile.goal}.
PARÁMETROS: Deporte ${params.type}, Objetivo ${params.objective}, ${params.frequency} días/semana, ${params.timePerSession} min/sesión, Equipo: ${params.equipment}
${EXERCISE_FORMAT_INSTRUCTIONS}
${params.customPrompt ? `\nINSTRUCCIONES ADICIONALES:\n${params.customPrompt}\n` : ''}
Responde en JSON. En cada "sessions", "exercises" debe ser array de OBJETOS: { "name", "sets", "reps", "weight", "rest" }. Ejemplo: ${EXERCISE_JSON_EXAMPLE}`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'Eres un experto en ciencias del deporte y diseño de planes de entrenamiento. Crea planes con ejercicios CONCRETOS (Press banca, Sentadilla, etc.) y sus parámetros: series, repeticiones, peso, descanso.' 
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          return res.status(200).json(JSON.parse(content));
        }
      }
      
      throw primaryError;
    }
  } catch (error: any) {
    console.error('Error in generate-plan:', error);
    return res.status(500).json({ 
      error: error.message || 'Error generating training plan' 
    });
  }
}
