import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

type AIProvider = 'gemini' | 'openai' | 'auto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, preferredProvider = 'auto' } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const provider: AIProvider = preferredProvider === 'openai' ? 'openai' : 
                                  preferredProvider === 'gemini' ? 'gemini' : 'auto';

    // Auto-selección: Gemini para análisis (más rápido)
    const useGemini = provider === 'auto' || provider === 'gemini';

    try {
      if (useGemini) {
        // Intentar con Gemini primero
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error('GEMINI_API_KEY not configured');

        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const model = "gemini-3-flash-preview";
        
        const prompt = `
          Analiza el progreso de este atleta:
          Nombre: ${data.profile.name}
          Objetivo: ${data.profile.goal}
          Peso Actual: ${data.weightHistory[data.weightHistory.length - 1]?.weight || 'N/A'} kg
          Historial de entrenamientos (últimos 10): ${JSON.stringify(data.workouts.slice(-10))}
          
          Proporciona un análisis en JSON: summary, suggestions (array), motivationalQuote, volumeAnalysis.
        `;

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

        return res.status(200).json(JSON.parse(response.text || '{}'));
      } else {
        // Usar OpenAI
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

        const openai = new OpenAI({ apiKey: openaiKey });

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

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
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
        if (!content) throw new Error('No response from OpenAI');
        
        return res.status(200).json(JSON.parse(content));
      }
    } catch (primaryError: any) {
      // Fallback automático
      if (useGemini && process.env.OPENAI_API_KEY) {
        console.warn('Gemini failed, trying OpenAI fallback...');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
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
        if (content) {
          return res.status(200).json(JSON.parse(content));
        }
      } else if (!useGemini && process.env.GEMINI_API_KEY) {
        console.warn('OpenAI failed, trying Gemini fallback...');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = "gemini-3-flash-preview";
        
        const prompt = `
          Analiza el progreso de este atleta:
          Nombre: ${data.profile.name}
          Objetivo: ${data.profile.goal}
          Peso Actual: ${data.weightHistory[data.weightHistory.length - 1]?.weight || 'N/A'} kg
          Historial de entrenamientos (últimos 10): ${JSON.stringify(data.workouts.slice(-10))}
          
          Proporciona un análisis en JSON: summary, suggestions (array), motivationalQuote, volumeAnalysis.
        `;

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

        return res.status(200).json(JSON.parse(response.text || '{}'));
      }
      
      throw primaryError;
    }
  } catch (error: any) {
    console.error('Error in analyze-workouts:', error);
    return res.status(500).json({ 
      error: error.message || 'Error analyzing workouts' 
    });
  }
}
