import React, { useState } from 'react';
import { AppData } from '../types';
import { analyzeWorkouts } from '../services/geminiService';
import { Sparkles, BrainCircuit, Target, Lightbulb, Quote, Loader2, Activity } from 'lucide-react';

interface Props {
  data: AppData;
}

const AICoach: React.FC<Props> = ({ data }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeWorkouts(data);
      setAnalysis(result);
    } catch (error) {
      alert("Error al contactar con la IA. Por favor, revisa tu API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4"><BrainCircuit size={32} /><h2 className="text-3xl font-bold">Titan Coach AI</h2></div>
          <p className="text-indigo-100 mb-8 max-w-md">Analiza tus últimos 10 entrenamientos y evolución para recibir consejos personalizados.</p>
          <button onClick={handleAnalyze} disabled={loading || data.workouts.length < 1} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? 'Analizando...' : 'Generar Reporte IA'}
          </button>
        </div>
      </div>
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800"><Target className="text-indigo-600" /> Resumen</h3>
            <p className="text-slate-600 leading-relaxed text-lg">{analysis.summary}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800"><Lightbulb className="text-amber-500" /> Sugerencias</h3>
            <ul className="space-y-4">
              {analysis.suggestions.map((s: string, i: number) => (
                <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="font-medium text-slate-700">{s}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800"><Activity className="text-emerald-500" /> Carga y Motivación</h3>
            <p className="text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">{analysis.volumeAnalysis}</p>
            <div className="italic text-slate-500 flex gap-3"><Quote className="text-indigo-300 shrink-0" /><p className="text-lg">"{analysis.motivationalQuote}"</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoach;