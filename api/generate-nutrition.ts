import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

type AIProvider = 'gemini' | 'openai' | 'auto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, nutritionInfo, preferredProvider = 'auto' } = req.body;

    if (!data || !data.profile) {
      return res.status(400).json({ error: 'Data and profile are required' });
    }

    const provider: AIProvider = preferredProvider === 'openai' ? 'openai' : 
                                  preferredProvider === 'gemini' ? 'gemini' : 'auto';

    const useOpenAI = provider === 'auto' || provider === 'openai';

    try {
      if (useOpenAI) {
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

        const openai = new OpenAI({ apiKey: openaiKey });

        // Preparar información de entrenamientos recientes
        const recentWorkouts = data.workouts.slice(0, 10).map((w: any) => {
          let details = `Tipo: ${w.type}`;
          if (w.strengthData) details += `, ${w.strengthData.length} ejercicios`;
          if (w.cardioData) details += `, ${w.cardioData.distance}km en ${w.cardioData.timeMinutes}min`;
          if (w.groupClassData) details += `, ${w.groupClassData.classType} - ${w.groupClassData.timeMinutes}min`;
          return `${new Date(w.date).toLocaleDateString()}: ${details}`;
        }).join('\n');

        // Preparar información de suplementos
        const supplementsInfo = nutritionInfo?.supplements?.length > 0
          ? nutritionInfo.supplements.map((s: any) => `${s.name} (${s.frequency}${s.dosage ? `, ${s.dosage}` : ''})`).join(', ')
          : 'No toma suplementos actualmente';

        const prompt = `Como experto en nutrición deportiva y dietética, genera pautas nutricionales personalizadas.

ATLETA: ${data.profile.name}
Objetivo: ${data.profile.goal}
Peso: ${data.profile.initialWeight}kg
Altura: ${data.profile.height}cm
Frecuencia cardíaca en reposo: ${data.profile.restingHeartRate} bpm

ENTRENAMIENTOS RECIENTES:
${recentWorkouts || 'Sin entrenamientos registrados aún'}

SUPLEMENTOS ACTUALES:
${supplementsInfo}

DATOS ADICIONALES:
${nutritionInfo?.additionalData || 'Ninguno'}

Genera pautas nutricionales específicas que incluyan:
1. Recomendaciones de macronutrientes (proteínas, carbohidratos, grasas) según su actividad
2. Elementos nutricionales a POTENCIAR (aumentar en la dieta)
3. Elementos nutricionales a MINORAR (reducir en la dieta)
4. Suplementos recomendados (si no los toma) o ajustes a los actuales (si ya toma)
5. Consejos generales de nutrición deportiva

Responde en JSON con este formato EXACTO:
{
  "macronutrients": {
    "proteins": "recomendación específica de proteínas",
    "carbohydrates": "recomendación específica de carbohidratos",
    "fats": "recomendación específica de grasas"
  },
  "recommendations": {
    "increase": ["elemento 1 a potenciar", "elemento 2 a potenciar"],
    "decrease": ["elemento 1 a minorar", "elemento 2 a minorar"]
  },
  "supplements": {
    "recommended": [
      {"name": "nombre suplemento", "reason": "por qué recomendarlo", "dosage": "dosis sugerida"}
    ],
    "adjust": [
      {"name": "suplemento actual", "current": "uso actual", "recommendation": "ajuste recomendado"}
    ]
  },
  "generalAdvice": "consejo general de nutrición deportiva"
}`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'Eres un experto en nutrición deportiva, dietética y suplementación. Tienes certificaciones en nutrición y años de experiencia trabajando con atletas. Genera recomendaciones basadas en evidencia científica, personalizadas y prácticas.' 
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
        
        const recentWorkouts = data.workouts.slice(0, 10).map((w: any) => {
          let details = `Tipo: ${w.type}`;
          if (w.strengthData) details += `, ${w.strengthData.length} ejercicios`;
          if (w.cardioData) details += `, ${w.cardioData.distance}km en ${w.cardioData.timeMinutes}min`;
          if (w.groupClassData) details += `, ${w.groupClassData.classType} - ${w.groupClassData.timeMinutes}min`;
          return `${new Date(w.date).toLocaleDateString()}: ${details}`;
        }).join('\n');

        const supplementsInfo = nutritionInfo?.supplements?.length > 0
          ? nutritionInfo.supplements.map((s: any) => `${s.name} (${s.frequency}${s.dosage ? `, ${s.dosage}` : ''})`).join(', ')
          : 'No toma suplementos actualmente';

        const prompt = `
          Como experto en nutrición deportiva, genera pautas nutricionales personalizadas.
          ATLETA: ${data.profile.name}, Objetivo: ${data.profile.goal}, Peso: ${data.profile.initialWeight}kg, Altura: ${data.profile.height}cm
          ENTRENAMIENTOS: ${recentWorkouts || 'Sin entrenamientos'}
          SUPLEMENTOS ACTUALES: ${supplementsInfo}
          DATOS ADICIONALES: ${nutritionInfo?.additionalData || 'Ninguno'}
          Genera pautas con macronutrientes, elementos a potenciar/minorar, suplementos recomendados/ajustes, y consejos generales.
        `;

        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                macronutrients: {
                  type: Type.OBJECT,
                  properties: {
                    proteins: { type: Type.STRING },
                    carbohydrates: { type: Type.STRING },
                    fats: { type: Type.STRING }
                  }
                },
                recommendations: {
                  type: Type.OBJECT,
                  properties: {
                    increase: { type: Type.ARRAY, items: { type: Type.STRING } },
                    decrease: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                supplements: {
                  type: Type.OBJECT,
                  properties: {
                    recommended: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          reason: { type: Type.STRING },
                          dosage: { type: Type.STRING }
                        }
                      }
                    },
                    adjust: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          current: { type: Type.STRING },
                          recommendation: { type: Type.STRING }
                        }
                      }
                    }
                  }
                },
                generalAdvice: { type: Type.STRING }
              }
            }
          }
        });

        return res.status(200).json(JSON.parse(response.text || '{}'));
      }
    } catch (primaryError: any) {
      // Fallback
      if (useOpenAI && process.env.GEMINI_API_KEY) {
        console.warn('OpenAI failed, trying Gemini fallback...');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = "gemini-3-flash-preview";
        
        const recentWorkouts = data.workouts.slice(0, 10).map((w: any) => {
          let details = `Tipo: ${w.type}`;
          if (w.strengthData) details += `, ${w.strengthData.length} ejercicios`;
          if (w.cardioData) details += `, ${w.cardioData.distance}km en ${w.cardioData.timeMinutes}min`;
          if (w.groupClassData) details += `, ${w.groupClassData.classType} - ${w.groupClassData.timeMinutes}min`;
          return `${new Date(w.date).toLocaleDateString()}: ${details}`;
        }).join('\n');

        const supplementsInfo = nutritionInfo?.supplements?.length > 0
          ? nutritionInfo.supplements.map((s: any) => `${s.name} (${s.frequency}${s.dosage ? `, ${s.dosage}` : ''})`).join(', ')
          : 'No toma suplementos actualmente';

        const prompt = `Genera pautas nutricionales para ${data.profile.name}. Entrenamientos: ${recentWorkouts}. Suplementos: ${supplementsInfo}. Datos: ${nutritionInfo?.additionalData || 'Ninguno'}`;

        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                macronutrients: { type: Type.OBJECT },
                recommendations: { type: Type.OBJECT },
                supplements: { type: Type.OBJECT },
                generalAdvice: { type: Type.STRING }
              }
            }
          }
        });

        return res.status(200).json(JSON.parse(response.text || '{}'));
      }
      
      throw primaryError;
    }
  } catch (error: any) {
    console.error('Error in generate-nutrition:', error);
    return res.status(500).json({ 
      error: error.message || 'Error generating nutrition guidelines' 
    });
  }
}
