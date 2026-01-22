import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

type AIProvider = 'gemini' | 'openai' | 'auto';

/** Instrucciones de formato adaptadas según el tipo de deporte */
const getFormatInstructions = (sportType: string): string => {
  switch (sportType) {
    case 'Strength':
      return `
FORMATO OBLIGATORIO DE EJERCICIOS - MUY IMPORTANTE:
Cada sesión DEBE incluir "exercises": array de OBJETOS, cada uno con:
- "name": ejercicio concreto (ej: "Press militar con barra", "Press banca plano", "Sentadilla trasera", "Peso muerto rumano", "Jalón al pecho", "Remo con barra")
- "sets": número de series (ej: 3, 4, 5)
- "reps": repeticiones, número (10) o rango ("8-10", "6-8")
- "weight": SIEMPRE usar porcentaje sobre 1RM (ej: "70% 1RM", "80% 1RM", "60-65% 1RM") o "Máximo controlado" si bodyweight. NUNCA uses pesos absolutos en kg.
- "rest": descanso entre series ("90 seg", "2 min")
- "notes": (opcional) nota técnica breve

NUNCA uses descripciones genéricas como "Ejercicios para tren superior". SIEMPRE lista ejercicios CONCRETOS con sus parámetros. NUNCA uses pesos absolutos, solo porcentajes sobre 1RM.`;

    case 'Running':
      return `
FORMATO OBLIGATORIO DE SESIONES - MUY IMPORTANTE:
Cada sesión DEBE incluir "exercises": array de OBJETOS, cada uno con:
- "name": tipo de entrenamiento concreto (ej: "Carrera continua", "Intervalos cortos", "Intervalos largos", "Tempo run", "Fartlek", "Cuestas", "Recuperación activa")
- "distance": distancia en km (ej: "5 km", "10 km") o tiempo (ej: "30 min", "45 min")
- "pace": ritmo objetivo (ej: "5:00/km", "4:30/km", "Zona 2", "Zona 4")
- "rest": descanso entre intervalos si aplica (ej: "2 min caminando", "1 min trote suave")
- "notes": (opcional) nota técnica o de intensidad

NUNCA uses descripciones genéricas. SIEMPRE especifica el tipo de entrenamiento, distancia/tiempo, ritmo e intensidad.`;

    case 'Swimming':
      return `
FORMATO OBLIGATORIO DE SESIONES - MUY IMPORTANTE:
Cada sesión DEBE incluir "exercises": array de OBJETOS, cada uno con:
- "name": tipo de entrenamiento concreto (ej: "Calentamiento crol", "Series de velocidad", "Series de resistencia", "Técnica de brazada", "Series de estilo", "Enfriamiento")
- "style": estilo de natación (ej: "Crol", "Braza", "Espalda", "Mariposa", "Combinado")
- "distance": distancia o número de largos (ej: "200m", "4x50m", "8 largos")
- "rest": descanso entre series (ej: "30 seg", "1 min")
- "intensity": intensidad (ej: "Zona 2", "Zona 4", "Máximo", "Recuperación")
- "notes": (opcional) nota técnica o de material (ej: "Con aletas", "Con palas")

NUNCA uses descripciones genéricas. SIEMPRE especifica estilo, distancia, series, descanso e intensidad.`;

    case 'Cycling':
      return `
FORMATO OBLIGATORIO DE SESIONES - MUY IMPORTANTE:
Cada sesión DEBE incluir "exercises": array de OBJETOS, cada uno con:
- "name": tipo de entrenamiento concreto (ej: "Rodaje suave", "Intervalos de potencia", "Subidas", "Tempo", "Recuperación activa", "Entrenamiento de cadencia")
- "distance": distancia en km (ej: "30 km", "50 km") o tiempo (ej: "60 min", "90 min")
- "power": potencia objetivo si aplica (ej: "Zona 2", "200W", "80% FTP")
- "cadence": cadencia objetivo si aplica (ej: "90 rpm", "100 rpm")
- "rest": descanso entre intervalos si aplica (ej: "5 min suave", "3 min recuperación")
- "notes": (opcional) nota técnica o de terreno (ej: "Llano", "Montaña", "Indoor")

NUNCA uses descripciones genéricas. SIEMPRE especifica tipo de entrenamiento, distancia/tiempo, potencia e intensidad.`;

    case 'GroupClass':
      return `
FORMATO OBLIGATORIO DE SESIONES - MUY IMPORTANTE:
Cada sesión DEBE incluir "exercises": array de OBJETOS, cada uno con:
- "name": tipo de clase o componente concreto (ej: "Yoga Flow", "HIIT", "Pilates", "Spinning", "CrossFit WOD", "Zumba", "Body Pump")
- "duration": duración en minutos (ej: "45 min", "60 min")
- "intensity": intensidad (ej: "Moderada", "Alta", "Baja", "Zona 3-4")
- "focus": enfoque de la sesión (ej: "Fuerza", "Cardio", "Flexibilidad", "Core")
- "notes": (opcional) nota sobre la clase o ejercicios principales

NUNCA uses descripciones genéricas. SIEMPRE especifica el tipo de clase, duración, intensidad y enfoque.`;

    default:
      return `
FORMATO OBLIGATORIO DE SESIONES - MUY IMPORTANTE:
Cada sesión DEBE incluir "exercises": array de OBJETOS con detalles específicos del tipo de entrenamiento.
NUNCA uses descripciones genéricas. SIEMPRE especifica ejercicios, actividades o componentes CONCRETOS con sus parámetros específicos.`;
  }
};

/** Principios fundamentales y no negociables para la generación de planes */
const CORE_PRINCIPLES = `
PRINCIPIOS NO NEGOCIABLES

1. NO INVENTES DATOS CRÍTICOS
- Si faltan marcas, umbrales, FTP, CSS o referencias de fuerza, prescribe por RPE, talk test o criterios subjetivos.
- Declara explícitamente cualquier supuesto utilizado.

2. SEGURIDAD Y SOSTENIBILIDAD
- Progresiones conservadoras.
- Evita picos de carga injustificados.
- Señala señales de alerta y criterios de ajuste.

3. REALISMO ABSOLUTO
- Respeta estrictamente los días por semana y el tiempo por sesión.
- No asumas sesiones dobles ni tiempo adicional.

4. ESTRUCTURA FIJA DE SESIÓN
Toda sesión debe incluir:
- Calentamiento
- Parte principal
- Vuelta a la calma / movilidad

PERIODIZACIÓN (OBLIGATORIA)

Estructura el plan en fases claras, por ejemplo:
- Base
- Construcción
- Específica
- Puesta a punto / consolidación

Para cada fase define:
- Objetivo fisiológico principal
- Relación volumen / intensidad
- Tipo de sesiones predominantes

Incluye:
- Regla clara de progresión semanal
- Criterios de descarga (deload) si el horizonte lo permite

ADAPTACIÓN POR CONTEXTO

HORARIO
- Mañana: calentamiento progresivo y activación gradual.
- Tarde: breve protocolo de reset (movilidad/respiración) previo.

ENTORNO
- Outdoor: adapta intensidad y volumen por clima, desnivel o terreno.
- Indoor: proporciona equivalencias claras.
`;

/** Ejemplos de formato según el tipo de deporte */
const getFormatExample = (sportType: string): string => {
  switch (sportType) {
    case 'Strength':
      return `"exercises": [
  { "name": "Press militar con barra", "sets": 4, "reps": "8-10", "weight": "70% 1RM", "rest": "90 seg" },
  { "name": "Press banca plano", "sets": 4, "reps": 8, "weight": "75% 1RM", "rest": "2 min" },
  { "name": "Jalón al pecho", "sets": 3, "reps": 10, "weight": "Máximo controlado", "rest": "1 min 30 s" }
]`;

    case 'Running':
      return `"exercises": [
  { "name": "Calentamiento", "distance": "1 km", "pace": "Zona 1", "notes": "Trote suave" },
  { "name": "Intervalos cortos", "distance": "6x400m", "pace": "4:00/km", "rest": "2 min caminando" },
  { "name": "Enfriamiento", "distance": "1 km", "pace": "Zona 1", "notes": "Trote suave" }
]`;

    case 'Swimming':
      return `"exercises": [
  { "name": "Calentamiento crol", "style": "Crol", "distance": "200m", "intensity": "Zona 2", "rest": "30 seg" },
  { "name": "Series de velocidad", "style": "Crol", "distance": "8x50m", "intensity": "Zona 4", "rest": "1 min" },
  { "name": "Enfriamiento", "style": "Crol", "distance": "100m", "intensity": "Zona 1" }
]`;

    case 'Cycling':
      return `"exercises": [
  { "name": "Rodaje suave", "distance": "10 km", "power": "Zona 2", "cadence": "90 rpm", "notes": "Calentamiento" },
  { "name": "Intervalos de potencia", "distance": "5x5 min", "power": "80% FTP", "rest": "3 min suave" },
  { "name": "Enfriamiento", "distance": "10 km", "power": "Zona 1" }
]`;

    case 'GroupClass':
      return `"exercises": [
  { "name": "HIIT", "duration": "45 min", "intensity": "Alta", "focus": "Cardio y fuerza", "notes": "Circuito funcional" },
  { "name": "Yoga Flow", "duration": "30 min", "intensity": "Baja", "focus": "Flexibilidad y recuperación" }
]`;

    default:
      return `"exercises": [
  { "name": "Actividad específica", "duration": "X min", "intensity": "X", "notes": "Detalles" }
]`;
  }
};

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
${CORE_PRINCIPLES}
${getFormatInstructions(params.type)}
${params.customPrompt ? `\nINSTRUCCIONES ADICIONALES DEL USUARIO:\n${params.customPrompt}\n` : ''}

Responde en JSON con este formato. En cada "sessions" usa ejercicios/actividades DETALLADOS como en el ejemplo:
{
  "durationWeeks": número 4-12,
  "overview": "descripción general",
  "weeks": [{ "weekNumber": 1, "focus": "enfoque", "sessions": [{ "day": "Lunes", "description": "objetivo sesión", ${getFormatExample(params.type)} }] }]
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
          ${CORE_PRINCIPLES}
          ${getFormatInstructions(params.type)}
          ${params.customPrompt ? `\nINSTRUCCIONES ADICIONALES:\n${params.customPrompt}\n` : ''}
          Duración 4-12 semanas. En cada "sessions", el array "exercises" debe contener OBJETOS con los campos específicos del tipo de deporte. Ejemplo: ${getFormatExample(params.type)}.
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
          ${CORE_PRINCIPLES}
          ${getFormatInstructions(params.type)}
          ${params.customPrompt ? `\nINSTRUCCIONES ADICIONALES:\n${params.customPrompt}\n` : ''}
          Duración 4-12 semanas. En "exercises" usa OBJETOS con los campos específicos del tipo de deporte. Ejemplo: ${getFormatExample(params.type)}.
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
${CORE_PRINCIPLES}
${getFormatInstructions(params.type)}
${params.customPrompt ? `\nINSTRUCCIONES ADICIONALES:\n${params.customPrompt}\n` : ''}
Responde en JSON. En cada "sessions", "exercises" debe ser array de OBJETOS con los campos específicos del tipo de deporte. Ejemplo: ${getFormatExample(params.type)}`;

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
