
import React, { useState } from 'react';
import { AppData, SportType, TrainingPlan } from '../types';
import { generateTrainingPlan } from '../services/aiService';
import { Rocket, Plus, Trash2, Calendar, Clock, Target, ChevronRight, Loader2, Sparkles, BrainCircuit, ShieldCheck, Check } from 'lucide-react';

interface Props {
  data: AppData;
  onSavePlan: (plan: TrainingPlan) => void;
  onDeletePlan: (id: string) => void;
  onError?: (message: string) => void;
}

const TrainingPlans: React.FC<Props> = ({ data, onSavePlan, onDeletePlan, onError }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempPlan, setTempPlan] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: 'Operación Vanguardia',
    type: SportType.Strength,
    objective: 'Ganar masa muscular y fuerza base',
    frequency: 4,
    schedule: 'Mañanas',
    timePerSession: 60,
    equipment: 'Gimnasio completo'
  });

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateTrainingPlan(formData, data.profile);
      setTempPlan({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        durationWeeks: result.durationWeeks,
        status: 'active',
        content: result,
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      const message = error.message || "Error en el núcleo de generación táctica.";
      if (onError) onError(message);
      else alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlan = data.plans.find(p => p.id === selectedPlanId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#020617] p-6 rounded-2xl border border-main">
        <div>
          <h2 className="text-xl font-black text-bright flex items-center gap-2 uppercase tracking-tight">
            <Rocket className="accent-color" size={24} /> Misión Control
          </h2>
          <p className="text-[10px] text-dim font-mono uppercase tracking-[0.2em] mt-1">Estrategia y Planificación de Alto Nivel</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-accent text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-lg hover:brightness-110 transition-all"
          >
            <Plus size={16}/> Iniciar Nueva Misión
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="max-w-4xl mx-auto panel-custom p-8 rounded-2xl animate-fade-in shadow-2xl relative">
          {!tempPlan ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b border-main">
                <div className="p-3 bg-accent/10 border border-accent rounded-xl text-accent"><BrainCircuit size={28}/></div>
                <div>
                  <h3 className="text-lg font-black text-bright uppercase tracking-tighter">Parámetros de la Misión</h3>
                  <p className="text-[9px] text-dim uppercase tracking-widest">Protocolo de Asistencia IA</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Nombre de la Misión" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dim uppercase tracking-widest">Tipo de Entrenamiento</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as SportType})}
                    className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent uppercase"
                  >
                    <option value={SportType.Strength}>Fuerza</option>
                    <option value={SportType.Running}>Carrera</option>
                    <option value={SportType.Swimming}>Natación</option>
                  </select>
                </div>
                <InputGroup label="Objetivo Específico" value={formData.objective} onChange={v => setFormData({...formData, objective: v})} />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Días/Semana" type="number" value={formData.frequency} onChange={v => setFormData({...formData, frequency: parseInt(v)})} />
                  <InputGroup label="Min/Sesión" type="number" value={formData.timePerSession} onChange={v => setFormData({...formData, timePerSession: parseInt(v)})} />
                </div>
                <InputGroup label="Horario Preferente" value={formData.schedule} onChange={v => setFormData({...formData, schedule: v})} />
                <InputGroup label="Equipo Disponible" value={formData.equipment} onChange={v => setFormData({...formData, equipment: v})} />
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  onClick={handleGenerate} 
                  disabled={isLoading}
                  className="flex-1 bg-accent text-white font-black py-4 rounded-xl text-xs tracking-[0.3em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 uppercase disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                  {isLoading ? 'Analizando Bio-datos...' : 'Generar Misión con Titan Core IA'}
                </button>
                <button onClick={() => setIsCreating(false)} className="px-8 panel-custom text-dim font-black uppercase text-[10px] tracking-widest rounded-xl">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between gap-4 p-6 bg-accent/5 border border-accent rounded-2xl">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-accent text-white rounded-xl shadow-lg"><ShieldCheck size={28}/></div>
                   <div>
                     <h3 className="text-xl font-black text-bright uppercase tracking-tighter">Misión: {tempPlan.name}</h3>
                     <p className="text-[10px] text-accent font-black uppercase tracking-widest">Plan de {tempPlan.durationWeeks} Semanas Diseñado</p>
                   </div>
                </div>
                <button onClick={() => { onSavePlan(tempPlan); setIsCreating(false); setTempPlan(null); }} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg"><Check size={18}/> Aceptar Misión</button>
              </div>
              
              <div className="space-y-6">
                <div className="panel-custom p-6 rounded-xl bg-slate-500/5">
                  <h4 className="text-[10px] font-black text-dim uppercase tracking-widest mb-4">Visión General Táctica</h4>
                  <p className="text-sm text-bright leading-relaxed italic">"{tempPlan.content.overview}"</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tempPlan.content.weeks.map((week: any) => (
                    <div key={week.weekNumber} className="panel-custom p-5 rounded-xl border-l-4 border-accent">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Semana {week.weekNumber}</span>
                        <span className="text-[9px] font-bold text-dim uppercase">{week.focus}</span>
                      </div>
                      <div className="space-y-2">
                        {week.sessions.map((session: any, sIdx: number) => (
                          <div key={sIdx} className="p-3 bg-black/40 rounded border border-main">
                             <p className="text-[10px] font-black text-bright uppercase mb-1">{session.day}</p>
                             <p className="text-[9px] text-dim">{session.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setTempPlan(null)} className="w-full py-4 text-[10px] font-black text-dim uppercase tracking-widest border border-main rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all">Re-intentar Generación</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-[10px] font-black text-dim tracking-[0.2em] uppercase ml-2">MISIONES ACTIVAS</h3>
            {data.plans.length === 0 ? (
              <div className="panel-custom p-10 text-center rounded-2xl opacity-40">
                <Rocket size={32} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No hay misiones iniciadas</p>
              </div>
            ) : (
              data.plans.map(plan => (
                <button 
                  key={plan.id} 
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${selectedPlanId === plan.id ? 'bg-accent border-accent shadow-xl scale-[1.02]' : 'panel-custom border-main hover:border-accent'}`}
                >
                  <div>
                    <p className={`text-sm font-black uppercase tracking-tighter ${selectedPlanId === plan.id ? 'text-white' : 'text-bright group-hover:accent-color'}`}>{plan.name}</p>
                    <p className={`text-[9px] font-mono mt-1 ${selectedPlanId === plan.id ? 'text-white/70' : 'text-dim'}`}>ESTADO: {plan.status.toUpperCase()}</p>
                  </div>
                  <ChevronRight size={18} className={selectedPlanId === plan.id ? 'text-white' : 'text-dim'} />
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedPlan ? (
              <div className="panel-custom rounded-2xl overflow-hidden animate-fade-in h-full flex flex-col">
                <div className="bg-accent p-6 flex justify-between items-center text-white">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{selectedPlan.name}</h3>
                    <div className="flex items-center gap-4 mt-1 opacity-90">
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"><Calendar size={12}/> {selectedPlan.durationWeeks} Semanas</span>
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"><Clock size={12}/> {selectedPlan.timePerSession} min</span>
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"><Target size={12}/> {selectedPlan.type}</span>
                    </div>
                  </div>
                  <button onClick={() => onDeletePlan(selectedPlan.id)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Trash2 size={20}/></button>
                </div>
                
                <div className="p-8 flex-1 overflow-y-auto space-y-8 bg-[#020617]">
                  <div className="border-l-4 border-accent pl-6 py-2">
                     <p className="text-[10px] font-black text-dim uppercase tracking-widest mb-2">Resumen Operativo</p>
                     <p className="text-sm text-bright leading-relaxed">{selectedPlan.content.overview}</p>
                  </div>

                  <div className="space-y-6">
                    {selectedPlan.content.weeks.map(week => (
                      <div key={week.weekNumber} className="space-y-4">
                         <div className="flex items-center gap-3">
                           <div className="h-[2px] flex-1 bg-main"></div>
                           <span className="text-[10px] font-black text-accent uppercase tracking-widest">Semana {week.weekNumber}: {week.focus}</span>
                           <div className="h-[2px] flex-1 bg-main"></div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {week.sessions.map((session, sIdx) => (
                             <div key={sIdx} className="p-4 bg-slate-500/5 border border-main rounded-xl hover:border-accent transition-all">
                                <p className="text-[10px] font-black text-bright uppercase mb-2 border-b border-main pb-1">{session.day}</p>
                                <p className="text-[10px] text-dim leading-relaxed">{session.description}</p>
                                {session.exercises && (
                                  <div className="mt-3 flex flex-wrap gap-1">
                                    {session.exercises.map((ex, exIdx) => (
                                      <span key={exIdx} className="text-[8px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20">{ex}</span>
                                    ))}
                                  </div>
                                )}
                             </div>
                           ))}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="panel-custom h-full flex flex-col items-center justify-center p-20 text-center rounded-2xl opacity-20 border-dashed border-2">
                 <Target size={64} className="mb-6" />
                 <h3 className="text-xl font-black uppercase tracking-tighter">Selecciona una Misión</h3>
                 <p className="text-xs font-mono mt-2 uppercase">Esperando instrucciones de comando</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent transition-all uppercase" 
    />
  </div>
);

export default TrainingPlans;
