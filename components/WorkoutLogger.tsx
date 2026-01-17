
import React, { useState, useEffect } from 'react';
import { SportType, Workout, StrengthSet, GroupClassMetrics } from '../types';
import { Plus, Trash2, X, Save, Power, Layers, Search, Users } from 'lucide-react';

interface Props {
  onSave: (workout: Workout) => void;
  editWorkout?: Workout | null;
  onCancel: () => void;
}

const COMMON_EXERCISES = [
  "Press de Banca", "Sentadillas", "Peso Muerto", "Dominadas", "Press Militar",
  "Curl de Bíceps", "Extensiones de Tríceps", "Remo con Barra", "Press Inclinado",
  "Aperturas con Mancuernas", "Zancadas", "Prensa de Piernas", "Elevaciones Laterales",
  "Remo en Polea Baja", "Jalón al Pecho", "Fondos de Pecho", "Press Francés",
  "Sentadilla Búlgara", "Hip Thrust", "Face Pulls", "Pájaros", "Curl Martillo",
  "Remo con Mancuerna", "Flexiones", "Plancha Abdominal", "Zancadas Laterales",
  "Peso Muerto Rumano", "Extensiones de Cuádriceps", "Curl Femoral", "Gemelos en Máquina"
];

const GROUP_CLASSES = ["Total Body", "GAP", "Strength", "Dumbbells", "Pilates", "Yoga", "Cross Fit"];

