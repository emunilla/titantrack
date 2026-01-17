import { AppData, SportType } from '../types';
import { analyzeWorkouts as geminiAnalyze, generateTrainingPlan as geminiGenerate } from './geminiService';
import { analyzeWorkouts as openAIAnalyze, generateTrainingPlan as openAIGenerate } from './openAIService';

export type AIProvider = 'gemini' | 'openai' | 'auto';

interface AIConfig {
  preferredProvider: AIProvider;
  fallbackEnabled: boolean;
}

// Estrategia inteligente: Gemini para análisis (más rápido), OpenAI para generación creativa
const getBestProvider = (task: 'analyze' | 'generate', config: AIConfig): 'gemini' | 'openai' => {
  if (config.preferredProvider === 'auto') {
    // Auto-selección: Gemini para análisis, OpenAI para planes creativos
    return task === 'analyze' ? 'gemini' : 'openai';
  }
  return config.preferredProvider === 'openai' ? 'openai' : 'gemini';
};

export const analyzeWorkouts = async (
  data: AppData, 
  config: AIConfig = { preferredProvider: 'auto', fallbackEnabled: true }
) => {
  const provider = getBestProvider('analyze', config);
  
  try {
    if (provider === 'gemini') {
      return await geminiAnalyze(data);
    } else {
      return await openAIAnalyze(data);
    }
  } catch (error) {
    // Fallback automático si está habilitado
    if (config.fallbackEnabled && provider === 'gemini') {
      console.warn('⚠️ Gemini falló, intentando con OpenAI...');
      try {
        return await openAIAnalyze(data);
      } catch (fallbackError) {
        throw new Error('Ambas IAs fallaron. Verifica tus API keys.');
      }
    } else if (config.fallbackEnabled && provider === 'openai') {
      console.warn('⚠️ OpenAI falló, intentando con Gemini...');
      try {
        return await geminiAnalyze(data);
      } catch (fallbackError) {
        throw new Error('Ambas IAs fallaron. Verifica tus API keys.');
      }
    }
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
  profile: any,
  config: AIConfig = { preferredProvider: 'auto', fallbackEnabled: true }
) => {
  const provider = getBestProvider('generate', config);
  
  try {
    if (provider === 'gemini') {
      return await geminiGenerate(params, profile);
    } else {
      return await openAIGenerate(params, profile);
    }
  } catch (error) {
    // Fallback automático si está habilitado
    if (config.fallbackEnabled && provider === 'gemini') {
      console.warn('⚠️ Gemini falló, intentando con OpenAI...');
      try {
        return await openAIGenerate(params, profile);
      } catch (fallbackError) {
        throw new Error('Ambas IAs fallaron. Verifica tus API keys.');
      }
    } else if (config.fallbackEnabled && provider === 'openai') {
      console.warn('⚠️ OpenAI falló, intentando con Gemini...');
      try {
        return await geminiGenerate(params, profile);
      } catch (fallbackError) {
        throw new Error('Ambas IAs fallaron. Verifica tus API keys.');
      }
    }
    throw error;
  }
};
