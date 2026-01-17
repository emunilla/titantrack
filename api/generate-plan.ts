import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

type AIProvider = 'gemini' | 'openai' | 'auto';

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
        if (!content) throw new Error('No response from OpenAI');
        
        return res.status(200).json(JSON.parse(content));
      } else {
        // Usar Gemini
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error('GEMINI_API_KEY not configured');

        const ai = new GoogleGenAI({ apiKey: geminiKey });
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

        return res.status(200).json(JSON.parse(response.text || '{}'));
      } else if (!useOpenAI && process.env.OPENAI_API_KEY) {
        console.warn('Gemini failed, trying OpenAI fallback...');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
