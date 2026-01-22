
import React, { useState } from 'react';
import { AppData, SportType, TrainingPlan, PlanExercise } from '../types';
import { generateTrainingPlan } from '../services/aiService';
import { Rocket, Plus, Trash2, Calendar, Clock, Target, ChevronRight, Loader2, Sparkles, BrainCircuit, ShieldCheck, Check } from 'lucide-react';

/** Renderiza un ejercicio: soporta string (legacy) o objeto detallado adaptado al tipo de deporte */
function ExerciseItem({ ex, sportType, compact = false }: { ex: string | PlanExercise; sportType: SportType; compact?: boolean }) {
  if (typeof ex === 'string') {
    return <span className="text-[8px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20">{ex}</span>;
  }
  const e = ex as PlanExercise;
  
  // Generar línea compacta según tipo de deporte
  const getCompactLine = (): string => {
    switch (sportType) {
      case SportType.Strength:
        return `${e.name} · ${e.sets || '—'}×${String(e.reps || '—')} · ${e.weight || '—'} · ${e.rest || '—'}`;
      case SportType.Running:
        return `${e.name} · ${e.distance || '—'} · ${e.pace || '—'} · ${e.rest || '—'}`;
      case SportType.Swimming:
        return `${e.name} · ${e.style || '—'} · ${e.distance || '—'} · ${e.intensity || '—'}`;
      case SportType.Cycling:
        return `${e.name} · ${e.distance || '—'} · ${e.power || '—'} · ${e.cadence || '—'}`;
      case SportType.GroupClass:
        return `${e.name} · ${e.duration || '—'} · ${e.intensity || '—'} · ${e.focus || '—'}`;
      default:
        return e.name;
    }
  };
  
  // Generar detalles según tipo de deporte
  const getDetails = (): string => {
    const parts: string[] = [];
    switch (sportType) {
      case SportType.Strength:
        if (e.sets) parts.push(`Series: ${e.sets}`);
        if (e.reps) parts.push(`Reps: ${String(e.reps)}`);
        if (e.weight) parts.push(`Intensidad: ${e.weight}`);
        if (e.rest) parts.push(`Descanso: ${e.rest}`);
        break;
      case SportType.Running:
        if (e.distance) parts.push(`Distancia: ${e.distance}`);
        if (e.pace) parts.push(`Ritmo: ${e.pace}`);
        if (e.rest) parts.push(`Descanso: ${e.rest}`);
        break;
      case SportType.Swimming:
        if (e.style) parts.push(`Estilo: ${e.style}`);
        if (e.distance) parts.push(`Distancia: ${e.distance}`);
        if (e.intensity) parts.push(`Intensidad: ${e.intensity}`);
        if (e.rest) parts.push(`Descanso: ${e.rest}`);
        break;
      case SportType.Cycling:
        if (e.distance) parts.push(`Distancia: ${e.distance}`);
        if (e.power) parts.push(`Potencia: ${e.power}`);
        if (e.cadence) parts.push(`Cadencia: ${e.cadence}`);
        if (e.rest) parts.push(`Descanso: ${e.rest}`);
        break;
      case SportType.GroupClass:
        if (e.duration) parts.push(`Duración: ${e.duration}`);
        if (e.intensity) parts.push(`Intensidad: ${e.intensity}`);
        if (e.focus) parts.push(`Enfoque: ${e.focus}`);
        break;
      default:
        return e.name;
    }
    return parts.length > 0 ? parts.join(' · ') : e.name;
  };
  
  if (compact) {
    return <span className="text-[8px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20" title={e.notes}>{getCompactLine()}</span>;
  }
  return (
    <div className="text-[10px] py-1.5 px-2 bg-card-inner rounded border border-main">
      <p className="font-black text-bright uppercase">{e.name}</p>
      <p className="text-dim">{getDetails()}</p>
      {e.notes && <p className="text-[9px] text-dim/80 italic mt-0.5">{e.notes}</p>}
    </div>
  );
}

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
    equipment: 'Gimnasio completo',
    customPrompt: ''
  });

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateTrainingPlan(formData, data.profile);
      // Generar UUID válido para el ID (o dejar undefined para que Supabase lo genere)
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      // Crear el plan solo con los campos necesarios (sin customPrompt ni equipment)
      setTempPlan({
        id: generateUUID(),
        name: formData.name,
        type: formData.type,
        objective: formData.objective,
        frequency: formData.frequency,
        schedule: formData.schedule,
        timePerSession: formData.timePerSession,
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
      <div className="flex justify-between items-center bg-panel-custom p-6 rounded-2xl border border-main">
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Sparkles size={12} className="accent-color" />
                  Instrucciones Adicionales (Opcional)
                </label>
                <textarea 
                  value={formData.customPrompt}
                  onChange={e => setFormData({...formData, customPrompt: e.target.value})}
                  placeholder="Ej: Enfócate en ejercicios compuestos, incluye progresión semanal de carga, prioriza técnica sobre peso..."
                  className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent min-h-[100px] resize-y placeholder:text-dim/50"
                />
                <p className="text-[9px] text-dim italic">Estas instrucciones se añadirán al prompt para personalizar aún más el plan generado.</p>
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
                <button onClick={() => { 
                  // Limpiar el objeto antes de guardar (eliminar campos que no van a la BD)
                  const planToSave: TrainingPlan = {
                    id: tempPlan.id,
                    name: tempPlan.name,
                    type: tempPlan.type,
                    objective: tempPlan.objective,
                    frequency: tempPlan.frequency,
                    durationWeeks: tempPlan.durationWeeks,
                    schedule: tempPlan.schedule,
                    timePerSession: tempPlan.timePerSession,
                    status: tempPlan.status,
                    content: tempPlan.content,
                    createdAt: tempPlan.createdAt
                  };
                  onSavePlan(planToSave); 
                  setIsCreating(false); 
                  setTempPlan(null); 
                }} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg"><Check size={18}/> Aceptar Misión</button>
              </div>
              
              <div className="space-y-6">
                <div className="panel-custom p-6 rounded-xl bg-card-inner">
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
                          <div key={sIdx} className="p-3 bg-card-inner rounded border border-main">
                             <p className="text-[10px] font-black text-bright uppercase mb-1">{session.day}</p>
                             <p className="text-[9px] text-dim">{session.description}</p>
                             {session.exercises && session.exercises.length > 0 && (
                               <div className="mt-2 space-y-1">
                                 {session.exercises.map((ex: any, exIdx: number) => (
                                   <ExerciseItem key={exIdx} ex={ex} sportType={tempPlan.type} compact />
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
                
                <div className="p-8 flex-1 overflow-y-auto space-y-8 bg-panel-custom">
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
                             <div key={sIdx} className="p-4 bg-card-inner border border-main rounded-xl hover:border-accent transition-all">
                                <p className="text-[10px] font-black text-bright uppercase mb-2 border-b border-main pb-1">{session.day}</p>
                                <p className="text-[10px] text-dim leading-relaxed">{session.description}</p>
                                {session.exercises && session.exercises.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {session.exercises.map((ex: any, exIdx: number) => (
                                      <ExerciseItem key={exIdx} ex={ex} sportType={selectedPlan.type} />
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

const InputGroup = ({ label, value, onChange, type = "text" }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      const inputValue = e.target.value;
      // Permitir campo vacío mientras se escribe
      if (inputValue === '' || inputValue === '-') {
        onChange('');
        return;
      }
      const numValue = parseFloat(inputValue);
      // Validar que sea >= 0 y no sea NaN ni infinito
      if (!isNaN(numValue) && numValue >= 0 && isFinite(numValue)) {
        onChange(inputValue);
      }
      // Si es negativo o inválido, mantener el valor anterior
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} 
        min={type === "number" ? "0" : undefined}
        value={value} 
        onChange={handleChange} 
        className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent transition-all uppercase" 
      />
    </div>
  );
};

export default TrainingPlans;
