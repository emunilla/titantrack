
import React, { useState } from 'react';
import { AppData } from '../types';
import { analyzeWorkouts } from '../services/aiService';
import { Sparkles, BrainCircuit, Target, Lightbulb, Quote, Loader2, Activity, Terminal } from 'lucide-react';

interface Props {
  data: AppData;
  onError?: (message: string) => void;
}

const AICoach: React.FC<Props> = ({ data, onError }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeWorkouts(data);
      setAnalysis(result);
    } catch (error: any) {
      const message = error.message || "Error en el núcleo de análisis inteligente.";
      if (onError) onError(message);
      else alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel-custom border border-main p-10 rounded shadow-[var(--shadow)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 font-mono text-[8px] accent-color opacity-50">NÚCLEO 3.1 ALPHA</div>
        <div className="relative z-10 text-center max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <BrainCircuit size={48} className="accent-color animate-pulse" />
            <h2 className="text-4xl font-black text-bright tracking-tighter uppercase">Titan Core <span className="accent-color">IA</span></h2>
          </div>
          <p className="text-xs text-dim mb-10 tracking-widest leading-relaxed uppercase">Sistema de análisis biométrico profundo basado en redes neuronales.</p>
          <button 
            onClick={handleAnalyze} 
            disabled={loading || data.workouts.length < 1} 
            className="w-full bg-accent text-white font-black py-4 rounded text-xs tracking-[0.3em] shadow-[var(--shadow)] hover:opacity-90 transition-all uppercase flex items-center justify-center gap-3 disabled:opacity-30"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Terminal size={18} />}
            {loading ? 'Procesando Datos de Entrenamiento...' : 'Ejecutar Análisis Inteligente'}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="md:col-span-2 panel-custom p-8 rounded">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-1 h-6 accent-color"></div>
               <h3 className="text-xs font-black text-bright tracking-[0.2em] uppercase">Resumen de Inteligencia Ejecutiva</h3>
             </div>
             <p className="text-dim leading-relaxed font-mono text-xs">{analysis.summary}</p>
          </div>
          
          <div className="panel-custom p-6 rounded">
            <h3 className="text-[10px] font-black text-amber-500 tracking-widest uppercase mb-6 flex items-center gap-2"><Lightbulb size={14}/> Sugerencias Estratégicas</h3>
            <div className="space-y-3">
              {analysis.suggestions.map((s: string, i: number) => (
                <div key={i} className="bg-card-inner p-4 border border-main text-[10px] font-bold text-dim uppercase tracking-tight flex items-center gap-3">
                  <span className="accent-color font-mono">[{i+1}]</span> {s}
                </div>
              ))}
            </div>
          </div>

          <div className="panel-custom p-6 rounded">
            <h3 className="text-[10px] font-black text-emerald-500 tracking-widest uppercase mb-6 flex items-center gap-2"><Activity size={14}/> Análisis de Volumen</h3>
            <p className="text-dim text-xs font-mono bg-card-inner p-4 rounded mb-6 border border-main">{analysis.volumeAnalysis}</p>
            <div className="border-t border-main pt-6 flex gap-4">
              <Quote size={20} className="accent-color opacity-50 shrink-0" />
              <p className="text-sm font-black italic text-bright tracking-tight leading-snug">"{analysis.motivationalQuote}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoach;
