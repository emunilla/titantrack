
import React, { useState, useEffect } from 'react';
import { SportType, Workout, StrengthSet, TrainingPlan } from '../types';
import { Plus, Trash2, X, Save, Layers, Rocket, Dumbbell } from 'lucide-react';

interface Props {
  onSave: (workout: Workout) => void;
  editWorkout?: Workout | null;
  onCancel: () => void;
  activePlans?: TrainingPlan[];
}

const GROUP_CLASSES = ["Total Body", "GAP", "Strength", "Dumbbells", "Pilates", "Yoga", "Cross Fit"];

const WorkoutLogger: React.FC<Props> = ({ onSave, editWorkout, onCancel, activePlans = [] }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<SportType>(SportType.Strength);
  const [strengthSets, setStrengthSets] = useState<StrengthSet[]>([{ exercise: '', sets: 4, reps: 10, weight: 20, isBiSet: false }]);
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [selectedClass, setSelectedClass] = useState(GROUP_CLASSES[0]);
  const [notes, setNotes] = useState('');
  const [planId, setPlanId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (editWorkout) {
      setDate(new Date(editWorkout.date).toISOString().split('T')[0]);
      setType(editWorkout.type);
      setNotes(editWorkout.notes || '');
      setPlanId(editWorkout.planId);
      if (editWorkout.strengthData) setStrengthSets(editWorkout.strengthData);
      if (editWorkout.cardioData) {
        setDistance(editWorkout.cardioData.distance.toString());
        setTime(editWorkout.cardioData.timeMinutes.toString());
        setHeartRate(editWorkout.cardioData.avgHeartRate?.toString() || '');
      }
      if (editWorkout.groupClassData) {
        setSelectedClass(editWorkout.groupClassData.classType);
        setTime(editWorkout.groupClassData.timeMinutes.toString());
        setHeartRate(editWorkout.groupClassData.avgHeartRate?.toString() || '');
      }
    }
  }, [editWorkout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const workout: Workout = { 
      id: editWorkout?.id || Math.random().toString(36).substr(2, 9), 
      date: new Date(date).toISOString(), type, notes, planId 
    };

    if (type === SportType.Strength) {
      workout.strengthData = strengthSets.filter(s => s.exercise.trim() !== '');
    } else if (type === SportType.GroupClass) {
      workout.groupClassData = { classType: selectedClass, timeMinutes: parseFloat(time) || 0, avgHeartRate: heartRate ? parseInt(heartRate) : undefined };
    } else {
      workout.cardioData = { distance: parseFloat(distance) || 0, timeMinutes: parseFloat(time) || 0, avgHeartRate: heartRate ? parseInt(heartRate) : undefined };
    }
    onSave(workout);
  };

  const updateSet = (idx: number, updates: Partial<StrengthSet>) => {
    const newSets = [...strengthSets];
    newSets[idx] = { ...newSets[idx], ...updates };
    setStrengthSets(newSets);
  };

  const toggleBiSet = (idx: number) => {
    const newSets = [...strengthSets];
    const isBiSet = !newSets[idx].isBiSet;
    newSets[idx] = { 
      ...newSets[idx], 
      isBiSet,
      exercise2: isBiSet ? '' : undefined,
      reps2: isBiSet ? newSets[idx].reps : undefined,
      weight2: isBiSet ? newSets[idx].weight : undefined
    };
    setStrengthSets(newSets);
  };

  return (
    <div className="max-w-4xl mx-auto panel-custom p-6 md:p-8 rounded-2xl animate-fade-in shadow-2xl">
      <div className="flex justify-between items-center mb-10 pb-4 border-b border-main">
        <div>
          <h2 className="text-xl font-black text-bright tracking-tighter uppercase">{editWorkout ? 'Ajustar Sesión' : 'Nueva Sesión Operativa'}</h2>
          <p className="text-[9px] font-mono accent-color mt-1 uppercase tracking-widest">SISTEMA: ENTRADA DE DATOS</p>
        </div>
        <button type="button" onClick={onCancel} className="p-3 panel-custom hover:border-red-500 hover:text-red-500 transition-all text-dim rounded-xl"><X size={20}/></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Vincular Misión (Opcional)</label>
            <div className="relative">
              <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 accent-color" size={16} />
              <select 
                value={planId || ''} 
                onChange={(e) => setPlanId(e.target.value || undefined)}
                className="w-full bg-input-custom border border-main pl-12 pr-4 py-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent appearance-none uppercase"
              >
                <option value="">Sesión Independiente</option>
                {activePlans.filter(p => p.type === type).map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-input-custom border border-main p-4 text-bright font-bold outline-none focus:border-accent rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Modalidad</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <ModalButton active={type === SportType.Strength} onClick={() => setType(SportType.Strength)} label="FUERZA" />
            <ModalButton active={type === SportType.GroupClass} onClick={() => setType(SportType.GroupClass)} label="CLASE" />
            <ModalButton active={type === SportType.Running} onClick={() => setType(SportType.Running)} label="CARRERA" />
            <ModalButton active={type === SportType.Swimming} onClick={() => setType(SportType.Swimming)} label="NATACIÓN" />
          </div>
        </div>

        {type === SportType.Strength && (
          <div className="space-y-6">
            {strengthSets.map((set, idx) => (
              <div key={idx} className={`panel-custom p-6 rounded-2xl relative group animate-fade-in transition-all border-l-4 ${set.isBiSet ? 'border-l-indigo-500 bg-indigo-500/5' : 'border-l-accent'}`}>
                <div className="flex flex-col gap-6">
                  {/* Primer Ejercicio */}
                  <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 relative w-full">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[8px] font-black text-dim uppercase tracking-widest flex items-center gap-1">
                          <Dumbbell size={10} className="accent-color" /> Ejercicio {set.isBiSet ? 'A' : ''}
                        </label>
                        <button 
                          type="button" 
                          onClick={() => toggleBiSet(idx)}
                          className={`text-[8px] font-black px-2 py-0.5 rounded transition-all uppercase tracking-widest border ${set.isBiSet ? 'bg-indigo-500 text-white border-indigo-500' : 'text-dim border-main hover:border-accent'}`}
                        >
                          <Layers size={10} className="inline mr-1" /> Bi-Set
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={set.exercise} 
                        onChange={(e) => updateSet(idx, { exercise: e.target.value })}
                        className="w-full bg-transparent border-b border-main text-xs font-bold text-bright outline-none py-2 uppercase focus:border-accent" 
                        placeholder="NOMBRE DEL EJERCICIO..."
                      />
                    </div>
                    <div className="flex gap-4">
                      <MiniInput label="Series" value={set.sets} onChange={(v: number) => updateSet(idx, { sets: v })} />
                      <MiniInput label="Reps" value={set.reps} onChange={(v: number) => updateSet(idx, { reps: v })} />
                      <MiniInput label="KG" value={set.weight} onChange={(v: number) => updateSet(idx, { weight: v })} />
                    </div>
                    <button type="button" onClick={() => setStrengthSets(strengthSets.filter((_, i) => i !== idx))} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                  </div>

                  {/* Segundo Ejercicio (Bi-Set) */}
                  {set.isBiSet && (
                    <div className="flex flex-col md:flex-row gap-6 items-end pt-4 border-t border-indigo-500/20 animate-fade-in">
                      <div className="flex-1 relative w-full">
                        <label className="text-[8px] font-black text-indigo-400 uppercase mb-1 block tracking-widest">
                          <Layers size={10} className="inline mr-1" /> Ejercicio B (Bi-Serie)
                        </label>
                        <input 
                          type="text" 
                          value={set.exercise2 || ''} 
                          onChange={(e) => updateSet(idx, { exercise2: e.target.value })}
                          className="w-full bg-transparent border-b border-indigo-500/30 text-xs font-bold text-bright outline-none py-2 uppercase focus:border-indigo-500" 
                          placeholder="NOMBRE DEL SEGUNDO EJERCICIO..."
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="w-14 text-center opacity-30">
                          <p className="text-[8px] font-black text-dim uppercase mb-1 tracking-widest">Series</p>
                          <div className="text-xs font-black p-2">{set.sets}</div>
                        </div>
                        <MiniInput label="Reps" value={set.reps2 || 0} onChange={(v: number) => updateSet(idx, { reps2: v })} />
                        <MiniInput label="KG" value={set.weight2 || 0} onChange={(v: number) => updateSet(idx, { weight2: v })} />
                      </div>
                      <div className="w-[40px]"></div> {/* Spacer to align with Trash button above */}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setStrengthSets([...strengthSets, { exercise: '', sets: 4, reps: 10, weight: 20, isBiSet: false }])} className="w-full py-4 border-2 border-dashed border-main rounded-xl text-dim text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all group flex items-center justify-center gap-2">
              <Plus size={14} className="group-hover:scale-110 transition-transform" /> Añadir Bloque de Ejercicio
            </button>
          </div>
        )}

        {/* Inputs de Cardio / Clase */}
        {(type === SportType.Running || type === SportType.Swimming || type === SportType.Cycling) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
             <TechInputGroup label="Distancia (KM)" value={distance} onChange={setDistance} type="number" step="0.01" />
             <TechInputGroup label="Tiempo (MIN)" value={time} onChange={setTime} type="number" />
             <TechInputGroup label="Pulsaciones (AVG)" value={heartRate} onChange={setHeartRate} type="number" />
          </div>
        )}

        {type === SportType.GroupClass && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Tipo de Clase</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent uppercase appearance-none">
                  {GROUP_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <TechInputGroup label="Tiempo (MIN)" value={time} onChange={setTime} type="number" />
             <TechInputGroup label="Pulsaciones (AVG)" value={heartRate} onChange={setHeartRate} type="number" />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Notas de la Sesión</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="COMENTARIOS TÉCNICOS, SENSACIONES, RM..."
            className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent min-h-[100px] uppercase"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button type="submit" className="flex-1 bg-accent text-white font-black py-5 rounded-xl text-xs tracking-[0.2em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase">
            <Save size={18}/> Sincronizar Registro en Nucleo
          </button>
        </div>
      </form>
    </div>
  );
};

const ModalButton = ({ active, onClick, label }: any) => (
  <button type="button" onClick={onClick} className={`py-4 px-2 text-[9px] font-black border transition-all rounded-xl uppercase tracking-widest ${active ? 'bg-accent border-accent text-white shadow-md' : 'panel-custom text-dim hover:border-accent'}`}>{label}</button>
);

const MiniInput = ({ label, value, onChange }: any) => (
  <div className="text-center">
    <p className="text-[8px] font-black text-dim uppercase mb-1 tracking-widest">{label}</p>
    <input type="number" step="0.5" value={value ?? 0} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-16 bg-input-custom border border-main text-center text-xs font-black p-2 rounded-lg focus:border-accent outline-none text-bright" />
  </div>
);

const TechInputGroup = ({ label, value, onChange, type = "text", step = "1" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      step={step}
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-input-custom border border-main p-4 rounded-xl text-xs font-bold text-bright outline-none focus:border-accent transition-all uppercase" 
    />
  </div>
);

export default WorkoutLogger;
