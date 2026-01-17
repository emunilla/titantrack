
import React, { useState, useEffect } from 'react';
import { SportType, Workout, StrengthSet, TrainingPlan } from '../types';
import { Plus, Trash2, X, Save, Power, Layers, Search, Users, Rocket } from 'lucide-react';

interface Props {
  onSave: (workout: Workout) => void;
  editWorkout?: Workout | null;
  onCancel: () => void;
  activePlans?: TrainingPlan[];
}

const COMMON_EXERCISES = [
  "Press de Banca", "Sentadillas", "Peso Muerto", "Dominadas", "Press Militar",
  "Curl de Bíceps", "Extensiones de Tríceps", "Remo con Barra", "Press Inclinado",
  "Zancadas", "Prensa de Piernas", "Elevaciones Laterales", "Remo en Polea Baja",
  "Jalón al Pecho", "Hip Thrust", "Sentadilla Búlgara", "Face Pulls", "Pájaros"
];

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
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<{setIdx: number, field: 'exercise' | 'exercise2'} | null>(null);

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

  const getFilteredExercises = (query: string) => {
    if (!query) return [];
    return COMMON_EXERCISES.filter(ex => ex.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  };

  return (
    <div className="max-w-4xl mx-auto panel-custom p-6 md:p-8 rounded-2xl animate-fade-in shadow-2xl">
      <div className="flex justify-between items-center mb-10 pb-4 border-b border-main">
        <div>
          <h2 className="text-xl font-black text-bright tracking-tighter uppercase">{editWorkout ? 'Ajustar Sesión' : 'Nueva Sesión Operativa'}</h2>
          <p className="text-[9px] font-mono accent-color mt-1 uppercase tracking-widest">SISTEMA: ENTRADA DE DATOS</p>
        </div>
        <button onClick={onCancel} className="p-3 panel-custom hover:border-red-500 hover:text-red-500 transition-all text-dim rounded-xl"><X size={20}/></button>
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
          <div className="space-y-4">
            {strengthSets.map((set, idx) => (
              <div key={idx} className={`panel-custom p-5 rounded-2xl relative group animate-fade-in ${set.isBiSet ? 'border-indigo-500/40 bg-indigo-500/5' : ''}`}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 relative w-full">
                      <label className="text-[8px] font-black text-dim uppercase mb-1 block tracking-widest">Ejercicio Principal</label>
                      <input 
                        type="text" 
                        value={set.exercise} 
                        onChange={(e) => updateSet(idx, { exercise: e.target.value })}
                        className="w-full bg-transparent border-b border-main text-xs font-bold text-bright outline-none py-2 uppercase focus:border-accent" 
                        placeholder="BUSCAR O ESCRIBIR..."
                      />
                    </div>
                    <div className="flex gap-4">
                      <MiniInput label="Series" value={set.sets} onChange={(v: number) => updateSet(idx, { sets: v })} />
                      <MiniInput label="Reps" value={set.reps} onChange={(v: number) => updateSet(idx, { reps: v })} />
                      <MiniInput label="KG" value={set.weight} onChange={(v: number) => updateSet(idx, { weight: v })} />
                    </div>
                    <button type="button" onClick={() => setStrengthSets(strengthSets.filter((_, i) => i !== idx))} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setStrengthSets([...strengthSets, { exercise: '', sets: 4, reps: 10, weight: 20 }])} className="w-full py-4 border-2 border-dashed border-main rounded-xl text-dim text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all">+ Añadir Ejercicio</button>
          </div>
        )}

        {/* ... Se mantienen los otros tipos de input (Cardio, Clase) ... */}

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button type="submit" className="flex-1 bg-accent text-white font-black py-4 rounded-xl text-xs tracking-[0.2em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase">
            <Save size={16}/> Sincronizar Registro
          </button>
        </div>
      </form>
    </div>
  );
};

const ModalButton = ({ active, onClick, label }: any) => (
  <button type="button" onClick={onClick} className={`py-3 px-2 text-[9px] font-black border transition-all rounded-xl uppercase tracking-tighter ${active ? 'bg-accent border-accent text-white shadow-md' : 'panel-custom text-dim hover:border-accent'}`}>{label}</button>
);

const MiniInput = ({ label, value, onChange }: any) => (
  <div className="text-center">
    <p className="text-[8px] font-black text-dim uppercase mb-1 tracking-widest">{label}</p>
    <input type="number" value={value ?? 0} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-14 bg-input-custom border border-main text-center text-xs font-black p-2 rounded-lg focus:border-accent outline-none text-bright" />
  </div>
);

export default WorkoutLogger;