const WorkoutLogger: React.FC<Props> = ({ onSave, editWorkout, onCancel }) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [type, setType] = useState<SportType>(SportType.Strength);
  const [strengthSets, setStrengthSets] = useState<StrengthSet[]>([{ exercise: '', sets: 4, reps: 10, weight: 20, isBiSet: false }]);
  
  // Cardio & Group Class Shared/Specific States
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [selectedClass, setSelectedClass] = useState(GROUP_CLASSES[0]);
  const [notes, setNotes] = useState('');
  
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<{setIdx: number, field: 'exercise' | 'exercise2'} | null>(null);

  useEffect(() => {
    if (editWorkout) {
      setDate(new Date(editWorkout.date).toISOString().split('T')[0]);
      setType(editWorkout.type);
      setNotes(editWorkout.notes || '');
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
      date: new Date(date).toISOString(), 
      type, 
      notes 
    };

    if (type === SportType.Strength) {
      workout.strengthData = strengthSets.filter(s => s.exercise.trim() !== '');
    } else if (type === SportType.GroupClass) {
      workout.groupClassData = {
        classType: selectedClass,
        timeMinutes: parseFloat(time) || 0,
        avgHeartRate: heartRate ? parseInt(heartRate) : undefined
      };
    } else {
      workout.cardioData = { 
        distance: parseFloat(distance) || 0, 
        timeMinutes: parseFloat(time) || 0, 
        avgHeartRate: heartRate ? parseInt(heartRate) : undefined 
      };
    }
    onSave(workout);
  };

  const updateSet = (idx: number, updates: Partial<StrengthSet>) => {
    const newSets = [...strengthSets];
    newSets[idx] = { ...newSets[idx], ...updates };
    setStrengthSets(newSets);
  };

  const toggleBiSet = (idx: number) => {
    const set = strengthSets[idx];
    const isNowBiSet = !set.isBiSet;
    updateSet(idx, { 
      isBiSet: isNowBiSet,
      exercise2: isNowBiSet ? '' : undefined,
      sets2: isNowBiSet ? set.sets : undefined,
      reps2: isNowBiSet ? set.reps : undefined,
      weight2: isNowBiSet ? set.weight : undefined
    });
  };

  const getFilteredExercises = (query: string) => {
    if (!query) return [];
    return COMMON_EXERCISES.filter(ex => 
      ex.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  return (
    <div className="max-w-4xl mx-auto panel-custom p-6 md:p-8 rounded-2xl relative animate-fade-in shadow-2xl">
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
            <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Fecha de Ejecución</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-input-custom border border-main p-4 text-bright font-bold outline-none focus:border-accent transition-all rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Modalidad</label>
            <div className="grid grid-cols-2 gap-2">
              <ModalButton active={type === SportType.Strength} onClick={() => setType(SportType.Strength)} label="FUERZA" />
              <ModalButton active={type === SportType.GroupClass} onClick={() => setType(SportType.GroupClass)} label="CLASE COLECTIVA" />
              <ModalButton active={type === SportType.Running} onClick={() => setType(SportType.Running)} label="CARRERA" />
              <ModalButton active={type === SportType.Swimming} onClick={() => setType(SportType.Swimming)} label="NATACIÓN" />
            </div>
          </div>
        </div>

        {type === SportType.Strength && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-500/5 p-3 border-l-4 border-accent rounded-r-lg">
               <span className="text-[10px] font-black text-bright uppercase tracking-widest">Manifiesto de Ejercicios</span>
               <button 
                 type="button" 
                 onClick={() => setStrengthSets([{ exercise: '', sets: 4, reps: 10, weight: 20, isBiSet: false }, ...strengthSets])} 
                 className="text-[9px] font-black bg-accent text-white px-3 py-1.5 rounded-lg uppercase shadow-sm hover:brightness-110"
               >
                 + Añadir al inicio
               </button>
            </div>
            
            <div className="space-y-4">
              {strengthSets.map((set, idx) => (
                <div key={idx} className={`panel-custom p-5 rounded-2xl relative group animate-fade-in ${set.isBiSet ? 'border-indigo-500/40 bg-indigo-500/5' : ''}`}>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                      <div className="flex-1 relative w-full">
                        <label className="text-[8px] font-black text-dim uppercase mb-1 block tracking-widest">
                          {set.isBiSet ? 'Ejercicio A' : 'Ejercicio Principal'}
                        </label>
                        <div className="flex items-center gap-2 border-b border-main focus-within:border-accent transition-all">
                          <Search size={14} className="text-dim" />
                          <input 
                            type="text" 
                            placeholder="ESCRIBIR NOMBRE..." 
                            value={set.exercise} 
                            onFocus={() => setActiveSuggestionIndex({setIdx: idx, field: 'exercise'})}
                            onBlur={() => setTimeout(() => setActiveSuggestionIndex(null), 200)}
                            onChange={(e) => updateSet(idx, { exercise: e.target.value })}
                            className="w-full bg-transparent text-xs font-bold text-bright outline-none py-2 uppercase" 
                          />
                        </div>
                        {activeSuggestionIndex?.setIdx === idx && activeSuggestionIndex?.field === 'exercise' && (
                          <div className="absolute left-0 right-0 top-full z-20 panel-custom mt-1 rounded-xl shadow-2xl overflow-hidden">
                            {getFilteredExercises(set.exercise).map(ex => (
                              <button key={ex} type="button" onClick={() => updateSet(idx, { exercise: ex })} className="w-full text-left p-3 text-[10px] font-black text-dim hover:bg-accent hover:text-white uppercase transition-all">
                                {ex}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <MiniInput label="Series" value={set.sets} onChange={(v: number) => updateSet(idx, { sets: v })} />
                        <MiniInput label="Reps" value={set.reps} onChange={(v: number) => updateSet(idx, { reps: v })} />
                        <MiniInput label="KG" value={set.weight} onChange={(v: number) => updateSet(idx, { weight: v })} />
                      </div>
                    </div>

                    {set.isBiSet && (
                      <div className="flex flex-col md:flex-row gap-6 items-end border-t border-main pt-6 animate-fade-in">
                        <div className="flex-1 relative w-full">
                          <label className="text-[8px] font-black accent-color uppercase mb-1 block tracking-widest flex items-center gap-2">
                            <Layers size={10} /> Ejercicio B (Bi-serie)
                          </label>
                          <div className="flex items-center gap-2 border-b border-main focus-within:border-accent transition-all">
                            <Search size={14} className="text-dim" />
                            <input 
                              type="text" 
                              placeholder="SEGUNDO EJERCICIO..." 
                              value={set.exercise2 || ''} 
                              onFocus={() => setActiveSuggestionIndex({setIdx: idx, field: 'exercise2'})}
                              onBlur={() => setTimeout(() => setActiveSuggestionIndex(null), 200)}
                              onChange={(e) => updateSet(idx, { exercise2: e.target.value })}
                              className="w-full bg-transparent text-xs font-bold accent-color outline-none py-2 uppercase" 
                            />
                          </div>
                          {activeSuggestionIndex?.setIdx === idx && activeSuggestionIndex?.field === 'exercise2' && (
                            <div className="absolute left-0 right-0 top-full z-20 panel-custom mt-1 rounded-xl shadow-2xl overflow-hidden">
                              {getFilteredExercises(set.exercise2 || '').map(ex => (
                                <button key={ex} type="button" onClick={() => updateSet(idx, { exercise2: ex })} className="w-full text-left p-3 text-[10px] font-black text-dim hover:bg-accent hover:text-white uppercase transition-all">
                                  {ex}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-4">
                          <MiniInput label="Series" color="accent-color" value={set.sets2} onChange={(v: number) => updateSet(idx, { sets2: v })} />
                          <MiniInput label="Reps" color="accent-color" value={set.reps2} onChange={(v: number) => updateSet(idx, { reps2: v })} />
                          <MiniInput label="KG" color="accent-color" value={set.weight2} onChange={(v: number) => updateSet(idx, { weight2: v })} />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => toggleBiSet(idx)}
                        className={`px-4 py-2 border rounded-xl transition-all flex items-center gap-2 ${set.isBiSet ? 'bg-accent text-white border-accent shadow-md' : 'panel-custom text-dim hover:border-accent'}`}
                      >
                        <Layers size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Modo Bi-Serie</span>
                      </button>
                      {strengthSets.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => setStrengthSets(strengthSets.filter((_, i) => i !== idx))} 
                          className="p-3 panel-custom border-red-500/20 text-red-500 hover:border-red-500 rounded-xl transition-all"
                        >
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === SportType.GroupClass && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1 flex items-center gap-2">
                <Users size={14} /> Seleccionar Disciplina
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {GROUP_CLASSES.map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`p-3 text-[10px] font-black rounded-xl border transition-all uppercase ${selectedClass === cls ? 'bg-accent text-white border-accent shadow-md' : 'panel-custom text-dim hover:border-accent'}`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TechInput label="DURACIÓN" value={time} onChange={setTime} unit="MINUTOS" />
              <TechInput label="PULSACIONES" value={heartRate} onChange={setHeartRate} unit="BPM (OPCIONAL)" />
            </div>
          </div>
        )}

        {(type === SportType.Running || type === SportType.Swimming) && (
          <div className="grid grid-cols-3 gap-4">
            <TechInput label="DISTANCIA" value={distance} onChange={setDistance} unit={type === SportType.Swimming ? 'METROS' : 'KM'} />
            <TechInput label="TIEMPO" value={time} onChange={setTime} unit="MIN" />
            <TechInput label="PULSACIONES" value={heartRate} onChange={setHeartRate} unit="BPM" />
          </div>
        )}

        <div className="space-y-2">
           <label className="text-[10px] font-black text-dim uppercase tracking-widest ml-1">Notas de la Sesión</label>
           <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-input-custom border border-main p-4 text-xs font-bold text-bright outline-none focus:border-accent h-24 resize-none rounded-xl" placeholder="Observaciones, sensaciones..." />
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button type="submit" className="flex-1 bg-accent text-white font-black py-4 rounded-xl text-xs tracking-[0.2em] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase">
            <Save size={16}/> Sincronizar Registro
          </button>
          <button type="button" onClick={onCancel} className="flex-1 panel-custom border-red-500/20 text-red-500 font-black py-4 rounded-xl text-xs tracking-[0.2em] hover:border-red-500 transition-all flex items-center justify-center gap-2 uppercase">
            <Power size={16}/> Abortar
          </button>
        </div>
      </form>
    </div>
  );
};

const ModalButton = ({ active, onClick, label }: any) => (
  <button 
    type="button" 
    onClick={onClick} 
    className={`py-3 px-2 text-[9px] font-black border transition-all rounded-xl uppercase tracking-tighter ${active ? 'bg-accent border-accent text-white shadow-md' : 'panel-custom text-dim hover:border-accent'}`}
  >
    {label}
  </button>
);

const MiniInput = ({ label, value, onChange, color = "accent-color" }: any) => (
  <div className="text-center">
    <p className="text-[8px] font-black text-dim uppercase mb-1 tracking-widest">{label}</p>
    <input 
      type="number" 
      value={value ?? 0} 
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)} 
      className={`w-14 bg-input-custom border border-main text-center text-xs font-black p-2 rounded-lg focus:border-accent outline-none ${color}`} 
    />
  </div>
);

const TechInput = ({ label, value, onChange, unit }: any) => (
  <div className="panel-custom p-4 rounded-xl group hover:border-accent transition-all">
    <div className="flex justify-between items-center mb-2">
      <span className="text-[9px] font-black text-dim tracking-widest uppercase">{label}</span>
      <span className="text-[8px] font-black accent-color opacity-50 uppercase">{unit}</span>
    </div>
    <input type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-xl font-black text-bright outline-none" />
  </div>
);

export default WorkoutLogger;
